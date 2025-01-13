
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB with error handling
(async () => {
    try {
        await mongoose.connect(config.mongoURI, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
})();

// Basic route
app.get('/', (req, res) => {
    res.send('AI Music Platform Backend');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Internal Server Error' });
});

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
