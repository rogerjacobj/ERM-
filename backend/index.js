const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');


dotenv.config();
console.log(process.env.MONGO_URI);

const app = express();

app.use(express.json());
// Allow frontend dev server to call this API during development
app.use(cors({ origin: true }));

// Simple health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Mock login endpoint for local development and frontend testing
// Accepts { email, password, role } and returns a simple token + user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body || {}
        if (!email || !password) return res.status(400).json({ message: 'email and password are required' })

        if (!db) return res.status(500).json({ message: 'Database not connected' })

        const user = await db.collection('employees').findOne({ email })
        if (!user) return res.status(401).json({ message: 'Invalid credentials' })

        // Plaintext compare (testing only)
        if (password !== user.password) return res.status(401).json({ message: 'Invalid credentials' })

        const payload = { email: user.email, role: user.role || 'employee', iat: Date.now() }
        const token = Buffer.from(JSON.stringify(payload)).toString('base64')

        return res.json({
            token,
            user: { email: user.email, role: user.role, name: user.name, id: user.id }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Login failed' })
    }
})

// Simple middleware to check our mock token
function ensureAuth(req, res, next) {
    const auth = req.headers.authorization || ''
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' })
    const token = auth.slice(7)
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
        req.user = payload
        return next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

// Employee data endpoint (protected)
app.get('/api/employee-data', ensureAuth, (req, res) => {
    // Only employees or HR can access; HR may get broader data
    const { role, email } = req.user || {}
    if (role !== 'employee' && role !== 'hr') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    // Dummy employee-specific payload
    const data = {
        welcome: `Welcome ${email}`,
        tasks: [
            { id: 1, title: 'Submit timesheet', due: '2025-10-20' },
            { id: 2, title: 'Complete safety training', due: '2025-11-01' },
        ],
        announcements: [
            { id: 1, text: 'Office closed on 31st Oct for maintenance' }
        ]
    }

    return res.json({ role, data })
})

// HR data endpoint (protected)
app.get('/api/hr-data', ensureAuth, (req, res) => {
    const { role } = req.user || {}
    if (role !== 'hr') return res.status(403).json({ message: 'Only HR can access this' })

    // Dummy HR payload
    const hr = {
        openPositions: [
            { id: 'p-1', title: 'Frontend Engineer', applicants: 12 },
            { id: 'p-2', title: 'Office Manager', applicants: 3 },
        ],
        employees: [
            { id: 'e-1', name: 'Alice Johnson', email: 'alice@company.com' },
            { id: 'e-2', name: 'Bob Smith', email: 'bob@company.com' },
        ]
    }

    return res.json({ role, hr })
})

const fs = require('fs')
const path = require('path')

// --- MongoDB integration and migration from JSON files ---
const { MongoClient } = require('mongodb')

// Provide MONGO_URI in backend/.env or the code will fall back to the string you gave
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://RJ10v:rogerjacob2007v@cluster0.05uceuj.mongodb.net/?appName=Cluster0'
const MONGO_DB = process.env.MONGO_DB || 'erm'

const client = new MongoClient(MONGO_URI, {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 10000
})
let db = null

const EMPLOYEES_FILE = path.join(__dirname, 'employees.json')
const TICKETS_FILE = path.join(__dirname, 'tickets.json')

async function connectAndSeed() {
    await client.connect()
    db = client.db(MONGO_DB)
    console.log('Connected to MongoDB, db:', MONGO_DB)

    // seed employees if collection empty
    const empCount = await db.collection('employees').countDocuments()
    if (empCount === 0) {
        try {
            const raw = fs.readFileSync(EMPLOYEES_FILE, 'utf8')
            const arr = JSON.parse(raw)
            if (Array.isArray(arr) && arr.length) {
                // ensure documents have id property if needed
                await db.collection('employees').insertMany(arr.map(e => ({ ...e })))
                console.log('Seeded employees collection from', EMPLOYEES_FILE)
            }
        } catch (err) {
            console.log('No employees seed file or parsing failed:', err.message)
        }
    }

    // seed tickets if collection empty
    const ticketsCount = await db.collection('tickets').countDocuments()
    if (ticketsCount === 0) {
        try {
            const raw = fs.readFileSync(TICKETS_FILE, 'utf8')
            const obj = JSON.parse(raw)
            const docs = []
            for (const [email, list] of Object.entries(obj || {})) {
                for (const t of list) {
                    docs.push({ ...t, ownerEmail: email })
                }
            }
            if (docs.length) {
                await db.collection('tickets').insertMany(docs)
                console.log('Seeded tickets collection from', TICKETS_FILE)
            }
        } catch (err) {
            console.log('No tickets seed file or parsing failed:', err.message)
        }
    }
}

// Replace previous in-memory / file-backed routes with DB-backed operations

// List all employees (HR only)
app.get('/api/employees', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user || {}
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can access employee list' })
        const employees = await db.collection('employees').find().toArray()
        return res.json({ employees })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch employees' })
    }
})

// Add new employee (HR only)
app.post('/api/employees', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user || {}
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can add employees' })

        const { email, name, department, employeeRole } = req.body || {}
        if (!email || !name || !employeeRole) {
            return res.status(400).json({ message: 'email, name, and employeeRole are required' })
        }

        const existing = await db.collection('employees').findOne({ email })
        if (existing) return res.status(409).json({ message: 'Employee with this email already exists' })

        const employee = {
            id: `emp-${Date.now()}`,
            email,
            name,
            role: employeeRole,
            department: department || 'General',
            createdAt: new Date().toISOString(),
            status: 'active'
        }

        await db.collection('employees').insertOne(employee)
        return res.status(201).json({ employee })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to add employee' })
    }
})

// Remove employee (HR only)
app.delete('/api/employees/:id', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user || {}
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can remove employees' })

        const { id } = req.params
        const result = await db.collection('employees').findOneAndDelete({ id })
        if (!result.value) return res.status(404).json({ message: 'Employee not found' })
        return res.json({ employee: result.value })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to remove employee' })
    }
})

// Get tickets for the logged-in user
app.get('/api/employee-tickets', ensureAuth, async (req, res) => {
    try {
        const { email, role } = req.user || {}
        // HR can pass ?userEmail= to fetch another user's tickets
        const queryEmail = req.query.userEmail
        const target = role === 'hr' && queryEmail ? queryEmail : email
        const tickets = await db.collection('tickets').find({ ownerEmail: target }).toArray()
        return res.json({ tickets })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch tickets' })
    }
})

// Create a ticket for the logged-in user
app.post('/api/employee-tickets', ensureAuth, async (req, res) => {
    try {
        const { email } = req.user || {}
        const { title, description, category } = req.body || {}
        if (!title || !description) return res.status(400).json({ message: 'title and description required' })

        const ticket = {
            id: `t-${Date.now()}`,
            title,
            description,
            category: category || 'general',
            status: 'open',
            createdAt: new Date().toISOString(),
            ownerEmail: email
        }

        await db.collection('tickets').insertOne(ticket)
        return res.status(201).json({ ticket })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to create ticket' })
    }
})

// Update a ticket (status, description, category) - accessible to owner or HR
app.patch('/api/employee-tickets/:id', ensureAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { email: requesterEmail, role } = req.user || {}
        const { status, description, category } = req.body || {}

        const ticket = await db.collection('tickets').findOne({ id })
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' })

        if (ticket.ownerEmail !== requesterEmail && role !== 'hr') return res.status(403).json({ message: 'Forbidden' })

        const update = {}
        if (status) update.status = status
        if (description) update.description = description
        if (category) update.category = category

        if (Object.keys(update).length) {
            await db.collection('tickets').updateOne({ id }, { $set: update })
        }

        const updated = await db.collection('tickets').findOne({ id })
        return res.json({ ticket: updated })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to update ticket' })
    }
})

// HR-only: list all tickets across users
app.get('/api/all-tickets', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user || {}
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can access this' })
        const tickets = await db.collection('tickets').find().toArray()
        const ticketsByUser = tickets.reduce((acc, t) => {
            acc[t.ownerEmail] = acc[t.ownerEmail] || []
            acc[t.ownerEmail].push(t)
            return acc
        }, {})
        return res.json({ ticketsByUser })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch all tickets' })
    }
})

// --- Attendance (MongoDB) ---
// Get attendance records (employee: own; HR: all or filtered by employeeEmail)
app.get('/api/attendance', ensureAuth, async (req, res) => {
    try {
        const { email, role } = req.user || {}
        const { employeeEmail, from, to } = req.query || {}
        const filter = {}
        if (role === 'hr' && employeeEmail) filter.employeeEmail = employeeEmail
        else if (role !== 'hr') filter.employeeEmail = email

        if (from || to) {
            filter.date = {}
            if (from) filter.date.$gte = from
            if (to) filter.date.$lte = to
        }

        const records = await db.collection('attendance').find(filter).sort({ date: -1, checkIn: -1 }).limit(100).toArray()
        return res.json({ attendance: records })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch attendance' })
    }
})

// Clock in
app.post('/api/attendance/clock-in', ensureAuth, async (req, res) => {
    try {
        const { email } = req.user || {}
        const today = new Date().toISOString().slice(0, 10)
        const existing = await db.collection('attendance').findOne({ employeeEmail: email, date: today, checkOut: null })
        if (existing) return res.status(400).json({ message: 'Already clocked in today. Clock out first.' })

        const record = {
            id: `att-${Date.now()}`,
            employeeEmail: email,
            date: today,
            checkIn: new Date().toISOString(),
            checkOut: null,
            status: 'present',
            notes: ''
        }
        await db.collection('attendance').insertOne(record)
        return res.status(201).json({ attendance: record })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to clock in' })
    }
})

// Clock out
app.patch('/api/attendance/clock-out', ensureAuth, async (req, res) => {
    try {
        const { email } = req.user || {}
        const today = new Date().toISOString().slice(0, 10)
        const record = await db.collection('attendance').findOne({ employeeEmail: email, date: today, checkOut: null })
        if (!record) return res.status(400).json({ message: 'No active clock-in found for today' })

        const { notes } = req.body || {}
        const update = { checkOut: new Date().toISOString(), status: 'complete' }
        if (typeof notes === 'string') update.notes = notes
        await db.collection('attendance').updateOne({ id: record.id }, { $set: update })
        const updated = await db.collection('attendance').findOne({ id: record.id })
        return res.json({ attendance: updated })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to clock out' })
    }
})

// Get today's attendance status
app.get('/api/attendance/today', ensureAuth, async (req, res) => {
    try {
        const { email } = req.user || {}
        const today = new Date().toISOString().slice(0, 10)
        const record = await db.collection('attendance').findOne({ employeeEmail: email, date: today })
        return res.json({ attendance: record || null })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch attendance' })
    }
})

// HR: list all attendance (optionally filter by employee)
app.get('/api/attendance/all', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user || {}
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can access' })
        const { employeeEmail, from, to } = req.query || {}
        const filter = {}
        if (employeeEmail) filter.employeeEmail = employeeEmail
        if (from || to) {
            filter.date = {}
            if (from) filter.date.$gte = from
            if (to) filter.date.$lte = to
        }
        const attendance = await db.collection('attendance').find(filter).sort({ date: -1, checkIn: -1 }).limit(200).toArray()
        return res.json({ attendance })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch attendance' })
    }
})

// --- Job Progress Tracker (MongoDB) ---
// Get jobs (employee: own; HR: all)
app.get('/api/jobs', ensureAuth, async (req, res) => {
    try {
        const { email, role } = req.user || {}
        const filter = role === 'hr' ? {} : { assigneeEmail: email }
        const jobs = await db.collection('jobs').find(filter).sort({ createdAt: -1 }).toArray()
        return res.json({ jobs })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch jobs' })
    }
})

// Create job (HR only)
app.post('/api/jobs', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user || {}
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can create jobs' })
        const { title, description, assigneeEmail } = req.body || {}
        if (!title || !assigneeEmail) return res.status(400).json({ message: 'title and assigneeEmail required' })

        const job = {
            id: `job-${Date.now()}`,
            title,
            description: description || '',
            assigneeEmail,
            progress: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        await db.collection('jobs').insertOne(job)
        return res.status(201).json({ job })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to create job' })
    }
})

// Update job progress (employee or HR)
app.patch('/api/jobs/:id', ensureAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { email, role } = req.user || {}
        const { progress, status } = req.body || {}

        const job = await db.collection('jobs').findOne({ id })
        if (!job) return res.status(404).json({ message: 'Job not found' })
        if (job.assigneeEmail !== email && role !== 'hr') return res.status(403).json({ message: 'Forbidden' })

        const update = { updatedAt: new Date().toISOString() }
        if (typeof progress === 'number' && progress >= 0 && progress <= 100) update.progress = progress
        if (status && ['pending', 'in-progress', 'completed'].includes(status)) update.status = status

        if (Object.keys(update).length > 1) {
            await db.collection('jobs').updateOne({ id }, { $set: update })
        }
        const updated = await db.collection('jobs').findOne({ id })
        return res.json({ job: updated })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to update job' })
    }
})

// Start server after DB connected & optionally seeded
const PORT = process.env.PORT || 8080;
connectAndSeed()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch(err => {
        console.error('Failed to connect to DB before starting server:', err)
        process.exit(1)
    })