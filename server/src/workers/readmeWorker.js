const { Worker } = require('bullmq')
const { getRedisConnection } = require('../queue/redis.js')
const { getAccessToken, fetchFile, fetchRepoTree, commitReadme } = require('../services/githubService.js')
const { generateReadme } = require('../services/aiService.js')
const { parseSections, hashContent } = require('../services/readmeParser.js')
const Repo = require('../models/Repo.js')

const worker = new Worker(
    'readme-generation',
    async (job) => {
        const { repoFullName, repoId, userId, defaultBranch, pusherName, commits } = job.data

        console.log(`\n--- Processing: ${repoFullName} (pushed by ${pusherName}) ---`)

        // STEP 1: Get the user's GitHub token
        const accessToken = await getAccessToken(userId)

        // STEP 2: Fetch key files from the repo
        console.log('Fetching repo files...')
        const [tree, packageJson, envExample, dockerfile] = await Promise.all([
            fetchRepoTree(accessToken, repoFullName, defaultBranch),
            fetchFile(accessToken, repoFullName, 'package.json'),
            fetchFile(accessToken, repoFullName, '.env.example'),
            fetchFile(accessToken, repoFullName, 'Dockerfile')
        ])

        // Get repo description from GitHub
        const { default: axios } = await import('axios')
        const repoInfo = await axios.get(`https://api.github.com/repos/${repoFullName}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        const description = repoInfo.data.description

        // STEP 3: Generate README with Claude
        console.log('Calling Claude API...')
        const readmeContent = await generateReadme({
            repoName: repoFullName.split('/')[1],
            description,
            tree,
            packageJson,
            envExample,
            dockerfile
        })

        // STEP 4: Parse into sections and log them
        const sections = parseSections(readmeContent)
        console.log(`Generated ${sections.length} sections:`, sections.map(s => s.name))

        // STEP 5: Commit README back to the repo
        console.log('Committing README...')
        await commitReadme(accessToken, repoFullName, defaultBranch, readmeContent)

        // STEP 6: Update the repo record in DB
        await Repo.findByIdAndUpdate(repoId, {
            lastGeneratedAt: new Date(),
            healthScore: Math.min(sections.length * 10, 100) // rough score for now
        })

        console.log(`✓ README committed to ${repoFullName}`)
        console.log(`  Sections: ${sections.map(s => s.name).join(', ')}`)
        console.log(`  Health score: ${Math.min(sections.length * 10, 100)}`)
    },
    {
        connection: getRedisConnection(),
        concurrency: 1
    }
)

worker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
    console.error(`✗ Job ${job.id} failed:`, err.message)
})

module.exports = { worker }