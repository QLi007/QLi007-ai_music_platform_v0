require('dotenv').config();

const config = {
    port: process.env.PORT || 5001,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/ai-music',
    env: process.env.NODE_ENV || 'development'
};

module.exports = config;
