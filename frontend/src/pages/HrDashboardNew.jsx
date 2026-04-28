import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import './hr-dashboard-new.css'
import './tickets.css'

function decodeToken() {
  try {
    const t = localStorage.getItem('token')
    if (!t) return null
    return JSON.parse(atob(t))
  } catch { return null }
}

const DEPT_COLORS = ['#6366f1','#f59e0b','#10b981','#f43f5e','#8b5cf6']
const DEPT_DATA = [
  { name: 'Engineering', count: 12, color: DEPT_COLORS[0] },
  { name: 'Marketing',   count: 7,  color: DEPT_COLORS[1] },
  { name: 'Operations',  count: 9,  color: DEPT_COLORS[2] },
  { name: 'HR',          count: 4,  color: DEPT_COLORS[3] },
  { name: 'Finance',     count: 5,  color: DEPT_COLORS[4] },
]
const TOTAL_DEPT = DEPT_DATA.reduce((a, d) => a + d.count, 0)

function DonutChart({ data, total }) {
  const cx = 70, cy = 70, r = 54, stroke = 18
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {data.map((d, i) => {
          const dash = (d.count / total) * circ
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={-offset}
              style={{ transform:'rotate(-90deg)', transformOrigin:'70px 70px', transition:'stroke-dasharray 0.8s ease' }}
            />
          )
          offset += dash
          return el
        })}
      </svg>
      <div className="donut-center">
        <div className="donut-total">{total}</div>
        <div className="donut-label">Total</div>
      </div>
    </div>
  )
}

const STATUS_COLORS = { open:'#6366f1', 'in-progress':'#f59e0b', resolved:'#10b981', closed:'#94a3b8' }
const STATUS_BG    = { open:'rgba(99,102,241,0.1)', 'in-progress':'rgba(245,158,11,0.1)', resolved:'rgba(16,185,129,0.1)', closed:'rgba(148,163,184,0.1)' }

const HrDashboardNew = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [employees, setEmployees] = useState([])
  const [ticketsByUser, setTicketsByUser] = useState({})
  const [emergencyTickets, setEmergencyTickets] = useState([])
  const [newEmp, setNewEmp] = useState({ name:'', email:'', department:'', employeeRole:'employee' })
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [ticketFilter, setTicketFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeSection, setActiveSection] = useState('overview') // 'overview' | 'tickets'
  const [ticketTab, setTicketTab] = useState('normal') // 'normal' | 'emergency'
  const [updatingTicket, setUpdatingTicket] = useState(null)
  const user = decodeToken()
  const token = localStorage.getItem('token')
  const authHdr = { Authorization: token ? `Bearer ${token}` : '' }

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/employees`, { headers: authHdr })
        .then(r => r.json()).then(j => setEmployees(j.employees || [])).catch(() => {}),
      fetch(`${API_BASE_URL}/api/all-tickets`, { headers: authHdr })
        .then(r => r.json()).then(j => setTicketsByUser(j.ticketsByUser || {})).catch(() => {}),
      fetch(`${API_BASE_URL}/api/emergency-complaints`, { headers: authHdr })
        .then(r => r.json()).then(j => setEmergencyTickets(
          (j.complaints || []).map(c => ({ ...c, userEmail: c.employeeEmail }))
        )).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (ticketId, newStatus, isEmergency = false) => {
    setUpdatingTicket(ticketId)
    try {
      const endpoint = isEmergency
        ? `${API_BASE_URL}/api/emergency-complaints/${ticketId}`
        : `${API_BASE_URL}/api/employee-tickets/${ticketId}`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHdr },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const json = await res.json()
      if (isEmergency) {
        setEmergencyTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, _updated: true } : t))
      } else {
        setTicketsByUser(prev => {
          const next = { ...prev }
          for (const u in next) next[u] = next[u].map(t => t.id === ticketId ? { ...json.ticket, _updated: true } : t)
          return next
        })
      }
    } catch (err) { setError(err.message) }
    finally { setUpdatingTicket(null) }
  }

  const addEmployee = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr },
        body: JSON.stringify(newEmp),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message) }
      const { employee } = await res.json()
      setEmployees(p => [...p, employee])
      setNewEmp({ name:'', email:'', department:'', employeeRole:'employee' })
      setAddOpen(false); setError('')
    } catch (err) { setError(err.message) }
  }

  const removeEmployee = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/employees/${id}`, { method:'DELETE', headers: authHdr })
      setEmployees(p => p.filter(e => e.id !== id))
    } catch (err) { setError(err.message) }
  }

  const allTickets = Object.values(ticketsByUser).flat()
  const openTickets = allTickets.filter(t => t.status === 'open').length
  const pendingTickets = allTickets.filter(t => t.status === 'in-progress').length

  const filteredByUser = Object.entries(ticketsByUser).reduce((acc, [u, list]) => {
    const filtered = list.filter(t => {
      const matchUser = ticketFilter === '' || u.toLowerCase().includes(ticketFilter.toLowerCase()) || (t.title||'').toLowerCase().includes(ticketFilter.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchUser && matchStatus
    })
    if (filtered.length > 0) acc[u] = filtered
    return acc
  }, {})

  const filteredEmergency = emergencyTickets.filter(t => {
    const matchFilter = ticketFilter === '' || (t.title||'').toLowerCase().includes(ticketFilter.toLowerCase()) || (t.userEmail||'').toLowerCase().includes(ticketFilter.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchFilter && matchStatus
  })

  const cV = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.07}} }
  const iV = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{type:'spring',stiffness:80,damping:14}} }

  const ATTENDANCE_BARS = [
    { day:'Mon', present:34, absent:3, leave:2 },
    { day:'Tue', present:36, absent:2, leave:1 },
    { day:'Wed', present:30, absent:5, leave:4 },
    { day:'Thu', present:35, absent:3, leave:1 },
    { day:'Fri', present:28, absent:6, leave:5 },
    { day:'Sat', present:10, absent:1, leave:0 },
  ]
  const MAX_BAR = 42

  const statCards = [
    { icon:'👥', label:'Total Employees', value:loading?'…':employees.length,                         change:'+3', trend:'up',     cls:'icon-indigo' },
    { icon:'📅', label:'Present Today',   value:loading?'…':Math.round(employees.length*0.87),        change:'87%', trend:'up',    cls:'icon-emerald' },
    { icon:'🎫', label:'Open Tickets',    value:loading?'…':openTickets,                              change:`${pendingTickets} in progress`, trend:'neutral', cls:'icon-amber' },
    { icon:'🔔', label:'Total Tickets',   value:loading?'…':allTickets.length,                        change:`${allTickets.filter(t=>t.status==='resolved').length} resolved`, trend:'neutral', cls:'icon-rose' },
  ]

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>HR Dashboard</h1>
            <p>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <div className="topbar-right">
            {/* Section toggle */}
            <div className="section-toggle">
              <button className={activeSection==='overview'?'active':''} onClick={()=>setActiveSection('overview')}>Overview</button>
              <button className={activeSection==='tickets'?'active':''} onClick={()=>setActiveSection('tickets')}>
                Tickets {allTickets.length > 0 && <span className="toggle-count">{allTickets.length}</span>}
              </button>
            </div>
            <Link to="/notifications" className="topbar-icon-btn" title="Notifications">
              🔔<span className="topbar-notif-dot" />
            </Link>
            <div className="topbar-avatar" title={user?.email}>
              {(user?.name||user?.email||'H')[0].toUpperCase()}
            </div>
          </div>
        </div>

        <motion.div className="dashboard-body" variants={cV} initial="hidden" animate="show">

          {/* ── OVERVIEW SECTION ── */}
          {activeSection === 'overview' && (
              <motion.div key="overview" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.2}}>
                {/* Stat cards */}
                <motion.div className="stat-cards-grid" variants={cV}>
                  {statCards.map((card,i) => (
                    <motion.div key={i} className="stat-card" variants={iV}>
                      <div className={`stat-card-icon ${card.cls}`}>{card.icon}</div>
                      <div className="stat-card-body">
                        <div className="stat-card-label">{card.label}</div>
                        <div className="stat-card-value">{card.value}</div>
                        <span className={`stat-card-change change-${card.trend}`}>
                          {card.trend==='up'?'↑':card.trend==='down'?'↓':'•'} {card.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Charts row */}
                <motion.div className="charts-row" style={{marginTop:'1.5rem'}} variants={cV}>
                  <motion.div className="chart-card" variants={iV}>
                    <div className="chart-card-header">
                      <h3>Attendance This Week</h3>
                      <div className="chart-legend">
                        <span className="legend-item"><span className="legend-dot" style={{background:'#6366f1'}}/> Present</span>
                        <span className="legend-item"><span className="legend-dot" style={{background:'#f43f5e'}}/> Absent</span>
                        <span className="legend-item"><span className="legend-dot" style={{background:'#f59e0b'}}/> Leave</span>
                      </div>
                    </div>
                    <div className="bar-chart">
                      {ATTENDANCE_BARS.map((b,i) => (
                        <div key={i} className="bar-group">
                          <div className="bar-stacks">
                            <div className="bar present" style={{height:`${(b.present/MAX_BAR)*100}%`}} title={`Present: ${b.present}`}/>
                            <div className="bar absent"  style={{height:`${(b.absent/MAX_BAR)*100}%`}}  title={`Absent: ${b.absent}`}/>
                            <div className="bar leave"   style={{height:`${(b.leave/MAX_BAR)*100}%`}}   title={`Leave: ${b.leave}`}/>
                          </div>
                          <div className="bar-label">{b.day}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div className="chart-card" variants={iV}>
                    <div className="chart-card-header"><h3>Departments</h3></div>
                    <DonutChart data={DEPT_DATA} total={TOTAL_DEPT}/>
                    <div className="dept-list">
                      {DEPT_DATA.map((d,i) => (
                        <div key={i} className="dept-row">
                          <div className="dept-dot" style={{background:d.color}}/>
                          <div className="dept-name">{d.name}</div>
                          <div className="dept-count">{d.count}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Bottom row: recent tickets preview + add employee */}
                <motion.div className="bottom-row" style={{marginTop:'1.5rem'}} variants={cV}>
                  {/* Recent Tickets Preview */}
                  <motion.div className="chart-card" variants={iV}>
                    <div className="chart-card-header">
                      <h3>Recent Tickets</h3>
                      <button className="view-all-link" onClick={()=>setActiveSection('tickets')}>View all →</button>
                    </div>
                    {loading ? <div className="empty-state">⏳ Loading…</div> : allTickets.length === 0 ? (
                      <div className="empty-state"><div className="empty-state-icon">🎉</div>No tickets yet</div>
                    ) : allTickets.slice(0,5).map(t => (
                      <div key={t.id} className="ticket-preview-row">
                        <div className="ticket-preview-dot" style={{background: STATUS_COLORS[t.status]||'#6366f1'}}/>
                        <div className="ticket-preview-info">
                          <div className="ticket-preview-title">{t.title}</div>
                          <div className="ticket-preview-meta">{t.category}</div>
                        </div>
                        <span className="ticket-preview-badge" style={{background:STATUS_BG[t.status], color:STATUS_COLORS[t.status]}}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Add Employee */}
                  <motion.div className="chart-card" variants={iV}>
                    <div className="chart-card-header"><h3>Add Employee</h3></div>
                    <button onClick={()=>setAddOpen(o=>!o)} className={`add-emp-btn ${addOpen?'cancel':''}`}>
                      {addOpen ? '✕ Cancel' : '+ Add New Employee'}
                    </button>
                    {addOpen && (
                      <form onSubmit={addEmployee} className="add-emp-form">
                        {error && <div className="form-error">{error}</div>}
                        {['name','email','department'].map(f => (
                          <input key={f} placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
                            value={newEmp[f]} onChange={e=>setNewEmp(p=>({...p,[f]:e.target.value}))}
                            required={f!=='department'} className="add-emp-input"/>
                        ))}
                        <select value={newEmp.employeeRole} onChange={e=>setNewEmp(p=>({...p,employeeRole:e.target.value}))} className="add-emp-input">
                          <option value="employee">Employee</option>
                          <option value="hr">HR</option>
                        </select>
                        <button type="submit" className="add-emp-save">✓ Save Employee</button>
                      </form>
                    )}
                  </motion.div>
                </motion.div>

                {/* Employees Table */}
                <motion.div className="chart-card" style={{marginTop:'1.5rem'}} variants={iV}>
                  <div className="chart-card-header">
                    <h3>All Employees ({employees.length})</h3>
                  </div>
                  {loading ? <div className="empty-state">⏳ Loading…</div> : employees.length===0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👥</div>No employees yet</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table className="emp-table">
                        <thead>
                          <tr>{['Employee','Email','Department','Role','Action'].map(h=>(
                            <th key={h}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {employees.map(emp=>(
                            <tr key={emp.id}>
                              <td>
                                <div className="emp-name-cell">
                                  <div className="emp-avatar">{(emp.name||'?')[0].toUpperCase()}</div>
                                  {emp.name}
                                </div>
                              </td>
                              <td className="emp-muted">{emp.email}</td>
                              <td className="emp-muted">{emp.department||'—'}</td>
                              <td>
                                <span className={`emp-role-badge ${emp.role==='hr'?'hr':'emp'}`}>
                                  {(emp.role||'employee').toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <button onClick={()=>removeEmployee(emp.id)} className="emp-remove-btn">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ── TICKETS SECTION ── */}
            {activeSection === 'tickets' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.2}}>
                <div className="chart-card">
                  {/* Ticket section header */}
                  <div className="tickets-section-header">
                    <div>
                      <h3 style={{margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a'}}>Complaint Tickets</h3>
                      <p style={{margin:'2px 0 0', fontSize:'0.8rem', color:'#64748b'}}>View and update status of all employee complaints</p>
                    </div>
                    <div className="tickets-header-controls">
                      {/* Tab toggle */}
                      <div className="ticket-tab-toggle">
                        <button className={ticketTab==='normal'?'active':''} onClick={()=>setTicketTab('normal')}>
                          Complaints <span className="tab-count-badge">{allTickets.length}</span>
                        </button>
                        <button className={ticketTab==='emergency'?'active emergency':''} onClick={()=>setTicketTab('emergency')}>
                          🚨 Emergency <span className="tab-count-badge emergency">{emergencyTickets.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="tickets-filters">
                    <div className="tickets-search-wrap">
                      <span className="search-icon">🔍</span>
                      <input
                        className="tickets-search"
                        placeholder={ticketTab==='normal' ? "Search by employee or title…" : "Search emergency tickets…"}
                        value={ticketFilter}
                        onChange={e=>setTicketFilter(e.target.value)}
                      />
                    </div>
                    <select className="tickets-status-filter" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Normal Tickets */}
                  <AnimatePresence mode="wait">
                    {ticketTab === 'normal' && (
                      <motion.div key="normal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        {loading ? (
                          <div className="empty-state">⏳ Loading tickets…</div>
                        ) : Object.keys(filteredByUser).length === 0 ? (
                          <div className="empty-state">
                            <div className="empty-state-icon">🎉</div>
                            {ticketFilter||statusFilter!=='all' ? 'No tickets match your filters' : 'No complaint tickets yet'}
                          </div>
                        ) : Object.entries(filteredByUser).map(([uEmail, tList]) => (
                          <div key={uEmail} className="user-ticket-block">
                            <div className="user-ticket-header">
                              <div className="user-ticket-avatar">{uEmail[0].toUpperCase()}</div>
                              <div>
                                <div className="user-ticket-email">{uEmail}</div>
                                <div className="user-ticket-count">{tList.length} ticket{tList.length!==1?'s':''}</div>
                              </div>
                            </div>
                            <div className="ticket-cards-list">
                              {tList.map(t => (
                                <TicketCard key={t.id} ticket={t} onStatusChange={(id,status)=>updateStatus(id,status,false)} updating={updatingTicket===t.id} isEmergency={false}/>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Emergency Tickets */}
                    {ticketTab === 'emergency' && (
                      <motion.div key="emergency" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        {loading ? (
                          <div className="empty-state">⏳ Loading…</div>
                        ) : filteredEmergency.length === 0 ? (
                          <div className="empty-state">
                            <div className="empty-state-icon">🛡️</div>
                            {ticketFilter||statusFilter!=='all' ? 'No tickets match your filters' : 'No emergency complaints filed'}
                          </div>
                        ) : (
                          <div className="ticket-cards-list" style={{marginTop:'1rem'}}>
                            {filteredEmergency.map(t => (
                              <TicketCard key={t.id} ticket={t} onStatusChange={(id,status)=>updateStatus(id,status,true)} updating={updatingTicket===t.id} isEmergency={true}/>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  )
}

/* ── Ticket Card Sub-Component ── */
function TicketCard({ ticket, onStatusChange, updating, isEmergency }) {
  const STATUS_OPTIONS = ['open','in-progress','resolved','closed']
  const STATUS_COLORS  = { open:'#6366f1', 'in-progress':'#f59e0b', resolved:'#10b981', closed:'#94a3b8' }
  const STATUS_BG      = { open:'rgba(99,102,241,0.1)', 'in-progress':'rgba(245,158,11,0.1)', resolved:'rgba(16,185,129,0.1)', closed:'rgba(148,163,184,0.1)' }

  return (
    <motion.div
      layout
      initial={{opacity:0, y:8}}
      animate={{opacity:1, y:0}}
      className={`hr-ticket-card ${isEmergency ? 'emergency' : ''} ${ticket._updated ? 'updated' : ''}`}
    >
      <div className="hr-ticket-top">
        <div className="hr-ticket-title-wrap">
          {isEmergency && <span className="emergency-label-badge">🚨 EMERGENCY</span>}
          <div className="hr-ticket-title">{ticket.title}</div>
          <div className="hr-ticket-meta">
            <span className="hr-ticket-cat">{ticket.category}</span>
            <span className="hr-ticket-dot">·</span>
            <span>{new Date(ticket.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
            {ticket.userEmail && <><span className="hr-ticket-dot">·</span><span>{ticket.userEmail}</span></>}
          </div>
        </div>
        <span className="hr-ticket-status-badge" style={{background:STATUS_BG[ticket.status]||STATUS_BG.open, color:STATUS_COLORS[ticket.status]||STATUS_COLORS.open}}>
          {ticket.status||'open'}
        </span>
      </div>

      {ticket.description && (
        <div className="hr-ticket-desc">{ticket.description}</div>
      )}

      <div className="hr-ticket-actions">
        <span className="hr-ticket-action-label">Update Status:</span>
        <div className="hr-ticket-status-btns">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              disabled={updating || ticket.status === s}
              onClick={() => onStatusChange(ticket.id, s)}
              className={`hr-status-btn ${ticket.status===s?'active':''} status-${s.replace(/\s+/g,'-')}`}
            >
              {s === 'open' ? '🔓 Open' : s === 'in-progress' ? '⚙️ In Progress' : s === 'resolved' ? '✅ Resolved' : '🔒 Closed'}
            </button>
          ))}
        </div>
        {updating && <span className="hr-ticket-saving">Saving…</span>}
      </div>
    </motion.div>
  )
}

export default HrDashboardNew
