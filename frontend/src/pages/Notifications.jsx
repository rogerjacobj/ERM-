import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ToastNotification from '../components/ToastNotification'
import { API_BASE_URL } from '../config/api'
import { database, ref, onValue, off } from '../config/firebase'
import './hr-dashboard-new.css'

function decodeToken() {
  try { return JSON.parse(atob(localStorage.getItem('token'))) } catch { return null }
}

const ICON_MAP = {
  new_ticket:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ticket_update:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>,
  emergency_update:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  default:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
}

const TYPE_COLORS = {
  new_ticket: '#6366f1',
  ticket_update: '#10b981',
  emergency_update: '#f43f5e',
  default: '#8b5cf6',
}
const TYPE_BG = {
  new_ticket: '#e0e7ff',
  ticket_update: '#dcfce7',
  emergency_update: '#fee2e2',
  default: '#f3e8ff',
}

const Notifications = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [toasts, setToasts] = useState([])

  const user = decodeToken()
  const token = localStorage.getItem('token')
  const authHdr = { Authorization: token ? `Bearer ${token}` : '' }

  // Fetch notifications from REST API
  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: authHdr })
      if (res.ok) {
        const j = await res.json()
        setNotifs(j.notifications || [])
      }
    } catch (_) {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return }
    fetchNotifs()
  }, [])

  // Firebase real-time listener
  useEffect(() => {
    if (!database || !user) return
    const email = user.email || ''
    const sanitized = email.replace(/[.#$[\]]/g, '_')
    // Listen to user-specific notifications
    const userRef = ref(database, `notifications/${sanitized}`)
    const hrRef = user.role === 'hr' ? ref(database, 'notifications/hr_channel') : null

    const handleSnapshot = (snapshot) => {
      const data = snapshot.val()
      if (!data) return
      const entries = Object.values(data)
      if (entries.length > 0) {
        const latest = entries[entries.length - 1]
        // Show toast for new notifications (within last 10s)
        if (latest.timestamp && Date.now() - latest.timestamp < 10000) {
          setToasts(prev => [...prev, { ...latest, id: `toast-${Date.now()}-${Math.random()}` }])
          fetchNotifs() // Refresh list
        }
      }
    }

    onValue(userRef, handleSnapshot)
    if (hrRef) onValue(hrRef, handleSnapshot)

    return () => {
      off(userRef)
      if (hrRef) off(hrRef)
    }
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const markAllRead = async () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })))
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, { method: 'PATCH', headers: authHdr })
    } catch (_) {}
  }

  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id))

  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs
  const unreadCount = notifs.filter(n => !n.read).length

  const containerV = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.06 } } }
  const itemV = { hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:80, damping:14 } } }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff/60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)} hr ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <ToastNotification toasts={toasts} removeToast={removeToast} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Notifications</h1>
            <p>{unreadCount} unread alerts</p>
          </div>
          <div className="topbar-right">
            <button onClick={markAllRead} style={{ padding:'0.5rem 1rem', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer' }}>
              Mark all read
            </button>
          </div>
        </div>

        <motion.div className="dashboard-body" variants={containerV} initial="hidden" animate="show">
          {/* Filter pills */}
          <motion.div variants={itemV} style={{ display:'flex', gap:'0.5rem' }}>
            {['all','unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:'0.45rem 1.1rem', borderRadius:'999px', border:'1px solid', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', transition:'all 0.2s',
                  background: filter===f ? '#6366f1' : 'transparent',
                  color: filter===f ? '#fff' : '#64748b',
                  borderColor: filter===f ? '#6366f1' : 'rgba(0,0,0,0.1)' }}>
                {f === 'all' ? 'All Notifications' : `Unread (${unreadCount})`}
              </button>
            ))}
          </motion.div>

          <motion.div className="chart-card" variants={itemV}>
            <div className="chart-card-header" style={{ marginBottom:'1rem' }}>
              <h3>Alerts</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {loading ? (
                <div className="empty-state">Loading notifications…</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map(n => (
                    <motion.div key={n.id || n._id}
                      layout
                      initial={{ opacity:0, x:-10 }}
                      animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:20, height:0 }}
                      style={{ display:'flex', gap:'0.85rem', padding:'0.9rem 0', borderBottom:'1px solid rgba(0,0,0,0.04)', alignItems:'flex-start', position:'relative' }}>
                      {!n.read && (
                        <div style={{ position:'absolute', left:-4, top:'50%', transform:'translateY(-50%)', width:8, height:8, borderRadius:'50%', background: TYPE_COLORS[n.type] || TYPE_COLORS.default }} />
                      )}
                      <div style={{ width:38, height:38, borderRadius:'50%', background: TYPE_BG[n.type] || TYPE_BG.default, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                        {ICON_MAP[n.type] || ICON_MAP.default}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
                          <div style={{ fontWeight: !n.read ? 700 : 500, fontSize:'0.875rem', color:'#0f172a' }}>{n.title}</div>
                          <button onClick={() => dismiss(n.id || n._id)}
                            style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'1rem', flexShrink:0, lineHeight:1, padding:0 }}>✕</button>
                        </div>
                        <div style={{ fontSize:'0.8rem', color:'#64748b', marginTop:2 }}>{n.message}</div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:4 }}>{formatTime(n.createdAt || n.timestamp)}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Notifications
