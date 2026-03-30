// This file handles all communication with your backend
// We keep all API calls here so if the URL changes,
// we only update one file — not every component

import axios from 'axios'

// Your backend URL — from .env file
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create an axios instance with default settings
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true  // send cookies with every request (needed for sessions)
})

// Check if user is logged in
export const getMe = () => api.get('/auth/me')

// Get user's GitHub repos
export const getRepos = () => api.get('/api/repos')

// Logout
export const logout = () => api.post('/auth/logout')

export default api