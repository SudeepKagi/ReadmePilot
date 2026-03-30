const { Queue } = require('bullmq')
const { getRedisConnection } = require('./redis.js')

// Create the queue — think of this as the "to-do list"
// Workers will pick jobs from this list
const readmeQueue = new Queue('readme-generation', {
    connection: getRedisConnection(),
    defaultJobOptions: {
        // If a job fails, retry up to 3 times
        attempts: 3,
        backoff: {
            type: 'exponential', // wait 1s, then 2s, then 4s between retries
            delay: 1000
        },
        // Remove completed jobs after 24 hours (keeps Redis clean)
        removeOnComplete: { age: 24 * 60 * 60 },
        // Keep failed jobs for 7 days so you can debug them
        removeOnFail: { age: 7 * 24 * 60 * 60 }
    }
})

module.exports = { readmeQueue }