
// Backend Server - server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build (for production)
app.use(express.static(path.join(__dirname, 'build')));

// API Routes
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!', 
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

// Flight route optimization endpoints
app.get('/api/airports', (req, res) => {
    // Your airports.js logic here
    res.json({
        airports: [
            { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
            { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
            { code: 'ORD', name: 'O\'Hare International', city: 'Chicago' }
        ]
    });
});

app.post('/api/optimize-route', (req, res) => {
    const { origin, destination, preferences } = req.body;
    
    // Your optimization.js logic here
    res.json({
        optimizedRoute: {
            origin,
            destination,
            distance: '2,475 miles',
            duration: '5h 30m',
            cost: '$299',
            stops: []
        },
        alternatives: [],
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Catch all handler for React routing (production)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend served at http://localhost:${PORT}`);
});

module.exports = app;
