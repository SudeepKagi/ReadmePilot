const express = require('express')
const crypto = require('crypto')
const { readmeQueue } = require('../queue/index.js')
const Repo = require('../models/Repo.js')

const router = express.Router()

// POST /webhook/github — GitHub calls this on every push
router.post('/github', async (req, res) => {

    // STEP 1: Verify the request is really from GitHub
    const signature = req.headers['x-hub-signature-256']

    if (!signature) {
        console.warn('Webhook received without signature — rejected')
        return res.status(401).json({ error: 'No signature' })
    }

    // Recompute what the signature should be
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex')

    // Use timing-safe comparison — prevents timing attacks
    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        console.warn('Webhook signature mismatch — rejected')
        return res.status(401).json({ error: 'Invalid signature' })
    }

    // STEP 2: Parse the payload
    const payload = req.body

    // GitHub sends different events — we only care about push
    const event = req.headers['x-github-event']
    if (event !== 'push') {
        return res.status(200).json({ message: 'Event ignored' })
    }

    // FIX: Ignore commits made by ReadmePilot itself
    // Without this: we commit README → GitHub fires webhook → we commit again → infinite loop
    const commitMessages = payload.commits?.map(c => c.message) || []
    const isAutoCommit = commitMessages.every(msg => msg.includes('[ReadmePilot]'))
    if (isAutoCommit) {
        console.log('Auto-commit detected — skipping to prevent loop')
        return res.status(200).json({ message: 'Auto-commit ignored' })
    }

    // Ignore pushes to non-default branches
    const branch = payload.ref?.replace('refs/heads/', '')
    const repoFullName = payload.repository?.full_name

    console.log(`Push received: ${repoFullName} on branch ${branch}`)

    // STEP 3: Check if this repo is connected in our system
    const repo = await Repo.findOne({
        repoFullName,
        isActive: true
    })

    if (!repo) {
        console.log(`Repo ${repoFullName} not found in DB — ignoring`)
        return res.status(200).json({ message: 'Repo not connected' })
    }

    // Only process pushes to the default branch
    if (branch !== repo.defaultBranch) {
        console.log(`Push to non-default branch ${branch} — ignoring`)
        return res.status(200).json({ message: 'Non-default branch ignored' })
    }

    // STEP 4: Add job to queue
    await readmeQueue.add(
        'generate-readme',
        {
            repoId: repo._id,
            repoFullName,
            userId: repo.userId,
            defaultBranch: repo.defaultBranch,
            pusherName: payload.pusher?.name,
            commits: payload.commits?.map(c => ({
                id: c.id,
                message: c.message,
                added: c.added,
                modified: c.modified,
                removed: c.removed
            })) || []
        },
        {
            jobId: `${repoFullName}-${Date.now()}`
        }
    )

    console.log(`Job queued for ${repoFullName}`)

    // STEP 5: Respond to GitHub immediately
    res.status(200).json({ message: 'Job queued' })
})

module.exports = router