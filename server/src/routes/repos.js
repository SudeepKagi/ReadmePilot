const express = require('express')
const axios = require('axios')
const User = require('../models/User.js')
const Repo = require('../models/Repo.js')
const { decrypt } = require('../utils/crypto.js')

const router = express.Router()

// Middleware — check login
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in first' })
    }
    next()
}

// GET /api/repos — list user's GitHub repos
router.get('/repos', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)

        const reposRes = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { sort: 'updated', per_page: 30, type: 'owner' }
        })

        // Also get which repos are already connected
        const connectedRepos = await Repo.find({
            userId: req.session.userId,
            isActive: true
        })
        const connectedIds = connectedRepos.map(r => r.githubRepoId)

        const repos = reposRes.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            isPrivate: repo.private,
            defaultBranch: repo.default_branch,
            updatedAt: repo.updated_at,
            stars: repo.stargazers_count,
            language: repo.language,
            // Tell frontend if this repo is already connected
            isConnected: connectedIds.includes(String(repo.id))
        }))

        res.json(repos)
    } catch (err) {
        console.error('Repos fetch error:', err.message)
        res.status(500).json({ error: 'Failed to fetch repos' })
    }
})

// POST /api/repos/:repoId/connect — register webhook on a repo
router.post('/repos/:repoId/connect', requireAuth, async (req, res) => {
    const { repoId } = req.params

    try {
        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)

        // Get the specific repo details from GitHub
        const { fullName, defaultBranch } = req.body

        // Register webhook on GitHub
        // This tells GitHub: "call my server when someone pushes to this repo"
        const webhookRes = await axios.post(
            `https://api.github.com/repos/${fullName}/hooks`,
            {
                name: 'web',
                active: true,
                events: ['push'],  // only trigger on push events
                config: {
                    // GitHub will POST to this URL on every push
                    url: `${process.env.SERVER_URL}/webhook/github`,
                    content_type: 'json',
                    secret: process.env.WEBHOOK_SECRET,  // for HMAC verification
                    insecure_ssl: '0'
                }
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        // Save the connected repo to our database
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

        res.json({
            message: 'Repo connected successfully',
            repo: {
                id: repo._id,
                repoFullName: repo.repoFullName,
                webhookId: repo.webhookId
            }
        })

    } catch (err) {
        console.error('Connect error:', err.response?.data || err.message)

        // GitHub returns 422 if webhook already exists
        if (err.response?.status === 422) {
            return res.status(422).json({ error: 'Webhook already exists for this repo' })
        }

        res.status(500).json({ error: 'Failed to connect repo' })
    }
})

module.exports = router