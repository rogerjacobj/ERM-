import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import './AttendanceNew.css'
import './hr-dashboard-new.css'

function decodeToken() {
  try { return JSON.parse(atob(localStorage.getItem('token'))) } catch { return null }
}

function formatTime(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) } catch { return iso }
}

function formatDuration(s, e) {
  if (!s || !e) return '—'
  const ms = new Date(e) - new Date(s)
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/* Calendar builder */
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function buildCal(year, month, records) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const todayStr = new Date().toDateString()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push({ empty:true })
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d)
    const dow = dt.getDay()
    const isToday = dt.toDateString() === todayStr
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const rec = records.find(r => r.date === dateStr)
    let status = 'empty'
    if (dow !== 0 && dow !== 6) {
      if (rec) status = rec.checkOut ? 'present' : 'present'
      else if (dt < new Date() && !isToday) status = 'absent'
    }
    cells.push({ day:d, status, isToday, rec })
  }
  return cells
}

const AttendanceNew = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [today, setToday] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [empFilter, setEmpFilter] = useState('')
  const [clock, setClock] = useState(new Date())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  const user = decodeToken()
  const isHr = user?.role === 'hr'
  const token = localStorage.getItem('token')

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchAll = async () => {
    if (!token) { window.location.href = '/login'; return }
    const hdr = { Authorization: `Bearer ${token}` }
    try {
      const [todayRes, recRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/attendance/today`, { headers: hdr }),
        fetch(`${API_BASE_URL}/api/${isHr ? `attendance/all${empFilter?'?employeeEmail='+encodeURIComponent(empFilter):''}` : 'attendance'}`, { headers: hdr }),
      ])
      const tj = await todayRes.json()
      const rj = await recRes.json()
      if (todayRes.ok) setToday(tj.attendance)
      if (recRes.ok) setRecords(rj.attendance || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (isHr) fetchAll() }, [empFilter])

  const clockIn = async () => {
    setActionLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clock-in`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message)
      setToday(j.attendance)
      setRecords(r => [j.attendance, ...r])
    } catch(e) { setError(e.message) }
    finally { setActionLoading(false) }
  }

  const clockOut = async () => {
    setActionLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clock-out`, {
        method:'PATCH',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ notes }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message)
      setToday(j.attendance)
      setRecords(r => r.map(x => x.id===today?.id ? j.attendance : x))
      setNotes('')
    } catch(e) { setError(e.message) }
    finally { setActionLoading(false) }
  }

  const cells = buildCal(calYear, calMonth, records)
  const presentCount = cells.filter(c=>c.status==='present').length
  const absentCount  = cells.filter(c=>c.status==='absent').length

  const containerV = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.07}} }
  const itemV = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{type:'spring',stiffness:80,damping:14}} }

  return (
    <div className="att-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`att-content ${collapsed?'collapsed':''}`}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Attendance</h1>
            <p>{isHr ? 'Organization attendance overview' : 'Your attendance tracking'}</p>
          </div>
          {isHr && (
            <div className="topbar-right">
              <input className="att-filter-input" placeholder="Filter by email…"
                value={empFilter} onChange={e=>setEmpFilter(e.target.value)} />
            </div>
          )}
        </div>

        <motion.div className="att-page-body" variants={containerV} initial="hidden" animate="show">
          {/* Today panel — employee only */}
          {!isHr && (
            <motion.div className="att-today-panel" variants={itemV}>
              <div>
                <div className="att-today-clock">
                  {clock.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                </div>
                <div className="att-today-date">
                  {clock.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                </div>
              </div>
              <div className="att-divider" />
              <div className="att-action-area">
                <div className="att-action-status">
                  {!today?.checkIn && 'You have not clocked in yet.'}
                  {today?.checkIn && !today?.checkOut && <>Clocked in at <strong>{formatTime(today.checkIn)}</strong> — session active</>}
                  {today?.checkOut && <>Shift complete · Duration: <strong>{formatDuration(today.checkIn, today.checkOut)}</strong></>}
                </div>
                {!today?.checkIn && (
                  <div className="att-btn-row">
                    <button className="att-btn-primary" onClick={clockIn} disabled={actionLoading}>
                      {actionLoading ? 'Connecting…' : '▶ Start Shift'}
                    </button>
                  </div>
                )}
                {today?.checkIn && !today?.checkOut && (
                  <div style={{ width:'100%' }}>
                    <textarea className="att-notes-inline" rows={2}
                      placeholder="Activity notes (optional)…"
                      value={notes} onChange={e=>setNotes(e.target.value)} />
                    <div className="att-btn-row">
                      <button className="att-btn-danger" onClick={clockOut} disabled={actionLoading}>
                        {actionLoading ? 'Finalizing…' : '⏹ End Shift'}
                      </button>
                    </div>
                  </div>
                )}
                {today?.checkOut && (
                  <div className="att-done-msg">✅ Attendance recorded for today</div>
                )}
              </div>
            </motion.div>
          )}

          {error && <div style={{ background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', borderRadius:'10px', padding:'0.85rem 1rem', fontSize:'0.875rem' }}>{error}</div>}

          {/* Summary chips */}
          <motion.div variants={itemV} className="att-summary-chips">
            <div className="att-chip att-chip-p">📅 Present: {loading?'…':presentCount}</div>
            <div className="att-chip att-chip-a">❌ Absent: {loading?'…':absentCount}</div>
            <div className="att-chip att-chip-l">🟡 Leave: 0</div>
            <div className="att-chip att-chip-c">✅ Total Records: {loading?'…':records.length}</div>
          </motion.div>

          <motion.div variants={itemV} className="att-grid">
            {/* Calendar */}
            <div className="att-cal-card">
              <div className="att-cal-nav">
                <button className="att-cal-arrow"
                  onClick={()=>{ let m=calMonth-1,y=calYear; if(m<0){m=11;y--}; setCalMonth(m);setCalYear(y) }}>◀</button>
                <h3>{MONTHS[calMonth]} {calYear}</h3>
                <button className="att-cal-arrow"
                  onClick={()=>{ let m=calMonth+1,y=calYear; if(m>11){m=0;y++}; setCalMonth(m);setCalYear(y) }}>▶</button>
              </div>
              <div className="att-cal-grid">
                {DAYS.map(d => <div key={d} className="att-cal-day-hdr">{d}</div>)}
                {cells.map((c,i) => (
                  <div key={i} className={`att-cal-cell ${c.empty?'empty':c.isToday?'today':c.status}`}>
                    {c.empty?'':c.day}
                  </div>
                ))}
              </div>
              <div className="att-legend">
                {[{label:'Present',color:'rgba(99,102,241,0.2)'},{label:'Absent',color:'rgba(244,63,94,0.2)'},{label:'Leave',color:'rgba(245,158,11,0.2)'},{label:'Today',color:'#6366f1'}].map(l=>(
                  <div key={l.label} className="att-legend-item">
                    <div className="att-legend-dot" style={{background:l.color}} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Records list */}
            <div className="att-records-card">
              <div className="att-records-header">
                <h3>{isHr ? 'Organization Records' : 'My Sessions'}</h3>
              </div>
              {loading ? (
                <div className="att-empty">Loading…</div>
              ) : records.length === 0 ? (
                <div className="att-empty">No attendance records found.</div>
              ) : (
                <div className="att-records-list">
                  {records.map((r,i) => (
                    <div key={r.id||i} className="att-record-row">
                      <div className="att-record-avatar">
                        {isHr ? (r.employeeEmail||'?')[0].toUpperCase() : (user?.name||'U')[0].toUpperCase()}
                      </div>
                      <div className="att-record-info">
                        <div className="att-record-name">{isHr ? r.employeeEmail : r.date}</div>
                        <div className="att-record-time">
                          {isHr && <span>{r.date} · </span>}
                          In: {formatTime(r.checkIn)}
                          {r.checkOut && <> · Out: {formatTime(r.checkOut)} · {formatDuration(r.checkIn,r.checkOut)}</>}
                        </div>
                      </div>
                      <span className={`att-record-badge ${r.checkOut?'complete':'active'}`}>
                        {r.checkOut ? 'Complete' : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default AttendanceNew
