import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { API_BASE_URL } from '../config/api'
import './Attendance.css'

function decodeToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function formatDuration(startIso, endIso) {
  if (!startIso || !endIso) return '—'
  const ms = new Date(endIso) - new Date(startIso)
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const Attendance = () => {
  const [today, setToday] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [clockOutNotes, setClockOutNotes] = useState('')
  const user = decodeToken()
  const isHr = user?.role === 'hr'
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchToday = async () => {
    const res = await fetch(`${API_BASE_URL}/api/attendance/today`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
    const json = await res.json()
    if (res.ok) setToday(json.attendance)
    else {
      if (res.status === 401) window.location.href = '/login'
      setError(json.message || 'Failed to load')
    }
  }

  const fetchRecords = async () => {
    const url = isHr ? `${API_BASE_URL}/api/attendance/all${employeeFilter ? `?employeeEmail=${encodeURIComponent(employeeFilter)}` : ''}` : `${API_BASE_URL}/api/attendance`
    const res = await fetch(url, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
    const json = await res.json()
    if (res.ok) setRecords(json.attendance || [])
    else {
      if (res.status === 401) window.location.href = '/login'
      setError(json.message || 'Failed to load')
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }
    Promise.all([fetchToday(), fetchRecords()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isHr || !user) return
    fetchRecords()
  }, [employeeFilter])

  const clockIn = async () => {
    setActionLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clock-in`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed')
      setToday(json.attendance)
      setRecords((r) => [json.attendance, ...r])
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const clockOut = async () => {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clock-out`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: clockOutNotes }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed')
      setToday(json.attendance)
      setRecords((r) => r.map((x) => (x.id === today?.id ? json.attendance : x)))
      setClockOutNotes('')
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (!token) return null
  if (!user) return null
  if (loading) {
    return (
      <div className="attendance-root">
        <Navbar />
        <main className="attendance-main"><p className="attendance-loading">Loading…</p></main>
      </div>
    )
  }

  return (
    <div className="attendance-root">
      <Navbar />
      <main className="attendance-main">
        <h1>Attendance</h1>

        {!isHr && (
          <section className="attendance-today">
            <h2>Today</h2>
            <div className="attendance-actions">
              {!today?.checkIn ? (
                <button className="att-btn att-btn-in" onClick={clockIn} disabled={actionLoading}>
                  {actionLoading ? 'Clock in…' : 'Clock In'}
                </button>
              ) : !today?.checkOut ? (
                <div className="att-clockout">
                  <label className="att-notes-label">
                    Notes (optional)
                    <textarea
                      className="att-notes-input"
                      value={clockOutNotes}
                      onChange={(e) => setClockOutNotes(e.target.value)}
                      rows={3}
                      placeholder="Any work notes for today..."
                      disabled={actionLoading}
                    />
                  </label>
                  <button className="att-btn att-btn-out" onClick={clockOut} disabled={actionLoading}>
                    {actionLoading ? 'Clock out…' : 'Clock Out'}
                  </button>
                </div>
              ) : (
                <div className="att-done">Clocked out for today</div>
              )}
            </div>
            {today && (
              <div className="att-today-details">
                <span>In: {formatTime(today.checkIn)}</span>
                <span>Out: {formatTime(today.checkOut)}</span>
                <span>Worked: {formatDuration(today.checkIn, today.checkOut)}</span>
              </div>
            )}
          </section>
        )}

        {isHr && (
          <div className="attendance-filter">
            <input
              type="text"
              placeholder="Filter by employee email"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            />
          </div>
        )}

        {error && <div className="attendance-error">{error}</div>}

        <section className="attendance-history">
          <h2>{isHr ? 'All attendance' : 'History'}</h2>
          {records.length === 0 ? (
            <p className="attendance-empty">No records yet</p>
          ) : (
            <div className="attendance-table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    {isHr && <th>Employee</th>}
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      {isHr && <td>{r.employeeEmail}</td>}
                      <td>{r.date}</td>
                      <td>{formatTime(r.checkIn)}</td>
                      <td>{formatTime(r.checkOut)}</td>
                      <td>{formatDuration(r.checkIn, r.checkOut)}</td>
                      <td>
                        <span className={`att-badge ${r.checkOut ? 'complete' : 'active'}`}>
                          {r.checkOut ? 'Complete' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Attendance
