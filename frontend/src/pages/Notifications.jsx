import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import './hr-dashboard-new.css'

const NOTIFS = [
  { id:1, icon:'👤', color:'#e0e7ff', title:'New Employee Added', desc:'Alice Johnson joined the Engineering team.', time:'2 min ago', unread:true, type:'info' },
  { id:2, icon:'✅', color:'#dcfce7', title:'Leave Approved',    desc:"Bob Smith's leave request has been approved.", time:'18 min ago', unread:true, type:'success' },
  { id:3, icon:'🎫', color:'#fef3c7', title:'New Support Ticket', desc:'Carol White submitted ticket #T-042.', time:'1 hr ago', unread:true, type:'warning' },
  { id:4, icon:'🔴', color:'#fee2e2', title:'Emergency Complaint', desc:'Dan Brown filed an emergency complaint — urgent review needed.', time:'2 hr ago', unread:false, type:'danger' },
  { id:5, icon:'📅', color:'#f3e8ff', title:'Attendance Reminder', desc:'3 employees have not clocked in today.', time:'3 hr ago', unread:false, type:'info' },
  { id:6, icon:'⏱', color:'#e0f2fe', title:'Clock-in Recorded', desc:'Eva Green clocked in at 09:12 AM.', time:'5 hr ago', unread:false, type:'info' },
  { id:7, icon:'📊', color:'#fce7f3', title:'Monthly Report Ready', desc:'April 2025 HR report is ready for download.', time:'Yesterday', unread:false, type:'info' },
]

const ACTIVITY_LOG = [
  { icon:'👤', color:'#e0e7ff', text:'HR added Alice Johnson to Engineering',       time:'Apr 28, 09:00 AM' },
  { icon:'✅', color:'#dcfce7', text:"Leave approved for Bob Smith (5 days)",        time:'Apr 28, 08:45 AM' },
  { icon:'🎫', color:'#fef3c7', text:'Ticket #T-042 submitted by Carol White',       time:'Apr 28, 07:30 AM' },
  { icon:'🔴', color:'#fee2e2', text:'Emergency complaint filed by Dan Brown',        time:'Apr 27, 04:15 PM' },
  { icon:'📅', color:'#f3e8ff', text:'Attendance report generated for April 2025',   time:'Apr 27, 12:00 PM' },
  { icon:'🗑', color:'#fce7f3', text:'Employee Frank removed by HR',                  time:'Apr 26, 03:30 PM' },
]

const TYPE_COLORS = { info:'#6366f1', success:'#10b981', warning:'#f59e0b', danger:'#f43f5e' }

const Notifications = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFS)
  const [filter, setFilter] = useState('all')

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, unread: false })))
  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id))

  const filtered = filter === 'unread' ? notifs.filter(n => n.unread) : notifs

  const containerV = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.06 } } }
  const itemV = { hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:80, damping:14 } } }

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Notifications</h1>
            <p>{notifs.filter(n=>n.unread).length} unread alerts</p>
          </div>
          <div className="topbar-right">
            <button onClick={markAll} style={{ padding:'0.5rem 1rem', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer' }}>
              ✓ Mark all read
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
                {f === 'all' ? 'All Notifications' : `Unread (${notifs.filter(n=>n.unread).length})`}
              </button>
            ))}
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>
            {/* Notification list */}
            <motion.div className="chart-card" variants={itemV} style={{ gridColumn: '1 / 2' }}>
              <div className="chart-card-header" style={{ marginBottom:'1rem' }}>
                <h3>Alerts</h3>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                <AnimatePresence>
                  {filtered.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">🔔</div>
                      No notifications
                    </div>
                  )}
                  {filtered.map(n => (
                    <motion.div key={n.id}
                      layout
                      initial={{ opacity:0, x:-10 }}
                      animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:20, height:0 }}
                      style={{ display:'flex', gap:'0.85rem', padding:'0.9rem 0', borderBottom:'1px solid rgba(0,0,0,0.04)', alignItems:'flex-start', position:'relative' }}>
                      {n.unread && (
                        <div style={{ position:'absolute', left:-4, top:'50%', transform:'translateY(-50%)', width:8, height:8, borderRadius:'50%', background: TYPE_COLORS[n.type] }} />
                      )}
                      <div style={{ width:38, height:38, borderRadius:'50%', background:n.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                        {n.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
                          <div style={{ fontWeight: n.unread ? 700 : 500, fontSize:'0.875rem', color:'#0f172a' }}>{n.title}</div>
                          <button onClick={() => dismiss(n.id)}
                            style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'1rem', flexShrink:0, lineHeight:1, padding:0 }}>✕</button>
                        </div>
                        <div style={{ fontSize:'0.8rem', color:'#64748b', marginTop:2 }}>{n.desc}</div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:4 }}>{n.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Activity log */}
            <motion.div className="chart-card" variants={itemV} style={{ gridColumn:'2 / 3' }}>
              <div className="chart-card-header" style={{ marginBottom:'1rem' }}>
                <h3>Activity Log</h3>
              </div>
              <div className="activity-feed">
                {ACTIVITY_LOG.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-icon" style={{ background:a.color }}>{a.icon}</div>
                    <div className="activity-body">
                      <div className="activity-text">{a.text}</div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Notifications
