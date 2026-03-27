const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        const client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(process.env.MONGO_DB || 'erm');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
};

module.exports = { connectDB };
