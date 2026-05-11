import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import './hr-dashboard-new.css'

function decodeToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token))
  } catch { return null }
}

const STATUS_CONFIG = {
  pending:     { color:'#94a3b8', bg:'rgba(148,163,184,0.12)', label:'Pending',     icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>) },
  'in-progress':{ color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  label:'In Progress', icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M20 12h2M2 12h2M12 20v2M12 2v2"/></svg>) },
  completed:   { color:'#10b981', bg:'rgba(16,185,129,0.12)',  label:'Completed',   icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>) },
}

const JobProgress = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [jobs, setJobs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [form, setForm] = useState({ title:'', description:'', assigneeEmail:'' })
  const [submitting, setSubmitting] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const user = decodeToken()
  const isHr = user?.role === 'hr'
  const token = localStorage.getItem('token')
  const authHdr = { Authorization: token ? `Bearer ${token}` : '' }

  const fetchJobs = async () => {
    const res = await fetch(`${API_BASE_URL}/api/jobs`, { headers: authHdr })
    const json = await res.json()
    if (res.ok) setJobs(json.jobs || [])
    else { if (res.status === 401) window.location.href = '/login'; setError(json.message||'Failed to load jobs') }
  }

  const fetchEmployees = async () => {
    const res = await fetch(`${API_BASE_URL}/api/employees`, { headers: authHdr })
    const json = await res.json()
    if (res.ok) setEmployees(json.employees || [])
  }

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return }
    Promise.all([fetchJobs(), isHr ? fetchEmployees() : Promise.resolve()]).finally(() => setLoading(false))
  }, [])

  const updateProgress = async (jobId, progress, status) => {
    setUpdating(jobId)
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', ...authHdr },
        body: JSON.stringify({ progress: Number(progress), status: status || undefined }),
      })
      const json = await res.json()
      if (!res.ok) { if (res.status===401) window.location.href='/login'; throw new Error(json.message||'Failed') }
      setJobs(prev => prev.map(j => j.id === jobId ? json.job : j))
    } catch (e) { setError(e.message) }
    finally { setUpdating(null) }
  }

  const createJob = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', ...authHdr },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { if (res.status===401) window.location.href='/login'; throw new Error(json.message||'Failed') }
      setJobs(prev => [json.job, ...prev])
      setForm({ title:'', description:'', assigneeEmail:'' })
      setFormOpen(false)
    } catch (e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  if (!token || !user) return null

  const filteredJobs = filterStatus === 'all' ? jobs : jobs.filter(j => j.status === filterStatus)

  const stats = [
    { label:'Total Jobs',   value: jobs.length,                                    icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>), cls:'icon-indigo' },
    { label:'Pending',      value: jobs.filter(j=>j.status==='pending').length,     icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>), cls:'icon-amber' },
    { label:'In Progress',  value: jobs.filter(j=>j.status==='in-progress').length, icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41"/></svg>), cls:'icon-violet' },
    { label:'Completed',    value: jobs.filter(j=>j.status==='completed').length,   icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>), cls:'icon-emerald' },
  ]

  const cV = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.07}} }
  const iV = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{type:'spring',stiffness:80,damping:14}} }

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`main-content ${collapsed?'sidebar-collapsed':''}`}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Job Progress</h1>
            <p>{isHr ? 'Manage and track all employee tasks' : 'Your assigned tasks and progress'}</p>
          </div>
          <div className="topbar-right">
            {isHr && (
              <button
                onClick={() => setFormOpen(o=>!o)}
                style={{
                  padding:'0.5rem 1.1rem', background: formOpen?'#f43f5e':'#6366f1',
                  color:'#fff', border:'none', borderRadius:'10px',
                  fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.85rem',
                  cursor:'pointer', transition:'all 0.2s',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                }}
              >
                {formOpen ? '✕ Cancel' : '+ Assign Job'}
              </button>
            )}
            <div className="topbar-avatar" title={user?.email}>
              {(user?.name||user?.email||'U')[0].toUpperCase()}
            </div>
          </div>
        </div>

        <motion.div className="dashboard-body" variants={cV} initial="hidden" animate="show">

          {/* Stat Cards */}
          <motion.div className="stat-cards-grid" variants={cV}>
            {stats.map((s,i) => (
              <motion.div key={i} className="stat-card" variants={iV}>
                <div className={`stat-card-icon ${s.cls}`}>{s.icon}</div>
                <div className="stat-card-body">
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value">{loading ? '…' : s.value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Assign Job Form */}
          <AnimatePresence>
            {isHr && formOpen && (
              <motion.div
                className="chart-card"
                style={{marginTop:'1.5rem'}}
                initial={{opacity:0, height:0, overflow:'hidden'}}
                animate={{opacity:1, height:'auto', overflow:'visible'}}
                exit={{opacity:0, height:0, overflow:'hidden'}}
                transition={{duration:0.3}}
              >
                <div className="chart-card-header">
                  <h3>Assign New Job</h3>
                </div>
                <form onSubmit={createJob} style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
                    <input
                      placeholder="Job title"
                      value={form.title}
                      onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                      required className="add-emp-input"
                    />
                    <select
                      value={form.assigneeEmail}
                      onChange={e=>setForm(f=>({...f,assigneeEmail:e.target.value}))}
                      required className="add-emp-input"
                    >
                      <option value="">Select employee…</option>
                      {employees.map(emp=>(
                        <option key={emp.id} value={emp.email}>{emp.name} ({emp.email})</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    rows={2} className="add-emp-input"
                    style={{resize:'vertical'}}
                  />
                  <div style={{display:'flex', gap:'0.75rem'}}>
                    <button type="submit" disabled={submitting} className="add-emp-save" style={{flex:'none', padding:'0.6rem 1.5rem'}}>
                      {submitting ? 'Creating…' : '✓ Create Job'}
                    </button>
                    {error && <div className="form-error" style={{flex:1}}>{error}</div>}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jobs List */}
          <motion.div className="chart-card" style={{marginTop:'1.5rem'}} variants={iV}>
            <div className="chart-card-header">
              <h3>{isHr ? `All Jobs (${filteredJobs.length})` : `Your Jobs (${filteredJobs.length})`}</h3>
              <div style={{display:'flex', gap:'0.4rem'}}>
                {['all','pending','in-progress','completed'].map(s=>(
                  <button key={s}
                    onClick={()=>setFilterStatus(s)}
                    style={{
                      padding:'0.3rem 0.75rem', borderRadius:'8px', border:'1px solid',
                      fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                      fontFamily:'var(--font-heading)',
                      background: filterStatus===s ? '#6366f1' : '#f8fafc',
                      color:       filterStatus===s ? '#fff'    : '#64748b',
                      borderColor: filterStatus===s ? '#6366f1' : 'rgba(0,0,0,0.08)',
                    }}
                  >{s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading jobs…</div>
            ) : filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">—</div>
                {filterStatus==='all' ? 'No jobs assigned yet' : `No ${filterStatus} jobs`}
              </div>
            ) : (
              <motion.div style={{display:'flex', flexDirection:'column', gap:'1rem', marginTop:'0.25rem'}} variants={cV} initial="hidden" animate="show">
                <AnimatePresence>
                  {filteredJobs.map(job => (
                    <motion.div
                      key={job.id}
                      layout
                      variants={iV}
                      initial="hidden"
                      animate="show"
                      exit={{opacity:0, scale:0.97, transition:{duration:0.2}}}
                      className="job-card"
                      style={{
                        background:'#fff', border:'1px solid rgba(0,0,0,0.07)',
                        borderRadius:'14px', padding:'1.25rem 1.4rem',
                        borderLeft: `4px solid ${STATUS_CONFIG[job.status]?.color||'#94a3b8'}`,
                        boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
                        transition:'box-shadow 0.25s',
                      }}
                    >
                      {/* Card Header */}
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem'}}>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.95rem', color:'#0f172a'}}>{job.title}</div>
                          {isHr && (
                            <div style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:3}}>
                              Assigned to: <span style={{color:'#6366f1', fontWeight:600}}>{job.assigneeEmail}</span>
                            </div>
                          )}
                          {job.description && (
                            <div style={{fontSize:'0.83rem', color:'#64748b', marginTop:'0.5rem', lineHeight:1.55}}>{job.description}</div>
                          )}
                        </div>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.4rem', flexShrink:0}}>
                          <span style={{
                            padding:'0.25rem 0.7rem', borderRadius:'999px',
                            fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.04em',
                            background: STATUS_CONFIG[job.status]?.bg || 'rgba(148,163,184,0.12)',
                            color:       STATUS_CONFIG[job.status]?.color || '#94a3b8',
                          }}>
                            {STATUS_CONFIG[job.status]?.icon} {STATUS_CONFIG[job.status]?.label||job.status}
                          </span>
                          <span style={{fontSize:'0.7rem', color:'#cbd5e1'}}>
                            {new Date(job.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{marginTop:'1rem'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem'}}>
                          <span style={{fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em'}}>Progress</span>
                          <span style={{fontSize:'0.82rem', fontWeight:700, color: STATUS_CONFIG[job.status]?.color||'#6366f1'}}>{job.progress||0}%</span>
                        </div>
                        <div style={{height:'8px', background:'#f1f5f9', borderRadius:'999px', overflow:'hidden', position:'relative'}}>
                          <motion.div
                            initial={{width:0}}
                            animate={{width:`${job.progress||0}%`}}
                            transition={{duration:0.6, type:'spring'}}
                            style={{
                              height:'100%', borderRadius:'999px',
                              background: `linear-gradient(90deg, ${STATUS_CONFIG[job.status]?.color||'#6366f1'}, ${STATUS_CONFIG[job.status]?.color||'#6366f1'}aa)`,
                              position:'absolute', top:0, left:0,
                            }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{marginTop:'1rem', display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', paddingTop:'0.75rem', borderTop:'1px solid rgba(0,0,0,0.05)'}}>
                        {/* Slider */}
                        <label style={{display:'flex', alignItems:'center', gap:'0.6rem', flex:'1', minWidth:'180px'}}>
                          <input
                            type="range" min="0" max="100" value={job.progress||0}
                            onChange={e=>{
                              const v=Number(e.target.value)
                              setJobs(prev=>prev.map(j=>j.id===job.id?{...j,progress:v}:j))
                            }}
                            onMouseUp={e=>{
                              const v=Number(e.target.value)
                              const s=v===100?'completed':v>0?'in-progress':'pending'
                              updateProgress(job.id,v,s)
                            }}
                            onTouchEnd={e=>{
                              const v=Number(e.currentTarget.value)
                              const s=v===100?'completed':v>0?'in-progress':'pending'
                              updateProgress(job.id,v,s)
                            }}
                            disabled={updating===job.id}
                            style={{flex:1, accentColor: STATUS_CONFIG[job.status]?.color||'#6366f1'}}
                          />
                        </label>

                        {/* Status buttons */}
                        <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
                          {Object.entries(STATUS_CONFIG).map(([s,cfg])=>(
                            <button
                              key={s}
                              disabled={updating===job.id || job.status===s}
                              onClick={()=>updateProgress(job.id, job.progress||0, s)}
                              style={{
                                padding:'0.28rem 0.7rem', borderRadius:'8px',
                                border:`1px solid ${job.status===s ? cfg.color : 'rgba(0,0,0,0.08)'}`,
                                background: job.status===s ? cfg.bg : '#f8fafc',
                                color: job.status===s ? cfg.color : '#64748b',
                                fontSize:'0.73rem', fontWeight:600, cursor: job.status===s?'default':'pointer',
                                transition:'all 0.2s', fontFamily:'var(--font-heading)',
                                opacity: updating===job.id ? 0.5 : 1,
                              }}
                            >
                              {cfg.icon} {cfg.label}
                            </button>
                          ))}
                          {updating===job.id && <span style={{fontSize:'0.73rem', color:'#94a3b8', fontStyle:'italic', alignSelf:'center'}}>Saving…</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}

export default JobProgress
