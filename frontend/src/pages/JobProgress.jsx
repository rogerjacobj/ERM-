import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { API_BASE_URL } from '../config/api'
import { motion, AnimatePresence } from 'framer-motion'
import './JobProgress.css'

function decodeToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

const JobProgress = () => {
  const [jobs, setJobs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', assigneeEmail: '' })
  const [submitting, setSubmitting] = useState(false)
  const user = decodeToken()
  const isHr = user?.role === 'hr'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchJobs = async () => {
    const res = await fetch(`${API_BASE_URL}/api/jobs`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const json = await res.json()
    if (res.ok) setJobs(json.jobs || [])
    else {
      if (res.status === 401) window.location.href = '/login'
      setError(json.message || 'Failed to load jobs')
    }
  }

  const fetchEmployees = async () => {
    const res = await fetch(`${API_BASE_URL}/api/employees`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const json = await res.json()
    if (res.ok) setEmployees(json.employees || [])
    else {
      if (res.status === 401) window.location.href = '/login'
      setError(json.message || 'Failed to load employees')
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }
    Promise.all([fetchJobs(), isHr ? fetchEmployees() : Promise.resolve()]).finally(() => setLoading(false))
  }, [])

  const updateProgress = async (jobId, progress, status) => {
    setUpdating(jobId)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progress: Number(progress), status: status || undefined }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 401) window.location.href = '/login'
        throw new Error(json.message || 'Failed')
      }
      setJobs((prev) => prev.map((j) => (j.id === jobId ? json.job : j)))
    } catch (e) {
      setError(e.message)
    } finally {
      setUpdating(null)
    }
  }

  const createJob = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 401) window.location.href = '/login'
        throw new Error(json.message || 'Failed')
      }
      setJobs((prev) => [json.job, ...prev])
      setForm({ title: '', description: '', assigneeEmail: '' })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 60, damping: 15 } }
  }

  if (!token) return null
  if (!user) return null
  if (loading) {
    return (
      <div className="jobprogress-root">
        <Navbar />
        <main className="jobprogress-main"><p className="jobprogress-loading">Loading…</p></main>
      </div>
    )
  }

  return (
    <div className="jobprogress-root">
      <Navbar />
      <motion.main 
        className="jobprogress-main"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Job Progress Tracker</h1>

        {isHr && (
          <motion.section 
            className="jobprogress-create glass-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h2>Assign new job</h2>
            <form onSubmit={createJob} className="jobprogress-form">
              <div className="jobprogress-form-row">
                <input
                  placeholder="Job title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
                <select
                  value={form.assigneeEmail}
                  onChange={(e) => setForm((f) => ({ ...f, assigneeEmail: e.target.value }))}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.email}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
              </div>
              <div className="jobprogress-form-row">
                <textarea
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <button type="submit" className="jobprogress-submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create job'}
              </button>
            </form>
          </motion.section>
        )}

        {error && <div className="jobprogress-error">{error}</div>}

        <section className="jobprogress-list">
          <h2>{isHr ? 'All jobs' : 'Your jobs'}</h2>
          {jobs.length === 0 ? (
            <p className="jobprogress-empty">No jobs yet</p>
          ) : (
            <motion.div 
              className="jobprogress-cards"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div 
                    key={job.id} 
                    className="jobprogress-card glass-panel"
                    variants={itemVariants}
                    layout
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <div className="jobprogress-card-header">
                      <h3>{job.title}</h3>
                      {isHr && <span className="jobprogress-assignee">{job.assigneeEmail}</span>}
                    </div>
                    {job.description && <p className="jobprogress-desc">{job.description}</p>}
                    <div className="jobprogress-meta">
                      <span className={`jobprogress-badge ${job.status}`}>{job.status}</span>
                      <span className="jobprogress-date">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="jobprogress-progressbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={job.progress || 0}>
                      <motion.div 
                        className="jobprogress-progressbar-fill" 
                        initial={{ width: 0 }}
                        animate={{ width: `${job.progress || 0}%` }}
                        transition={{ duration: 0.6, type: "spring" }}
                      />
                    </div>

                    <div className="jobprogress-controls">
                      <label className="jobprogress-slider-wrap">
                        <span>Progress</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={job.progress || 0}
                          onMouseUp={(e) => {
                            const v = Number(e.target.value)
                            const status = v === 100 ? 'completed' : v > 0 ? 'in-progress' : 'pending'
                            updateProgress(job.id, v, status)
                          }}
                          onTouchEnd={(e) => {
                            const v = Number(e.target.currentTarget.value)
                            const status = v === 100 ? 'completed' : v > 0 ? 'in-progress' : 'pending'
                            updateProgress(job.id, v, status)
                          }}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, progress: v } : j)))
                          }}
                          disabled={updating === job.id}
                        />
                        <span>{job.progress || 0}%</span>
                      </label>
                      <div className="jobprogress-status-btns">
                        {['pending', 'in-progress', 'completed'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`jobprogress-status-btn ${job.status === s ? 'active' : ''}`}
                            onClick={() => updateProgress(job.id, job.progress, s)}
                            disabled={updating === job.id}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </motion.main>
      <Footer />
    </div>
  )
}

export default JobProgress
