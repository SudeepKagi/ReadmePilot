const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    githubId: { type: String, required: true, unique: true },
    username: String,
    email: String,
    avatar: String,
    encryptedToken: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)