const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function generateReadme({ repoName, description, tree, packageJson, envExample, dockerfile }) {
    const prompt = `You are a technical documentation expert. Generate a professional GitHub README.

REPOSITORY CONTEXT:
<repo_name>${repoName}</repo_name>
<repo_description>${description || 'No description provided'}</repo_description>
<directory_structure>${tree}</directory_structure>
<package_json>${packageJson || 'Not found'}</package_json>
<env_example>${envExample || 'Not found'}</env_example>
<dockerfile>${dockerfile || 'Not found'}</dockerfile>

INSTRUCTIONS:
1. Generate a README with EXACTLY these sections using ## headings:
   - ## Overview
   - ## Tech Stack
   - ## Features
   - ## Prerequisites
   - ## Installation
   - ## Environment Variables (skip if no .env.example)
   - ## Usage
   - ## API Endpoints (skip if not a backend project)
   - ## Deployment
   - ## License

2. Be specific — use actual package names and commands from the context.
3. Do NOT make up features. Only document what is evident from the files.
4. Write exact shell commands that would actually work.
5. Keep each section concise but complete. No filler phrases like "robust" or "seamless".
6. Output ONLY raw markdown. No explanation, no preamble, no code fences wrapping the output.`

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',  // free, very capable
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
    })

    return completion.choices[0].message.content
}

module.exports = { generateReadme }