const crypto = require('crypto')

const ALGORITHM = 'aes-256-gcm'

function encrypt(plainText) {
    const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8')
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

function decrypt(encryptedText) {
    const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8')
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

module.exports = { encrypt, decrypt }