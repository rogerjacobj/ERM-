import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
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
    fetch('/api/all-tickets', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((json) => setTicketsByUser(json.ticketsByUser || {}))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

    // Fetch employees
    fetch('/api/employees', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
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
      const res = await fetch(`/api/employee-tickets/${ticketId}`, {
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
      const res = await fetch('/api/employees', {
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
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      setEmployees(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="dashboard-root">
      <Navbar />
      <main className="page-container">
        <div className="header-row">
          <h1>HR Dashboard</h1>
          <button className="dash-btn-logout" onClick={logout}>Logout</button>
        </div>

        {loading && <div className="dash-loading">Loading…</div>}
        {error && <div className="dash-error" role="alert">{error}</div>}

        <div className="main-grid">
          <div>
            <div className="card">
              <h3>All complaint tickets</h3>
              {Object.keys(ticketsByUser).length === 0 && <div className="small">No tickets</div>}
              {Object.entries(ticketsByUser).map(([user, list]) => (
                <div key={user} className="user-block">
                  <h4>{user}</h4>
                  <div className="ticket-list">
                    {list.map(t => (
                          <div key={t.id} className={`ticket ${t._transient === 'updated' ? 'updated' : ''}`}>
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
                          </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="card">
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
                <div className="employee-list">
                  {employees.map(emp => (
                    <div key={emp.id} className={`employee-card ${emp._transient === 'new' ? 'new' : ''}`}>
                      <div className="employee-info">
                        <div className="name">{emp.name}</div>
                        <div className="small">{emp.email}</div>
                        <div className="meta">
                          <span className="badge">{emp.role}</span>
                          {emp.department && <span className="small"> • {emp.department}</span>}
                        </div>
                      </div>
                      <button onClick={() => removeEmployee(emp.id)} className="icon-btn danger">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default HrDashboard
