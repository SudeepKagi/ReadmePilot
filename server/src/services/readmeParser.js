const crypto = require('crypto')

// Split a README into sections by ## headings
// Returns array of: { name, content }
// Example: [{ name: "Overview", content: "## Overview\n..." }, ...]
function parseSections(readmeContent) {
    const lines = readmeContent.split('\n')
    const sections = []
    let currentSection = null
    let currentLines = []

    for (const line of lines) {
        if (line.startsWith('## ')) {
            // Save previous section if exists
            if (currentSection) {
                sections.push({
                    name: currentSection,
                    content: currentLines.join('\n').trim()
                })
            }
            // Start new section
            currentSection = line.replace('## ', '').trim()
            currentLines = [line]
        } else {
            currentLines.push(line)
        }
    }

    // Don't forget the last section
    if (currentSection) {
        sections.push({
            name: currentSection,
            content: currentLines.join('\n').trim()
        })
    }

    return sections
}

// Compute a short hash of a string
// Used to detect if a section's content has changed
function hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)
}

module.exports = { parseSections, hashContent }