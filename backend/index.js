const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer');

dotenv.config();
console.log(process.env.MONGO_URI);

const app = express();

app.use(express.json());
// Allow frontend dev server to call this API during development
app.use(cors({ origin: true }));

// ─── Firebase Admin SDK ───
const admin = require('firebase-admin');
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'erm-notifications-app',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  databaseURL: process.env.FIREBASE_DATABASE_URL || ''
};
let firebaseDb = null;
try {
  if (firebaseConfig.databaseURL && firebaseConfig.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey,
      }),
      databaseURL: firebaseConfig.databaseURL,
    });
    firebaseDb = admin.database();
    console.log('Firebase Admin initialized');
  } else {
    console.log('Firebase Admin skipped — missing config');
  }
} catch (err) {
  console.log('Firebase Admin init error:', err.message);
}

// ─── Nodemailer Transporter ───
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Helper: find all HR user emails from MongoDB
async function getHrEmails() {
  if (!db) return [];
  try {
    const hrUsers = await db.collection('employees').find({ role: 'hr' }).toArray();
    return hrUsers.map(u => u.email).filter(Boolean);
  } catch { return []; }
}
let mailTransporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  mailTransporter.verify().then(() => console.log('Email transporter ready')).catch(e => console.log('Email error:', e.message));
} else {
  console.log('Email skipped — missing EMAIL_USER/EMAIL_PASS');
}

// Helper: send email (non-blocking, logs errors)
async function sendMail(to, subject, html) {
  if (!mailTransporter) return;
  try {
    await mailTransporter.sendMail({ from: `"ERM System" <${EMAIL_USER}>`, to, subject, html });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) { console.error('Email send failed:', err.message); }
}

// Helper: push notification to Firebase Realtime DB
async function pushNotification(userEmail, notification) {
  const now = Date.now();
  const doc = {
    id: `notif-${now}-${Math.random().toString(36).slice(2,8)}`,
    targetEmail: userEmail,
    type: notification.type || 'info',
    title: notification.title || '',
    message: notification.message || '',
    ticketId: notification.ticketId || null,
    read: false,
    createdAt: new Date().toISOString(),
  };
  // Save to MongoDB
  try {
    if (db) await db.collection('notifications').insertOne(doc);
  } catch (err) { console.error('Notification DB save failed:', err.message); }
  // Push to Firebase Realtime DB
  if (firebaseDb) {
    try {
      const sanitized = userEmail.replace(/[.#$[\]]/g, '_');
      const ref = firebaseDb.ref(`notifications/${sanitized}`);
      await ref.push({ ...notification, timestamp: now, read: false });
      console.log(`Firebase notification pushed for ${userEmail}`);
    } catch (err) { console.error('Firebase push failed:', err.message); }
  }
}

// Simple health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Root health check for Render
app.get('/', (req, res) => res.send('ERM Backend is Online!'));

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

        // Send confirmation email to the employee
        console.log(`[EMAIL DEBUG] Sending ticket confirmation to: ${email}`)
        sendMail(email, 'Ticket Created — ERM System',
          `<h2>Your ticket has been submitted</h2>
           <p><b>Title:</b> ${title}</p>
           <p><b>Category:</b> ${category || 'general'}</p>
           <p><b>Description:</b> ${description}</p>
           <p>Ticket ID: <code>${ticket.id}</code></p>
           <p>We'll notify you when HR updates the status.</p>`
        )

        // Notify all HR users via email (fetched from MongoDB)
        getHrEmails().then(hrEmails => {
          hrEmails.forEach(hrEmail => {
            sendMail(hrEmail, `New Ticket from ${email}`,
              `<h2>New complaint ticket submitted</h2>
               <p><b>From:</b> ${email}</p>
               <p><b>Title:</b> ${title}</p>
               <p><b>Category:</b> ${category || 'general'}</p>
               <p><b>Description:</b> ${description}</p>`
            )
          })
        })

        // Push real-time notification to HR via Firebase
        pushNotification('hr_channel', {
          type: 'new_ticket', title: 'New Support Ticket',
          message: `${email} submitted: ${title}`,
          ticketId: ticket.id, category: ticket.category,
        })

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

        // Email + Firebase notification when status changes
        if (status && ['resolved','rejected','closed'].includes(status)) {
          const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
          sendMail(ticket.ownerEmail, `Ticket ${statusLabel} — ERM System`,
            `<h2>Your ticket has been ${statusLabel.toLowerCase()}</h2>
             <p><b>Title:</b> ${ticket.title}</p>
             <p><b>Status:</b> ${statusLabel}</p>
             <p><b>Ticket ID:</b> ${ticket.id}</p>
             <p>If you have questions, contact HR.</p>`
          )
          // Push notification to the employee
          pushNotification(ticket.ownerEmail, {
            type: 'ticket_update', title: `Ticket ${statusLabel}`,
            message: `Your ticket "${ticket.title}" has been ${statusLabel.toLowerCase()}.`,
            ticketId: ticket.id,
          })
        }

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

// ─────────────────────────────────────────────
// EMERGENCY COMPLAINTS  (max 2 per 14 days)
// ─────────────────────────────────────────────
const EMERGENCY_LIMIT = 2
const EMERGENCY_WINDOW_DAYS = 14

// Helper: count emergency complaints by email in last 14 days
async function countRecentEmergency(email) {
    const since = new Date(Date.now() - EMERGENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
    return db.collection('emergency_complaints').countDocuments({
        employeeEmail: email,
        createdAt: { $gte: since }
    })
}

// GET /api/emergency-complaints/status  — remaining count + reset time for current user
app.get('/api/emergency-complaints/status', ensureAuth, async (req, res) => {
    try {
        const { email } = req.user
        const since = new Date(Date.now() - EMERGENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
        const recent = await db.collection('emergency_complaints')
            .find({ employeeEmail: email, createdAt: { $gte: since } })
            .sort({ createdAt: 1 })
            .toArray()
        const used = recent.length
        const remaining = Math.max(0, EMERGENCY_LIMIT - used)
        // reset time = oldest complaint date + 14 days
        const resetAt = used > 0
            ? new Date(new Date(recent[0].createdAt).getTime() + EMERGENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
            : null
        return res.json({ used, remaining, limit: EMERGENCY_LIMIT, resetAt, windowDays: EMERGENCY_WINDOW_DAYS })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch status' })
    }
})

// POST /api/emergency-complaints  — create emergency complaint
app.post('/api/emergency-complaints', ensureAuth, async (req, res) => {
    try {
        const { email } = req.user
        const used = await countRecentEmergency(email)
        if (used >= EMERGENCY_LIMIT) {
            return res.status(429).json({
                message: `Emergency complaint limit reached. You can only submit ${EMERGENCY_LIMIT} emergency complaints every ${EMERGENCY_WINDOW_DAYS} days.`
            })
        }
        const { title, description, category } = req.body || {}
        if (!title || !description) return res.status(400).json({ message: 'title and description are required' })

        const complaint = {
            id: `ec-${Date.now()}`,
            employeeEmail: email,
            title,
            description,
            category: category || 'general',
            complaintType: 'emergency',
            status: 'open',
            createdAt: new Date().toISOString()
        }
        await db.collection('emergency_complaints').insertOne(complaint)
        return res.status(201).json({ complaint })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to create emergency complaint' })
    }
})

// GET /api/emergency-complaints  — get own emergency complaints (employee) or all (HR)
app.get('/api/emergency-complaints', ensureAuth, async (req, res) => {
    try {
        const { email, role } = req.user
        const filter = role === 'hr' ? {} : { employeeEmail: email }
        const complaints = await db.collection('emergency_complaints')
            .find(filter).sort({ createdAt: -1 }).toArray()
        return res.json({ complaints })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch emergency complaints' })
    }
})

// PATCH /api/emergency-complaints/:id  — HR updates status
app.patch('/api/emergency-complaints/:id', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user
        if (role !== 'hr') return res.status(403).json({ message: 'Only HR can update emergency complaints' })
        const { id } = req.params
        const { status } = req.body || {}
        if (!status) return res.status(400).json({ message: 'status is required' })

        const complaint = await db.collection('emergency_complaints').findOne({ id })
        await db.collection('emergency_complaints').updateOne({ id }, { $set: { status } })
        const updated = await db.collection('emergency_complaints').findOne({ id })

        // Email + Firebase notification on resolution
        if (complaint && ['resolved','rejected','closed'].includes(status)) {
          const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
          sendMail(complaint.employeeEmail, `Emergency Complaint ${statusLabel} — ERM`,
            `<h2>Your emergency complaint has been ${statusLabel.toLowerCase()}</h2>
             <p><b>Title:</b> ${complaint.title}</p>
             <p><b>Status:</b> ${statusLabel}</p>
             <p>Contact HR if you need further assistance.</p>`
          )
          pushNotification(complaint.employeeEmail, {
            type: 'emergency_update', title: `Emergency ${statusLabel}`,
            message: `Your emergency complaint "${complaint.title}" has been ${statusLabel.toLowerCase()}.`,
            ticketId: id,
          })
        }

        return res.json({ complaint: updated })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to update complaint' })
    }
})

// ─── Notifications REST API (backed by MongoDB) ───
// GET /api/notifications — get notifications for current user
app.get('/api/notifications', ensureAuth, async (req, res) => {
    try {
        const { email, role } = req.user
        const filter = role === 'hr' ? {} : { targetEmail: email }
        const notifs = await db.collection('notifications')
          .find(filter).sort({ createdAt: -1 }).limit(50).toArray()
        return res.json({ notifications: notifs })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to fetch notifications' })
    }
})

// PATCH /api/notifications/:id/read — mark notification as read
app.patch('/api/notifications/:id/read', ensureAuth, async (req, res) => {
    try {
        const { id } = req.params
        await db.collection('notifications').updateOne({ id }, { $set: { read: true } })
        return res.json({ ok: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to mark notification' })
    }
})

// PATCH /api/notifications/read-all — mark all as read
app.patch('/api/notifications/read-all', ensureAuth, async (req, res) => {
    try {
        const { email, role } = req.user
        const filter = role === 'hr' ? {} : { targetEmail: email }
        await db.collection('notifications').updateMany(filter, { $set: { read: true } })
        return res.json({ ok: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed' })
    }
})

// ─── Reports API — aggregate data ───
app.get('/api/reports/summary', ensureAuth, async (req, res) => {
    try {
        const { role } = req.user
        if (role !== 'hr') return res.status(403).json({ message: 'HR only' })

        const totalEmployees = await db.collection('employees').countDocuments()
        const tickets = await db.collection('tickets').find().toArray()
        const totalTickets = tickets.length
        const resolvedTickets = tickets.filter(t => t.status === 'resolved').length
        const openTickets = tickets.filter(t => t.status === 'open').length

        // Category breakdown
        const categoryMap = {}
        tickets.forEach(t => {
            const cat = t.category || 'general'
            categoryMap[cat] = (categoryMap[cat] || 0) + 1
        })
        const ticketsByCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }))

        // Department breakdown from employees
        const employees = await db.collection('employees').find().toArray()
        const deptMap = {}
        employees.forEach(e => {
            const dept = e.department || 'General'
            if (!deptMap[dept]) deptMap[dept] = { employees: 0 }
            deptMap[dept].employees++
        })
        const departments = Object.entries(deptMap).map(([name, data]) => ({ name, ...data }))

        return res.json({ totalEmployees, totalTickets, resolvedTickets, openTickets, ticketsByCategory, departments })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Failed to generate report' })
    }
})

// Start server immediately (required for Render health checks to pass quickly)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit https://erm-3.onrender.com to check status`);
});

// Connect to DB in background
connectAndSeed()
    .then(async () => {
        console.log('Database initialization complete.');
        // Create indexes for fast lookups
        try {
            await db.collection('employees').createIndex({ email: 1 }, { unique: true, sparse: true });
            await db.collection('tickets').createIndex({ ownerEmail: 1 });
            await db.collection('tickets').createIndex({ id: 1 }, { unique: true, sparse: true });
            await db.collection('attendance').createIndex({ employeeEmail: 1, date: -1 });
            await db.collection('notifications').createIndex({ targetEmail: 1, createdAt: -1 });
            console.log('DB indexes created');
        } catch (e) { console.log('Index creation note:', e.message); }
    })
    .catch(err => {
        console.error('Failed to connect to DB:', err);
    });
