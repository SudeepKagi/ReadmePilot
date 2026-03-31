const express = require('express')
const axios = require('axios')
const User = require('../models/User.js')
const Repo = require('../models/Repo.js')
const { decrypt } = require('../utils/crypto.js')
const { readmeQueue } = require('../queue/index.js')

const router = express.Router()

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Please log in first' })
    next()
}

// GET /api/repos
router.get('/repos', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)

        const reposRes = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { sort: 'updated', per_page: 30, type: 'owner' }
        })

        const connectedRepos = await Repo.find({ userId: req.session.userId, isActive: true })
        const connectedMap = {}
        connectedRepos.forEach(r => { connectedMap[r.githubRepoId] = r })

        const repos = reposRes.data.map(repo => {
            const connected = connectedMap[String(repo.id)]
            return {
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                isPrivate: repo.private,
                defaultBranch: repo.default_branch,
                updatedAt: repo.updated_at,
                stars: repo.stargazers_count,
                language: repo.language,
                isConnected: !!connected,
                // Include MongoDB fields if connected
                _id: connected?._id,
                webhookId: connected?.webhookId,
                lastGeneratedAt: connected?.lastGeneratedAt,
                healthScore: connected?.healthScore,
                repoName: connected?.repoName,
                repoFullName: connected?.repoFullName,
            }
        })

        res.json(repos)
    } catch (err) {
        console.error('Repos fetch error:', err.message)
        res.status(500).json({ error: 'Failed to fetch repos' })
    }
})

// POST /api/repos/:repoId/connect
router.post('/repos/:repoId/connect', requireAuth, async (req, res) => {
    const { repoId } = req.params
    try {
        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)
        const { fullName, defaultBranch } = req.body

        const webhookRes = await axios.post(
            `https://api.github.com/repos/${fullName}/hooks`,
            {
                name: 'web', active: true, events: ['push'],
                config: {
                    url: `${process.env.SERVER_URL}/webhook/github`,
                    content_type: 'json',
                    secret: process.env.WEBHOOK_SECRET,
                    insecure_ssl: '0'
                }
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const repo = await Repo.findOneAndUpdate(
            { githubRepoId: String(repoId), userId: req.session.userId },
            {
                userId: req.session.userId,
                githubRepoId: String(repoId),
                repoName: fullName.split('/')[1],
                repoFullName: fullName,
                defaultBranch: defaultBranch || 'main',
                webhookId: String(webhookRes.data.id),
                isActive: true
            },
            { upsert: true, new: true }
        )

        res.json({ message: 'Repo connected successfully', repo })
    } catch (err) {
        console.error('Connect error:', err.response?.data || err.message)
        if (err.response?.status === 422) {
            return res.status(422).json({ error: 'Webhook already exists for this repo' })
        }
        res.status(500).json({ error: 'Failed to connect repo' })
    }
})

// DELETE /api/repos/:repoId/disconnect
router.delete('/repos/:repoId/disconnect', requireAuth, async (req, res) => {
    try {
        const repo = await Repo.findOne({ _id: req.params.repoId, userId: req.session.userId })
        if (!repo) return res.status(404).json({ error: 'Repo not found' })

        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)

        if (repo.webhookId) {
            try {
                await axios.delete(
                    `https://api.github.com/repos/${repo.repoFullName}/hooks/${repo.webhookId}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                )
            } catch (err) {
                console.warn('Webhook delete failed (may already be removed):', err.response?.status)
            }
        }

        await Repo.findByIdAndUpdate(repo._id, { isActive: false, webhookId: null })
        res.json({ message: 'Disconnected successfully' })
    } catch (err) {
        console.error('Disconnect error:', err.message)
        res.status(500).json({ error: 'Failed to disconnect' })
    }
})

// GET /api/repos/:repoId/readme
router.get('/repos/:repoId/readme', requireAuth, async (req, res) => {
    try {
        const repo = await Repo.findOne({ _id: req.params.repoId, userId: req.session.userId })
        if (!repo) return res.status(404).json({ error: 'Repo not found' })

        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)

        const response = await axios.get(
            `https://api.github.com/repos/${repo.repoFullName}/contents/README.md`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const content = Buffer.from(response.data.content, 'base64').toString('utf8')
        res.json({ content })
    } catch (err) {
        if (err.response?.status === 404) return res.status(404).json({ error: 'No README found' })
        res.status(500).json({ error: 'Failed to fetch README' })
    }
})

// POST /api/repos/:repoId/regenerate
router.post('/repos/:repoId/regenerate', requireAuth, async (req, res) => {
    try {
        const repo = await Repo.findOne({ _id: req.params.repoId, userId: req.session.userId })
        if (!repo) return res.status(404).json({ error: 'Repo not found' })

        await readmeQueue.add(
            'generate-readme',
            {
                repoId: repo._id,
                repoFullName: repo.repoFullName,
                userId: repo.userId,
                defaultBranch: repo.defaultBranch,
                pusherName: 'manual',
                commits: []
            },
            { jobId: `${repo.repoFullName}-manual-${Date.now()}` }
        )

        res.json({ message: 'Job queued' })
    } catch (err) {
        console.error('Regenerate error:', err.message)
        res.status(500).json({ error: 'Failed to queue job' })
    }
})

module.exports = router