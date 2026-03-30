require('dotenv').config()

const express = require('express')
const session = require('express-session')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth.js')
const repoRoutes = require('./routes/repos.js')

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}))

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err))

app.use('/auth', authRoutes)
app.use('/api', repoRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})