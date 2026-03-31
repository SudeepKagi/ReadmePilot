const axios = require('axios')
const User = require('../models/User.js')
const { decrypt } = require('../utils/crypto.js')

// Get a user's decrypted GitHub access token from DB
async function getAccessToken(userId) {
    const user = await User.findById(userId)
    return decrypt(user.encryptedToken)
}

// Fetch a single file's content from GitHub
// Returns the text content, or null if file doesn't exist
async function fetchFile(accessToken, repoFullName, filePath) {
    try {
        const res = await axios.get(
            `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        // GitHub returns file content as base64
        return Buffer.from(res.data.content, 'base64').toString('utf8')
    } catch (err) {
        // 404 just means the file doesn't exist — that's fine
        if (err.response?.status === 404) return null
        throw err
    }
}

// Fetch the top-level folder structure of the repo
// Returns a string like: "src/  package.json  README.md  Dockerfile"
async function fetchRepoTree(accessToken, repoFullName, defaultBranch) {
    const res = await axios.get(
        `https://api.github.com/repos/${repoFullName}/git/trees/${defaultBranch}`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { recursive: 1 }
        }
    )

    // Only keep the first 60 files to avoid overwhelming the AI
    return res.data.tree
        .slice(0, 60)
        .map(item => item.path)
        .join('\n')
}

// Commit the generated README back to the repo
// If README already exists, this updates it. If not, creates it.
async function commitReadme(accessToken, repoFullName, defaultBranch, content) {
    const path = 'README.md'
    const url = `https://api.github.com/repos/${repoFullName}/contents/${path}`

    // Check if README already exists (we need its SHA to update it)
    let sha = undefined
    try {
        const existing = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        sha = existing.data.sha
    } catch (err) {
        // 404 = no README yet, that's fine — we'll create it
        if (err.response?.status !== 404) throw err
    }

    // Commit the README (create or update)
    await axios.put(
        url,
        {
            message: 'docs: auto-update README [ReadmePilot]',
            content: Buffer.from(content).toString('base64'),
            branch: defaultBranch,
            // sha is required when updating an existing file
            ...(sha && { sha })
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )
}

module.exports = { getAccessToken, fetchFile, fetchRepoTree, commitReadme }