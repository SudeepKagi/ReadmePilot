const mongoose = require('mongoose')

const repoSchema = new mongoose.Schema({
    // Which user connected this repo
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // GitHub repo details
    githubRepoId: { type: String, required: true },
    repoName: { type: String, required: true },      // e.g. "auth-service"
    repoFullName: { type: String, required: true },  // e.g. "sudeep/auth-service"
    defaultBranch: { type: String, default: 'main' },

    // Webhook info — stored so we can delete the webhook later
    webhookId: { type: String },

    // Is this repo actively connected?
    isActive: { type: Boolean, default: true },

    // When was the README last generated
    lastGeneratedAt: { type: Date },

    // README health score (0-100)
    healthScore: { type: Number, default: 0 }

}, { timestamps: true })

module.exports = mongoose.model('Repo', repoSchema)