import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config/api'
import { motion, AnimatePresence } from 'framer-motion'
import './tickets.css'
import './dashboard.css'

const HrDashboard = () => {
  const [employees, setEmployees] = useState([])
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    employeeRole: 'employee'
  })
  const [ticketsByUser, setTicketsByUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    // Fetch tickets
    fetch(`${API_BASE_URL}/api/all-tickets`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((json) => setTicketsByUser(json.ticketsByUser || {}))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

    // Fetch employees
    fetch(`${API_BASE_URL}/api/employees`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((json) => setEmployees(json.employees || []))
      .catch((err) => setError(err.message))
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const updateStatus = async (ticketId, newStatus) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const json = await res.json()
      // update local state and mark updated for highlight
      setTicketsByUser((prev) => {
        const next = { ...prev }
        for (const u in next) {
          next[u] = next[u].map(t => t.id === ticketId ? { ...json.ticket, _transient: 'updated' } : t)
        }
        return next
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const addEmployee = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(newEmployee),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || `Status ${res.status}`)
      }
      const { employee } = await res.json()
      setEmployees(prev => [...prev, { ...employee, _transient: 'new' }])
      setNewEmployee({ name: '', email: '', department: '', employeeRole: 'employee' })
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeEmployee = async (id) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      setEmployees(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 12 } }
  }

  return (
    <div className="dashboard-root">
      <Navbar />
      <motion.main 
        className="page-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="header-row">
          <h1>HR Dashboard</h1>
          <button className="dash-btn-logout" onClick={logout}>Logout</button>
        </div>

        {loading && <div className="dash-loading">Loading…</div>}
        {error && <div className="dash-error" role="alert">{error}</div>}

        <motion.div className="main-grid" variants={containerVariants} initial="hidden" animate="show">
          <div>
            <motion.div variants={itemVariants} className="card glass-panel">
              <h3>All complaint tickets</h3>
              {Object.keys(ticketsByUser).length === 0 && <div className="small">No tickets</div>}
              {Object.entries(ticketsByUser).map(([user, list]) => (
                <div key={user} className="user-block">
                  <h4>{user}</h4>
                  <div className="ticket-list">
                    <AnimatePresence>
                      {list.map(t => (
                        <motion.div 
                          key={t.id} 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`ticket ${t._transient === 'updated' ? 'updated' : ''}`}
                        >
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div className="title">{t.title} <span className="small">({t.category})</span></div>
                            <div><span className={`badge ${t.status.replace(/\s+/g,'-')}`}>{t.status}</span></div>
                          </div>
                          <div className="meta">{t.status} — {new Date(t.createdAt).toLocaleString()}</div>
                          <div className="desc">{t.description}</div>
                          <div className="controls">
                            <button className="icon-btn primary" onClick={()=>updateStatus(t.id,'in-progress')}>In Progress</button>
                            <button className="icon-btn" onClick={()=>updateStatus(t.id,'resolved')}>Resolve</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <aside>
            <motion.div variants={itemVariants} className="card glass-panel">
              <h3>Employee Management</h3>
              <form onSubmit={addEmployee} className="employee-form">
                <div className="form-row">
                  <input 
                    placeholder="Name" 
                    value={newEmployee.name} 
                    onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-row">
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={newEmployee.email} 
                    onChange={e => setNewEmployee(prev => ({ ...prev, email: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-row">
                  <input 
                    placeholder="Department" 
                    value={newEmployee.department} 
                    onChange={e => setNewEmployee(prev => ({ ...prev, department: e.target.value }))} 
                  />
                </div>
                <div className="form-row">
                  <select 
                    value={newEmployee.employeeRole} 
                    onChange={e => setNewEmployee(prev => ({ ...prev, employeeRole: e.target.value }))}
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
                <div className="form-row">
                  <button type="submit" className="icon-btn primary">Add Employee</button>
                </div>
              </form>

              <div className="employee-section">
                <h4>Current Employees</h4>
                <motion.div className="employee-list" variants={containerVariants} initial="hidden" animate="show">
                  <AnimatePresence>
                    {employees.map(emp => (
                      <motion.div 
                        key={emp.id} 
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, x: -20 }}
                        className={`employee-card ${emp._transient === 'new' ? 'new' : ''}`}
                      >
                        <div className="employee-info">
                          <div className="name">{emp.name}</div>
                          <div className="small">{emp.email}</div>
                          <div className="meta">
                            <span className="badge">{emp.role}</span>
                            {emp.department && <span className="small"> • {emp.department}</span>}
                          </div>
                        </div>
                        <button onClick={() => removeEmployee(emp.id)} className="icon-btn danger">Remove</button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </aside>
        </motion.div>
      </motion.main>
    </div>
  )
}

export default HrDashboard
