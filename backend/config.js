require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5003,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/ai-music',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development'
};
