import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import './hr-dashboard-new.css'

const COLORS = ['#6366f1','#8b5cf6','#f59e0b','#10b981','#f43f5e','#ec4899','#14b8a6']

function decodeToken() {
  try { return JSON.parse(atob(localStorage.getItem('token'))) } catch { return null }
}

/* ── Horizontal bar chart ─────────────── */
function HBarChart({ data, max }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
      {data.map((d,i) => (
        <div key={i}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'#64748b', fontWeight:500, marginBottom:'0.3rem' }}>
            <span>{d.category}</span>
            <span style={{ fontWeight:700, color:'#0f172a' }}>{d.count}</span>
          </div>
          <div style={{ height:'8px', background:'#f1f5f9', borderRadius:'999px', overflow:'hidden' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${(d.count/max)*100}%` }}
              transition={{ duration:0.9, delay:i*0.08, ease:'easeOut' }}
              style={{ height:'100%', background: COLORS[i % COLORS.length], borderRadius:'999px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const HrReports = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)

  const token = localStorage.getItem('token')
  const authHdr = { Authorization: token ? `Bearer ${token}` : '' }

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return }
    fetch(`${API_BASE_URL}/api/reports/summary`, { headers: authHdr })
      .then(r => r.json())
      .then(j => setReport(j))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const containerV = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
  const itemV = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:80, damping:14 } } }

  const totalTickets = report?.totalTickets || 0
  const ticketsByCategory = (report?.ticketsByCategory || []).map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))
  const departments = report?.departments || []

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Reports & Analytics</h1>
            <p>HR insights from live data</p>
          </div>
          <div className="topbar-right">
            <button style={{ padding:'0.5rem 1rem', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'#fff', color:'#334155', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              Export PDF
            </button>
          </div>
        </div>

        <motion.div className="dashboard-body" variants={containerV} initial="hidden" animate="show">
          {loading ? (
            <div className="empty-state" style={{ padding: '3rem' }}>Loading reports…</div>
          ) : (
            <>
              {/* KPI row */}
              <motion.div className="stat-cards-grid" variants={containerV}>
                {[
                  { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>), label:'Total Employees', value: report?.totalEmployees || 0, cls:'icon-indigo' },
                  { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>), label:'Total Tickets', value: totalTickets, cls:'icon-amber' },
                  { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>), label:'Resolved', value: report?.resolvedTickets || 0, cls:'icon-emerald' },
                  { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>), label:'Open Tickets', value: report?.openTickets || 0, cls:'icon-rose' },
                ].map((c,i) => (
                  <motion.div key={i} className="stat-card" variants={itemV}>
                    <div className={`stat-card-icon ${c.cls}`}>{c.icon}</div>
                    <div className="stat-card-body">
                      <div className="stat-card-label">{c.label}</div>
                      <div className="stat-card-value">{c.value}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts row */}
              <motion.div className="charts-row" variants={containerV}>
                {/* Ticket breakdown */}
                <motion.div className="chart-card" variants={itemV}>
                  <div className="chart-card-header"><h3>Tickets by Category</h3></div>
                  {ticketsByCategory.length === 0 ? (
                    <div className="empty-state">No ticket data</div>
                  ) : (
                    <>
                      <HBarChart data={ticketsByCategory} max={Math.max(...ticketsByCategory.map(d=>d.count), 1)} />
                      <div style={{ marginTop:'1rem', padding:'0.75rem', background:'#f8fafc', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'0.82rem', color:'#64748b' }}>Total Tickets</span>
                        <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, color:'#0f172a' }}>{totalTickets}</span>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Departments */}
                <motion.div className="chart-card" variants={itemV}>
                  <div className="chart-card-header"><h3>Department Breakdown</h3></div>
                  {departments.length === 0 ? (
                    <div className="empty-state">No department data</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'0.5rem' }}>
                      {departments.map((d, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0.75rem', background:'#f8fafc', borderRadius:'10px' }}>
                          <span style={{ width:10, height:10, borderRadius:'3px', background: COLORS[i % COLORS.length], display:'inline-block', flexShrink:0 }} />
                          <span style={{ flex:1, fontSize:'0.85rem', fontWeight:600, color:'#0f172a' }}>{d.name}</span>
                          <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#6366f1' }}>{d.employees} employees</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default HrReports
