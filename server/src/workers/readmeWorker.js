const { Worker } = require('bullmq')
const { getRedisConnection } = require('../queue/redis.js')

// This is the worker — it sits and waits for jobs
// When a job arrives it calls the processJob function
const worker = new Worker(
    'readme-generation',  // must match queue name exactly
    async (job) => {
        // job.data contains everything we passed when adding the job
        const { repoFullName, repoId, pusherName, commits } = job.data

        console.log(`Processing job for repo: ${repoFullName}`)
        console.log(`Pushed by: ${pusherName}`)
        console.log(`Commits: ${commits.length}`)

        // TODO Week 3: fetch repo files, call Claude, generate README
        // For now just log — we'll fill this in next week
        console.log(`Job ${job.id} completed for ${repoFullName}`)
    },
    {
        connection: getRedisConnection(),
        // Process one job at a time
        // Increase this later if you want parallel processing
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