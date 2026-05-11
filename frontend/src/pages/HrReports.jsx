import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import './hr-dashboard-new.css'

/* ── Mock data ─────────────────────────── */
const MONTHLY_EMP = [
  { month:'Nov', count:32 }, { month:'Dec', count:34 }, { month:'Jan', count:35 },
  { month:'Feb', count:33 }, { month:'Mar', count:36 }, { month:'Apr', count:37 },
]
const MAX_EMP = 40

const ATT_DATA = [
  { month:'Nov', present:88, absent:8, leave:4 },
  { month:'Dec', present:82, absent:12, leave:6 },
  { month:'Jan', present:90, absent:6, leave:4 },
  { month:'Feb', present:85, absent:10, leave:5 },
  { month:'Mar', present:87, absent:8, leave:5 },
  { month:'Apr', present:92, absent:5, leave:3 },
]

const TICKET_DATA = [
  { category:'General', count:18, color:'#6366f1' },
  { category:'IT',      count:12, color:'#8b5cf6' },
  { category:'Payroll', count:7,  color:'#f59e0b' },
  { category:'Facilities', count:5, color:'#10b981' },
  { category:'Safety',  count:4,  color:'#f43f5e' },
]

const DEPT_STATS = [
  { dept:'Engineering', employees:12, present:11, absent:1, tickets:6 },
  { dept:'Marketing',   employees:7,  present:6,  absent:1, tickets:3 },
  { dept:'Operations',  employees:9,  present:8,  absent:1, tickets:4 },
  { dept:'HR',          employees:4,  present:4,  absent:0, tickets:2 },
  { dept:'Finance',     employees:5,  present:5,  absent:0, tickets:1 },
]

const COLORS = ['#6366f1','#8b5cf6','#f59e0b','#10b981','#f43f5e']

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
              style={{ height:'100%', background:d.color, borderRadius:'999px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Stacked area bars ─────────────────── */
function StackedBars({ data }) {
  const max = 100
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:'140px', paddingBottom:'1.5rem', position:'relative' }}>
      <div style={{ position:'absolute', bottom:'1.5rem', left:0, right:0, height:'1px', background:'rgba(0,0,0,0.06)' }} />
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem', height:'100%', justifyContent:'flex-end' }}>
          <div style={{ display:'flex', gap:'2px', alignItems:'flex-end', flex:1, width:'100%', justifyContent:'center' }}>
            <motion.div initial={{ height:0 }} animate={{ height:`${(d.present/max)*100}%` }}
              transition={{ duration:0.8, delay:i*0.05, ease:'easeOut' }}
              style={{ width:14, background:'#6366f1', borderRadius:'4px 4px 0 0', minWidth:14 }} title={`Present: ${d.present}%`} />
            <motion.div initial={{ height:0 }} animate={{ height:`${(d.absent/max)*100}%` }}
              transition={{ duration:0.8, delay:i*0.05+0.05, ease:'easeOut' }}
              style={{ width:14, background:'#f43f5e', borderRadius:'4px 4px 0 0', minWidth:14 }} title={`Absent: ${d.absent}%`} />
            <motion.div initial={{ height:0 }} animate={{ height:`${(d.leave/max)*100}%` }}
              transition={{ duration:0.8, delay:i*0.05+0.1, ease:'easeOut' }}
              style={{ width:14, background:'#f59e0b', borderRadius:'4px 4px 0 0', minWidth:14 }} title={`Leave: ${d.leave}%`} />
          </div>
          <div style={{ fontSize:'0.62rem', color:'#94a3b8', fontWeight:500 }}>{d.month}</div>
        </div>
      ))}
    </div>
  )
}

const HrReports = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [dateRange, setDateRange] = useState('last6')

  const containerV = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
  const itemV = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:80, damping:14 } } }

  const totalTickets = TICKET_DATA.reduce((a,d)=>a+d.count,0)

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar">
          <div className="topbar-left">
            <h1>Reports & Analytics</h1>
            <p>HR insights and performance overview</p>
          </div>
          <div className="topbar-right">
            {/* Date filter */}
            <select value={dateRange} onChange={e=>setDateRange(e.target.value)}
              style={{ padding:'0.5rem 1rem', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'#f8fafc', color:'#334155', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer' }}>
              <option value="last6">Last 6 Months</option>
              <option value="last3">Last 3 Months</option>
              <option value="thisYear">This Year</option>
            </select>
            {/* Export buttons */}
            <button style={{ padding:'0.5rem 1rem', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'#fff', color:'#334155', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              Export PDF
            </button>
            <button style={{ padding:'0.5rem 1rem', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)', background:'#fff', color:'#334155', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              Export Excel
            </button>
          </div>
        </div>

        <motion.div className="dashboard-body" variants={containerV} initial="hidden" animate="show">
          {/* KPI row */}
          <motion.div className="stat-cards-grid" variants={containerV}>
            {[
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>), label:'Total Employees',   value:37, change:'+5 this year',  trend:'up',     cls:'icon-indigo' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>), label:'Avg Attendance',    value:'87%', change:'+2% vs last month', trend:'up', cls:'icon-emerald' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>), label:'Total Tickets',     value:totalTickets, change:'16 resolved', trend:'neutral', cls:'icon-amber' },
              { icon:(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>), label:'Avg Performance',   value:'91%', change:'Top quartile',  trend:'up',   cls:'icon-rose' },
            ].map((c,i) => (
              <motion.div key={i} className="stat-card" variants={itemV}>
                <div className={`stat-card-icon ${c.cls}`}>{c.icon}</div>
                <div className="stat-card-body">
                  <div className="stat-card-label">{c.label}</div>
                  <div className="stat-card-value">{c.value}</div>
                  <span className={`stat-card-change change-${c.trend}`}>
                    {c.trend==='up'?'↑':c.trend==='down'?'↓':'•'} {c.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts row */}
          <motion.div className="charts-row" variants={containerV}>
            {/* Attendance trend */}
            <motion.div className="chart-card" variants={itemV}>
              <div className="chart-card-header">
                <h3>Attendance Trends (6 Months)</h3>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-dot" style={{background:'#6366f1'}}/>Present</span>
                  <span className="legend-item"><span className="legend-dot" style={{background:'#f43f5e'}}/>Absent</span>
                  <span className="legend-item"><span className="legend-dot" style={{background:'#f59e0b'}}/>Leave</span>
                </div>
              </div>
              <StackedBars data={ATT_DATA} />
            </motion.div>

            {/* Ticket breakdown */}
            <motion.div className="chart-card" variants={itemV}>
              <div className="chart-card-header">
                <h3>Tickets by Category</h3>
              </div>
              <HBarChart data={TICKET_DATA} max={Math.max(...TICKET_DATA.map(d=>d.count))} />
              <div style={{ marginTop:'1rem', padding:'0.75rem', background:'#f8fafc', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.82rem', color:'#64748b' }}>Total Tickets</span>
                <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, color:'#0f172a' }}>{totalTickets}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Employee growth chart */}
          <motion.div className="chart-card" variants={itemV}>
            <div className="chart-card-header">
              <h3>Employee Growth</h3>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'1rem', height:'120px', paddingBottom:'1.5rem', position:'relative' }}>
              <div style={{ position:'absolute', bottom:'1.5rem', left:0, right:0, height:'1px', background:'rgba(0,0,0,0.06)' }} />
              {MONTHLY_EMP.map((d,i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem', height:'100%', justifyContent:'flex-end' }}>
                  <div style={{ fontSize:'0.7rem', color:'#6366f1', fontWeight:700 }}>{d.count}</div>
                  <motion.div initial={{ height:0 }} animate={{ height:`${(d.count/MAX_EMP)*100}%` }}
                    transition={{ duration:0.8, delay:i*0.07, ease:'easeOut' }}
                    style={{ width:'100%', background:'linear-gradient(to top, #6366f1, #818cf8)', borderRadius:'6px 6px 0 0' }} />
                  <div style={{ fontSize:'0.68rem', color:'#94a3b8', fontWeight:500 }}>{d.month}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Department breakdown table */}
          <motion.div className="chart-card" variants={itemV}>
            <div className="chart-card-header">
              <h3>Department Breakdown</h3>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0 0.4rem', fontSize:'0.875rem' }}>
                <thead>
                  <tr>
                    {['Department','Employees','Present','Absent','Attendance %','Tickets'].map(h=>(
                      <th key={h} style={{ textAlign:'left', padding:'0.5rem 0.75rem', fontSize:'0.7rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPT_STATS.map((d,i)=>(
                    <tr key={i}>
                      <td style={{ padding:'0.75rem', fontWeight:600, color:'#0f172a', background:'#f8fafc', borderRadius:'8px 0 0 8px' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <span style={{ width:10, height:10, borderRadius:'3px', background:COLORS[i], display:'inline-block' }} />
                          {d.dept}
                        </span>
                      </td>
                      <td style={{ padding:'0.75rem', color:'#334155', background:'#f8fafc', fontWeight:600 }}>{d.employees}</td>
                      <td style={{ padding:'0.75rem', color:'#059669', background:'#f8fafc', fontWeight:600 }}>{d.present}</td>
                      <td style={{ padding:'0.75rem', color:'#f43f5e', background:'#f8fafc', fontWeight:600 }}>{d.absent}</td>
                      <td style={{ padding:'0.75rem', background:'#f8fafc' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <div style={{ flex:1, height:6, background:'#e2e8f0', borderRadius:'999px', overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${Math.round((d.present/d.employees)*100)}%`, background:COLORS[i], borderRadius:'999px' }} />
                          </div>
                          <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#0f172a', minWidth:32 }}>{Math.round((d.present/d.employees)*100)}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'0.75rem', color:'#6366f1', background:'#f8fafc', fontWeight:700, borderRadius:'0 8px 8px 0' }}>{d.tickets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default HrReports
