import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import './EmployeeProfile.css'
import './hr-dashboard-new.css'

function decodeToken() {
  try { return JSON.parse(atob(localStorage.getItem('token'))) } catch { return null }
}

const TABS = ['Overview', 'Attendance', 'Leave History', 'Performance', 'Documents']

const PERF_METRICS = [
  { label: 'Task Completion',  value: 92, color: '#6366f1' },
  { label: 'Punctuality',       value: 87, color: '#10b981' },
  { label: 'Team Collaboration',value: 78, color: '#f59e0b' },
  { label: 'Quality of Work',  value: 95, color: '#8b5cf6' },
]

const LEAVE_HISTORY = [
  { type: 'Annual Leave',    from: '2025-03-10', to: '2025-03-14', days: 5, status: 'Approved' },
  { type: 'Sick Leave',      from: '2025-01-22', to: '2025-01-22', days: 1, status: 'Approved' },
  { type: 'Casual Leave',    from: '2024-12-24', to: '2024-12-26', days: 3, status: 'Approved' },
  { type: 'Emergency Leave', from: '2024-11-05', to: '2024-11-05', days: 1, status: 'Approved' },
]

const DOCS = [
  { name: 'Employment Contract', type: 'PDF', size: '1.2 MB', icon: 'doc',  color: '#fee2e2' },
  { name: 'NDA Agreement',       type: 'PDF', size: '0.8 MB', icon: 'list', color: '#e0e7ff' },
  { name: 'ID Proof (Aadhaar)',  type: 'IMG', size: '0.4 MB', icon: 'id',   color: '#fef3c7' },
  { name: 'Offer Letter',        type: 'PDF', size: '0.6 MB', icon: 'mail', color: '#dcfce7' },
]

const DOC_ICONS = {
  doc:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  id:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
}

/* ── Attendance calendar helpers ─────────── */
function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const seed = (year * 100 + month) % 7
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay()
    const isWeekend = dow === 0 || dow === 6
    const r = (d + seed) % 10
    let status = 'present'
    if (isWeekend) status = 'empty'
    else if (r < 1) status = 'absent'
    else if (r < 2) status = 'leave'
    cells.push({ day: d, status, isToday: new Date(year, month, d).toDateString() === new Date().toDateString() })
  }
  return cells
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

const EmployeeProfile = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [data, setData] = useState(null)
  const [tickets, setTickets] = useState([])
  const user = decodeToken()
  const token = localStorage.getItem('token')

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const cells = buildCalendar(calYear, calMonth)
  const presentCount = cells.filter(c => c.status === 'present').length
  const absentCount  = cells.filter(c => c.status === 'absent').length
  const leaveCount   = cells.filter(c => c.status === 'leave').length

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return }
    fetch(`${API_BASE_URL}/api/employee-data`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => setData(j.data)).catch(() => {})
    fetch(`${API_BASE_URL}/api/employee-tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => setTickets(j.tickets || [])).catch(() => {})
  }, [])

  const fadeTab = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } }

  return (
    <div className="profile-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`profile-main ${collapsed ? 'collapsed' : ''}`}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>My Profile</h1>
            <p>Employee details and history</p>
          </div>
        </div>

        <div className="profile-body">
          {/* Hero card */}
          <motion.div className="profile-hero" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <div className="profile-avatar-lg">
              {(user?.name || user?.email || 'E')[0].toUpperCase()}
            </div>
            <div className="profile-hero-info">
              <div className="profile-hero-name">{user?.name || 'Employee'}</div>
              <div className="profile-hero-role">{user?.email}</div>
              <div className="profile-hero-tags">
                <span className="profile-tag">{(user?.role||'employee').toUpperCase()}</span>
                <span className="profile-tag">{user?.department || 'Engineering'}</span>
                <span className="profile-tag">Since 2024</span>
              </div>
            </div>
            <div className="profile-hero-stats">
              <div className="profile-hero-stat">
                <div className="profile-hero-stat-value">{tickets.length}</div>
                <div className="profile-hero-stat-label">Tickets</div>
              </div>
              <div className="profile-hero-stat">
                <div className="profile-hero-stat-value">{presentCount}</div>
                <div className="profile-hero-stat-label">Present</div>
              </div>
              <div className="profile-hero-stat">
                <div className="profile-hero-stat-value">92%</div>
                <div className="profile-hero-stat-label">Perf. Score</div>
              </div>
            </div>
          </motion.div>

          {/* Tab bar */}
          <div className="profile-tabs">
            {TABS.map(tab => (
              <button key={tab} className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && (
              <motion.div key="overview" {...fadeTab} className="profile-tab-content">
                <div className="profile-card">
                  <div className="profile-card-title">Personal Information</div>
                  <div className="profile-info-grid">
                    {[
                      { label: 'Full Name',  value: user?.name || 'N/A' },
                      { label: 'Email',      value: user?.email || 'N/A' },
                      { label: 'Role',       value: (user?.role||'employee').toUpperCase() },
                      { label: 'Department', value: user?.department || 'Engineering' },
                      { label: 'Joined',     value: 'Jan 2024' },
                      { label: 'Status',     value: 'Active' },
                    ].map(f => (
                      <div key={f.label} className="profile-info-item">
                        <label>{f.label}</label>
                        <span>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-card-title">Quick Stats</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                    {[
                      { label:'Open Tickets',  value: tickets.filter(t=>t.status==='open').length, color:'#6366f1' },
                      { label:'In Progress',   value: tickets.filter(t=>t.status==='in-progress').length, color:'#f59e0b' },
                      { label:'Resolved',      value: tickets.filter(t=>t.status==='resolved').length, color:'#10b981' },
                      { label:'Days Present (Month)', value: presentCount, color:'#8b5cf6' },
                    ].map(s => (
                      <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.7rem 0.85rem', background:'#f8fafc', borderRadius:'10px' }}>
                        <span style={{ fontSize:'0.85rem', color:'#475569', fontWeight:500 }}>{s.label}</span>
                        <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.2rem', color:s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Attendance' && (
              <motion.div key="attendance" {...fadeTab} className="profile-tab-content">
                <div className="profile-card" style={{ gridColumn:'1 / -1' }}>
                  <div className="profile-card-title">
                    <span style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <span>Attendance — {MONTHS[calMonth]} {calYear}</span>
                      <span style={{ display:'flex', gap:'0.4rem', marginLeft:'auto' }}>
                        <button onClick={()=>{ let m=calMonth-1,y=calYear; if(m<0){m=11;y--} setCalMonth(m);setCalYear(y) }}
                          style={{ padding:'0.3rem 0.65rem', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer' }}>◀</button>
                        <button onClick={()=>{ let m=calMonth+1,y=calYear; if(m>11){m=0;y++} setCalMonth(m);setCalYear(y) }}
                          style={{ padding:'0.3rem 0.65rem', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer' }}>▶</button>
                      </span>
                    </span>
                  </div>
                  <div className="att-month-summary">
                    <span className="att-month-chip att-chip-present">Present: {presentCount}</span>
                    <span className="att-month-chip att-chip-absent">Absent: {absentCount}</span>
                    <span className="att-month-chip att-chip-leave">Leave: {leaveCount}</span>
                  </div>
                  <div className="att-calendar-grid">
                    {DAYS.map(d => <div key={d} className="att-day-label">{d}</div>)}
                    {cells.map((c, i) => (
                      <div key={i} className={`att-day-cell ${c.empty ? 'empty' : c.isToday ? 'today' : c.status}`}>
                        {c.empty ? '' : c.day}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Leave History' && (
              <motion.div key="leave" {...fadeTab} className="profile-tab-content">
                <div className="profile-card" style={{ gridColumn:'1 / -1' }}>
                  <div className="profile-card-title">Leave History</div>
                  <table className="leave-table">
                    <thead>
                      <tr>
                        {['Type','From','To','Days','Status'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {LEAVE_HISTORY.map((l, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight:600 }}>{l.type}</td>
                          <td>{l.from}</td>
                          <td>{l.to}</td>
                          <td><span style={{ fontWeight:700, color:'#6366f1' }}>{l.days}</span></td>
                          <td>
                            <span style={{ padding:'0.2rem 0.6rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700, background:'rgba(16,185,129,0.12)', color:'#059669' }}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'Performance' && (
              <motion.div key="perf" {...fadeTab} className="profile-tab-content">
                <div className="profile-card">
                  <div className="profile-card-title">Performance Metrics</div>
                  <div className="perf-bar-list">
                    {PERF_METRICS.map((m, i) => (
                      <div key={i} className="perf-bar-item">
                        <div className="perf-bar-header">
                          <span>{m.label}</span>
                          <span style={{ color: m.color }}>{m.value}%</span>
                        </div>
                        <div className="perf-bar-track">
                          <motion.div className="perf-bar-fill"
                            style={{ background: m.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${m.value}%` }}
                            transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-card-title">Overall Score</div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'1rem 0' }}>
                    <div style={{ fontFamily:'var(--font-heading)', fontSize:'4rem', fontWeight:800, color:'#6366f1', lineHeight:1 }}>92%</div>
                    <div style={{ color:'#64748b', fontSize:'0.85rem', marginTop:'0.5rem' }}>Performance Rating</div>
                    <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem', flexWrap:'wrap', justifyContent:'center' }}>
                      {['Top Performer','Consistent','Team Player'].map(t => (
                        <span key={t} style={{ padding:'0.35rem 0.85rem', background:'rgba(99,102,241,0.1)', color:'#6366f1', borderRadius:'999px', fontSize:'0.78rem', fontWeight:600 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Documents' && (
              <motion.div key="docs" {...fadeTab} className="profile-tab-content">
                <div className="profile-card" style={{ gridColumn:'1 / -1' }}>
                  <div className="profile-card-title">My Documents</div>
                  <div className="doc-list">
                    {DOCS.map((d, i) => (
                      <div key={i} className="doc-item">
                        <div className="doc-icon" style={{ background: d.color }}>{DOC_ICONS[d.icon] || d.icon}</div>
                        <div className="doc-info">
                          <div className="doc-name">{d.name}</div>
                          <div className="doc-meta">{d.type} · {d.size}</div>
                        </div>
                        <span className="doc-dl" title="Download">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default EmployeeProfile
