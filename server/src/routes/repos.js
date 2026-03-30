const express = require('express')
const axios = require('axios')
const User = require('../models/User.js')
const { decrypt } = require('../utils/crypto.js')

const router = express.Router()

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in first' })
    }
    next()
}

router.get('/repos', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const accessToken = decrypt(user.encryptedToken)

        const reposRes = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { sort: 'updated', per_page: 30, type: 'owner' }
        })

        const repos = reposRes.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            isPrivate: repo.private,
            defaultBranch: repo.default_branch,
            updatedAt: repo.updated_at,
            stars: repo.stargazers_count,
            language: repo.language
        }))

        res.json(repos)
    } catch (err) {
        console.error('Repos fetch error:', err.message)
        res.status(500).json({ error: 'Failed to fetch repos' })
    }
})

module.exports = router