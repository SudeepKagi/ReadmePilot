const express = require('express')
const axios = require('axios')
const User = require('../models/User.js')
const { encrypt } = require('../utils/crypto.js')

const router = express.Router()

// routes/auth.js — update the scope line
router.get('/github', (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        // ADD write:repo_hook to the scopes
        scope: 'read:user user:email repo write:repo_hook'
    })
    res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.get('/github/callback', async (req, res) => {
    const { code } = req.query
    if (!code) return res.redirect(`${process.env.CLIENT_URL}?error=no_code`)

    try {
        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            { headers: { Accept: 'application/json' } }
        )

        const accessToken = tokenRes.data.access_token
        if (!accessToken) throw new Error('No access token received')

        const profileRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        const profile = profileRes.data
        const encryptedToken = encrypt(accessToken)

        const user = await User.findOneAndUpdate(
            { githubId: String(profile.id) },
            {
                githubId: String(profile.id),
                username: profile.login,
                email: profile.email,
                avatar: profile.avatar_url,
                encryptedToken
            },
            { upsert: true, new: true }
        )

        req.session.userId = user._id
        res.redirect(`${process.env.CLIENT_URL}/dashboard`)

    } catch (err) {
        console.error('OAuth error:', err.message)
        res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`)
    }
})

router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' })
    }
    try {
        const user = await User.findById(req.session.userId).select('-encryptedToken')
        if (!user) return res.status(401).json({ error: 'User not found' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy()
    res.json({ message: 'Logged out' })
})

module.exports = router