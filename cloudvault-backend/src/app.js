const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/files', require('./routes/file.routes'));

app.get('/', (req, res) => {
    res.send('CloudVault API is running');
});

// UptimeRobot / Health Check endpoints
app.head('/', (req, res) => res.status(200).end());
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.head('/ping', (req, res) => res.status(200).end());

module.exports = app;
