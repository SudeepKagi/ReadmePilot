const { Redis } = require('ioredis')

let connection = null

// Singleton pattern — reuse one connection instead of
// creating a new one every time
function getRedisConnection() {
    if (!connection) {
        connection = new Redis(process.env.REDIS_URL, {
            // Upstash requires TLS
            tls: { rejectUnauthorized: false },
            // Don't crash if Redis is briefly unavailable
            maxRetriesPerRequest: null,
            enableReadyCheck: false
        })

        connection.on('connect', () => console.log('Redis connected'))
        connection.on('error', (err) => console.error('Redis error:', err.message))
    }
    return connection
}

module.exports = { getRedisConnection }