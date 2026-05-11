import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import './hr-dashboard-new.css'
import './tickets.css'

function decodeToken() {
  try { return JSON.parse(atob(localStorage.getItem('token'))) } catch { return null }
}

function formatResetTimer(resetAt) {
  if (!resetAt) return null
  const diff = new Date(resetAt) - new Date()
  if (diff <= 0) return 'Resetting soon…'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `Resets in ${days}d ${hours}h`
  return `Resets in ${hours}h ${mins}m`
}

const CATEGORIES = ['general','payroll','it','facilities','safety','harassment']

const EmployeeDashboardNew = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [data, setData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [emergencyComplaints, setEmergencyComplaints] = useState([])
  const [emergencyStatus, setEmergencyStatus] = useState({ remaining: 2, used: 0, limit: 2, resetAt: null })
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('normal')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEmergency, setIsEmergency] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const user = decodeToken()
  const token = localStorage.getItem('token')
  const authHdr = { Authorization: token ? `Bearer ${token}` : '' }

  const fetchEmergencyStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/emergency-complaints/status`, { headers: authHdr })
      if (res.ok) { const j = await res.json(); setEmergencyStatus(j) }
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return }
    Promise.all([
      fetch(`${API_BASE_URL}/api/employee-data`, { headers: authHdr }).then(r => r.json()).then(j => setData(j.data)).catch(() => {}),
      fetch(`${API_BASE_URL}/api/employee-tickets`, { headers: authHdr }).then(r => r.json()).then(j => setTickets(j.tickets || [])).catch(() => {}),
      fetch(`${API_BASE_URL}/api/emergency-complaints`, { headers: authHdr }).then(r => r.json()).then(j => setEmergencyComplaints(j.complaints || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
    fetchEmergencyStatus()
  }, [])

  const submitTicket = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const endpoint = isEmergency ? `${API_BASE_URL}/api/emergency-complaints` : `${API_BASE_URL}/api/employee-tickets`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr },
        body: JSON.stringify({ title, category, description }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message || `Status ${res.status}`)
      if (isEmergency) { setEmergencyComplaints(p => [{ ...j.complaint, _transient:'new' }, ...p]); fetchEmergencyStatus() }
      else { setTickets(p => [{ ...j.ticket, _transient:'new' }, ...p]) }
      setTitle(''); setCategory('general'); setDescription(''); setIsEmergency(false); setFormOpen(false)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const limitReached = emergencyStatus.remaining === 0
  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter)

  const containerV = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.07}} }
  const itemV = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{type:'spring',stiffness:80,damping:14}} }

  const statusColor = { 'open':'#6366f1','in-progress':'#f59e0b','resolved':'#10b981' }

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>My Dashboard</h1>
            <p>Welcome back, {user?.name || user?.email || 'Employee'}</p>
          </div>
          <div className="topbar-right">
            <Link to="/notifications" className="topbar-icon-btn" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </Link>
            <Link to="/employee-profile" className="topbar-avatar" title="My Profile">
              {(user?.name || user?.email || 'E')[0].toUpperCase()}
            </Link>
          </div>
        </div>

        <motion.div className="dashboard-body" variants={containerV} initial="hidden" animate="show">
          {/* Stat cards */}
          <motion.div className="stat-cards-grid" variants={containerV}>
            {[
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>), label:'Total Tickets',   value: loading?'–':tickets.length,                       cls:'icon-indigo', change:'All time' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>), label:'Open',               value: loading?'–':tickets.filter(t=>t.status==='open').length, cls:'icon-amber', change:'Needs attention' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M20 12h2M2 12h2M12 20v2M12 2v2"/></svg>), label:'In Progress',        value: loading?'–':tickets.filter(t=>t.status==='in-progress').length, cls:'icon-violet', change:'Being handled' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>), label:'Resolved',            value: loading?'–':tickets.filter(t=>t.status==='resolved').length, cls:'icon-emerald', change:'Completed' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>), label:'Emergency Quota',    value: `${emergencyStatus.remaining}/${emergencyStatus.limit}`, cls:'icon-rose', change: limitReached ? formatResetTimer(emergencyStatus.resetAt)||'Limit reached' : 'Available' },
            ].map((c,i) => (
              <motion.div key={i} className="stat-card" variants={itemV}>
                <div className={`stat-card-icon ${c.cls}`}>{c.icon}</div>
                <div className="stat-card-body">
                  <div className="stat-card-label">{c.label}</div>
                  <div className="stat-card-value">{c.value}</div>
                  <span className="stat-card-change change-neutral">• {c.change}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {error && <div style={{background:'#fef2f2',color:'#b91c1c',border:'1px solid #fecaca',borderRadius:'10px',padding:'0.85rem 1rem',fontSize:'0.875rem'}}>{error}</div>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>
            {/* Ticket list */}
            <motion.div className="chart-card" variants={itemV}>
              <div className="chart-card-header">
                <div style={{ display:'flex', gap:'0.35rem' }}>
                  {['normal','emergency'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding:'0.4rem 0.9rem', borderRadius:'8px', border:'none', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', transition:'all 0.2s',
                        background: activeTab===tab ? '#6366f1' : '#f1f5f9',
                        color: activeTab===tab ? '#fff' : '#64748b' }}>
                      {tab === 'normal' ? `Complaints (${tickets.length})` : `Emergency (${emergencyComplaints.length})`}
                    </button>
                  ))}
                </div>
                {activeTab === 'normal' && (
                  <select value={filter} onChange={e=>setFilter(e.target.value)}
                    style={{ padding:'0.35rem 0.75rem', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'0.8rem', color:'#334155', background:'#f8fafc', outline:'none' }}>
                    {['all','open','in-progress','resolved'].map(f => <option key={f} value={f}>{f==='all'?'All statuses':f}</option>)}
                  </select>
                )}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'normal' && (
                  <motion.div key="normal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', marginTop:'1rem' }}>
                      {filteredTickets.length === 0 && <div className="empty-state"><div className="empty-state-icon">—</div>No complaints yet</div>}
                      <AnimatePresence>
                        {filteredTickets.map(t => (
                          <motion.div key={t.id} layout initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,scale:0.95}}
                            style={{ padding:'0.9rem 1rem', background:'#f8fafc', borderRadius:'12px', borderLeft:`3px solid ${statusColor[t.status]||'#6366f1'}` }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
                              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#0f172a' }}>{t.title}</div>
                              <span className={`status-badge status-${(t.status||'open').replace(/\s+/g,'-')}`}>{t.status||'open'}</span>
                            </div>
                            <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:3 }}>{t.category} · {new Date(t.createdAt).toLocaleDateString()}</div>
                            {t.description && <div style={{ fontSize:'0.82rem', color:'#64748b', marginTop:'0.4rem', lineHeight:1.5 }}>{t.description}</div>}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'emergency' && (
                  <motion.div key="emergency" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', marginTop:'1rem' }}>
                      {emergencyComplaints.length === 0 && <div className="empty-state"><div className="empty-state-icon">—</div>No emergency complaints</div>}
                      <AnimatePresence>
                        {emergencyComplaints.map(c => (
                          <motion.div key={c.id} layout initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,scale:0.95}}
                            style={{ padding:'0.9rem 1rem', background:'#fff1f2', borderRadius:'12px', borderLeft:'3px solid #f43f5e' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                              <div>
                                <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#f43f5e', letterSpacing:'0.06em', display:'block', marginBottom:3 }}>EMERGENCY</span>
                                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#0f172a' }}>{c.title}</div>
                              </div>
                              <span className={`status-badge status-${(c.status||'open').replace(/\s+/g,'-')}`}>{c.status||'open'}</span>
                            </div>
                            <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:3 }}>{c.category} · {new Date(c.createdAt).toLocaleDateString()}</div>
                            {c.description && <div style={{ fontSize:'0.82rem', color:'#64748b', marginTop:'0.4rem', lineHeight:1.5 }}>{c.description}</div>}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit form */}
            <motion.div className="chart-card" variants={itemV}>
              <div className="chart-card-header">
                <h3>{formOpen ? 'New Complaint' : 'Submit a Complaint'}</h3>
                <button onClick={() => setFormOpen(o=>!o)}
                  style={{ padding:'0.4rem 1rem', background: formOpen?'#f43f5e':'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer' }}>
                  {formOpen ? '✕ Cancel' : '+ New'}
                </button>
              </div>

              <AnimatePresence>
                {formOpen && (
                  <motion.form onSubmit={submitTicket} initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'1rem', overflow:'hidden' }}>
                    {/* Emergency toggle */}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background: isEmergency?'#fff1f2':'#f8fafc', borderRadius:'10px', border:`1px solid ${isEmergency?'rgba(244,63,94,0.2)':'rgba(0,0,0,0.06)'}` }}>
                      <span style={{ fontSize:'1.1rem' }}>{isEmergency ? '!' : '+'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.82rem', fontWeight:700, color: isEmergency?'#f43f5e':'#334155' }}>{isEmergency ? 'Emergency Complaint' : 'Normal Complaint'}</div>
                        {isEmergency && <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:2 }}>{emergencyStatus.remaining} of {emergencyStatus.limit} remaining</div>}
                      </div>
                      <button type="button" onClick={() => setIsEmergency(p=>!p)} disabled={limitReached && !isEmergency}
                        style={{ padding:'0.35rem 0.85rem', border:`1px solid ${isEmergency?'#f43f5e':'rgba(0,0,0,0.1)'}`, borderRadius:'8px', background: isEmergency?'#f43f5e':'transparent', color: isEmergency?'#fff':'#64748b', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
                        {isEmergency ? 'Remove' : 'Mark Emergency'}
                      </button>
                    </div>

                    <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required
                      style={{ padding:'0.7rem 0.9rem', border:'1px solid #e2e8f0', borderRadius:'10px', fontSize:'0.875rem', outline:'none', color:'#0f172a', fontFamily:'var(--font-body)' }} />
                    <select value={category} onChange={e=>setCategory(e.target.value)}
                      style={{ padding:'0.7rem 0.9rem', border:'1px solid #e2e8f0', borderRadius:'10px', fontSize:'0.875rem', outline:'none', color:'#0f172a', background:'#fff' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                    </select>
                    <textarea placeholder="Describe your issue in detail…" value={description} onChange={e=>setDescription(e.target.value)} required rows={4}
                      style={{ padding:'0.7rem 0.9rem', border:'1px solid #e2e8f0', borderRadius:'10px', fontSize:'0.875rem', outline:'none', color:'#0f172a', resize:'vertical', fontFamily:'var(--font-body)' }} />
                    <button type="submit" disabled={submitting}
                      style={{ padding:'0.8rem', background: isEmergency?'#f43f5e':'#6366f1', color:'#fff', border:'none', borderRadius:'10px', fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', opacity: submitting?0.6:1 }}>
                      {submitting ? 'Submitting…' : isEmergency ? 'Submit Emergency' : 'Submit Complaint'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Quick info */}
              {!formOpen && (
                <div style={{ marginTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                  {[
                    { icon:'\u2192', label:'Normal complaints', desc:'Submit anytime, no limit.', color:'#e0e7ff' },
                    { icon:'!', label:'Emergency complaints', desc:`${emergencyStatus.remaining}/${emergencyStatus.limit} remaining — reset every 14 days.`, color:'#fee2e2' },
                    { icon:'\u2197', label:'Track progress', desc:'Monitor all your tickets in real-time.', color:'#dcfce7' },
                  ].map((item,i) => (
                    <div key={i} style={{ display:'flex', gap:'0.75rem', padding:'0.85rem', background:'#f8fafc', borderRadius:'12px', alignItems:'flex-start' }}>
                      <div style={{ width:36, height:36, borderRadius:'8px', background:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0f172a' }}>{item.label}</div>
                        <div style={{ fontSize:'0.78rem', color:'#64748b', marginTop:2 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                  <Link to="/employee-profile" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.75rem', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', borderRadius:'12px', textDecoration:'none', fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.875rem', marginTop:'0.25rem' }}>
                    View My Profile
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EmployeeDashboardNew
