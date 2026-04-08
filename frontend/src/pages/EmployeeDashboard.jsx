import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config/api'
import { motion, AnimatePresence } from 'framer-motion'
import './tickets.css'
import './dashboard.css'
import './emergency.css'

const EmployeeDashboard = () => {
  const [data, setData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [emergencyComplaints, setEmergencyComplaints] = useState([])
  const [emergencyStatus, setEmergencyStatus] = useState({ remaining: 2, used: 0, limit: 2, resetAt: null })
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEmergency, setIsEmergency] = useState(false)
  const [activeTab, setActiveTab] = useState('normal') // 'normal' | 'emergency'

  const token = localStorage.getItem('token')
  const authHeaders = { Authorization: token ? `Bearer ${token}` : '' }

  const fetchEmergencyStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/emergency-complaints/status`, { headers: authHeaders })
      if (res.ok) {
        const json = await res.json()
        setEmergencyStatus(json)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/employee-data`, { headers: authHeaders })
      .then(r => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then(json => setData(json.data))
      .catch(err => setError(err.message))

    fetch(`${API_BASE_URL}/api/employee-tickets`, { headers: authHeaders })
      .then(r => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then(json => setTickets(json.tickets || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    fetch(`${API_BASE_URL}/api/emergency-complaints`, { headers: authHeaders })
      .then(r => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then(json => setEmergencyComplaints(json.complaints || []))
      .catch(() => {})

    fetchEmergencyStatus()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const submitTicket = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (isEmergency) {
        // Emergency complaint path
        const res = await fetch(`${API_BASE_URL}/api/emergency-complaints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ title, category, description }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || `Status ${res.status}`)
        setEmergencyComplaints(prev => [{ ...json.complaint, _transient: 'new' }, ...prev])
        fetchEmergencyStatus()
      } else {
        // Normal ticket path
        const res = await fetch(`${API_BASE_URL}/api/employee-tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ title, category, description }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || `Status ${res.status}`)
        setTickets(prev => [{ ...json.ticket, _transient: 'new' }, ...prev])
      }
      setTitle('')
      setCategory('general')
      setDescription('')
      setIsEmergency(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Format reset countdown
  const formatResetTimer = (resetAt) => {
    if (!resetAt) return null
    const diff = new Date(resetAt) - new Date()
    if (diff <= 0) return 'Resetting soon…'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `Resets in ${days}d ${hours}h`
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `Resets in ${hours}h ${mins}m`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 12 } }
  }

  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter)
  const limitReached = emergencyStatus.remaining === 0

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
          <h1>Employee Dashboard</h1>
          <button className="dash-btn-logout" onClick={logout}>Logout</button>
        </div>

        {error && <div className="dash-error" role="alert">{error}</div>}

        <motion.div className="stats-grid" variants={containerVariants} initial="hidden" animate="show">
          <motion.div variants={itemVariants} className="card">
            <h3>Welcome</h3>
            <div className="stat">{data ? data.welcome : '—'}</div>
            <div className="small">Employee portal</div>
          </motion.div>
          <motion.div variants={itemVariants} className="card">
            <h3>Open Tasks</h3>
            <div className="stat">{data ? data.tasks.length : 0}</div>
            <div className="small">Tasks assigned</div>
          </motion.div>
          {/* Emergency quota card */}
          <motion.div variants={itemVariants} className={`card emergency-quota-card ${limitReached ? 'limit-reached' : ''}`}>
            <h3>🚨 Emergency Quota</h3>
            <div className="emergency-quota-display">
              {[...Array(emergencyStatus.limit)].map((_, i) => (
                <div
                  key={i}
                  className={`quota-dot ${i < emergencyStatus.used ? 'used' : 'available'}`}
                />
              ))}
            </div>
            <div className="stat emergency-stat">{emergencyStatus.remaining}<span className="stat-suffix">/{emergencyStatus.limit}</span></div>
            <div className="small">
              {limitReached
                ? <span className="reset-timer">⏱ {formatResetTimer(emergencyStatus.resetAt)}</span>
                : 'Emergency complaints left'}
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="main-grid" variants={containerVariants} initial="hidden" animate="show">
          <div>
            {/* Form card */}
            <motion.div variants={itemVariants} className="card">
              <div className="complaint-form-header">
                <h3>Submit a Complaint</h3>
                {/* Emergency toggle */}
                <button
                  type="button"
                  className={`emergency-toggle ${isEmergency ? 'active' : ''}`}
                  onClick={() => setIsEmergency(p => !p)}
                  disabled={limitReached && !isEmergency}
                  title={limitReached ? 'Emergency limit reached for this 14-day window' : 'Mark as emergency'}
                >
                  <span className="toggle-icon">🚨</span>
                  <span>{isEmergency ? 'Emergency' : 'Normal'}</span>
                  {isEmergency && (
                    <span className="emergency-badge-inline">{emergencyStatus.remaining} left</span>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {isEmergency && (
                  <motion.div
                    className="emergency-notice"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span>⚠️</span>
                    <span>
                      Emergency complaints are reserved for urgent workplace issues.
                      You have <strong>{emergencyStatus.remaining}</strong> of <strong>{emergencyStatus.limit}</strong> remaining
                      {emergencyStatus.resetAt && ` · ${formatResetTimer(emergencyStatus.resetAt)}`}.
                    </span>
                  </motion.div>
                )}
                {limitReached && (
                  <motion.div
                    className="emergency-notice limit"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span>🚫</span>
                    <span>
                      Emergency complaint limit reached for this 14-day window.
                      {emergencyStatus.resetAt && <> <strong>{formatResetTimer(emergencyStatus.resetAt)}</strong>.</>}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="ticket-form" onSubmit={submitTicket}>
                <div className="form-row">
                  <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="general">General</option>
                    <option value="payroll">Payroll</option>
                    <option value="it">IT</option>
                    <option value="facilities">Facilities</option>
                    <option value="safety">Safety</option>
                    <option value="harassment">Harassment</option>
                  </select>
                </div>
                <div className="form-row">
                  <textarea placeholder="Describe your issue in detail…" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
                </div>
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <button
                    type="submit"
                    className={`dash-submit ${isEmergency ? 'emergency-submit' : ''}`}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : isEmergency ? '🚨 Submit Emergency Complaint' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Ticket list with tabs */}
            <motion.div variants={itemVariants} className="card" style={{ marginTop: '1.5rem' }}>
              <div className="ticket-tabs">
                <button
                  className={`tab-btn ${activeTab === 'normal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('normal')}
                >
                  Complaints <span className="tab-count">{tickets.length}</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
                  onClick={() => setActiveTab('emergency')}
                >
                  🚨 Emergency <span className="tab-count emergency">{emergencyComplaints.length}</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'normal' && (
                  <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="filters" style={{ marginTop: '1rem' }}>
                      <label className="small">Show:</label>
                      <select value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <div className="ticket-list" style={{ marginTop: '0.75rem' }}>
                      <AnimatePresence>
                        {filteredTickets.length === 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="small">No complaints yet</motion.div>
                        )}
                        {filteredTickets.map(t => (
                          <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`ticket ${t._transient === 'new' ? 'new' : ''}`}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div className="title">{t.title} <span className="small">({t.category})</span></div>
                              <span className={`badge ${t.status.replace(/\s+/g, '-')}`}>{t.status}</span>
                            </div>
                            <div className="meta">{new Date(t.createdAt).toLocaleString()}</div>
                            <div className="desc">{t.description}</div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'emergency' && (
                  <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="ticket-list" style={{ marginTop: '1rem' }}>
                      <AnimatePresence>
                        {emergencyComplaints.length === 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="small">No emergency complaints submitted</motion.div>
                        )}
                        {emergencyComplaints.map(c => (
                          <motion.div
                            key={c.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`ticket emergency-ticket ${c._transient === 'new' ? 'new' : ''}`}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div className="title">
                                <span className="emergency-label">🚨 EMERGENCY</span> {c.title}
                                <span className="small"> ({c.category})</span>
                              </div>
                              <span className={`badge ${c.status.replace(/\s+/g, '-')}`}>{c.status}</span>
                            </div>
                            <div className="meta">{new Date(c.createdAt).toLocaleString()}</div>
                            <div className="desc">{c.description}</div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <aside>
            <motion.div variants={itemVariants} className="card">
              <h3>⚡ Quick Info</h3>
              <div className="small" style={{ lineHeight: 1.8 }}>
                <p>Submit normal complaints anytime with no limit.</p>
                <p style={{ marginTop: '0.5rem' }}>
                  🚨 <strong>Emergency complaints</strong> are limited to <strong>2 per 14 days</strong> and are escalated immediately to HR.
                </p>
              </div>
              <div className="emergency-quota-mini" style={{ marginTop: '1rem' }}>
                <div className="quota-label">Emergency quota</div>
                <div className="quota-bar">
                  <div className="quota-bar-fill" style={{ width: `${(emergencyStatus.remaining / emergencyStatus.limit) * 100}%` }} />
                </div>
                <div className="quota-text">
                  {emergencyStatus.remaining}/{emergencyStatus.limit} remaining
                  {emergencyStatus.resetAt && <span className="reset-timer-small"> · {formatResetTimer(emergencyStatus.resetAt)}</span>}
                </div>
              </div>
            </motion.div>
          </aside>
        </motion.div>
      </motion.main>
    </div>
  )
}

export default EmployeeDashboard
