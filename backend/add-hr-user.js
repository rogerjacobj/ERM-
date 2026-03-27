const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

async function addHRUser() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        const db = client.db(MONGO_DB);
        
        const hrUser = {
            id: 'hr-001',
            email: 'hr@company.com',
            password: 'hr123',
            name: 'HR Manager',
            role: 'hr',
            department: 'Human Resources',
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        const result = await db.collection('employees').insertOne(hrUser);
        console.log('HR user added successfully:', result.insertedId);
        console.log('\nLogin credentials:');
        console.log('Email: hr@company.com');
        console.log('Password: hr123');
        console.log('Role: HR');
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.close();
    }
}

addHRUser();
