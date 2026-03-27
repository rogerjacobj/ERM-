import React from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function decodeToken(token) {
  try {
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

const Dashboard = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const payload = token ? decodeToken(token) : null

  return (
    <div className="dashboard-root">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-card">
          <h1>Main Dashboard</h1>
          {payload ? (
            <div className="dashboard-authenticated">
              <p className="dashboard-greeting">
                Signed in as <strong>{payload.email}</strong> <span className="dashboard-role">({payload.role})</span>
              </p>
              <Link to={payload.role === 'hr' ? '/hr-dashboard' : '/employee-dashboard'} className="dashboard-cta">
                Go to your dashboard
              </Link>
              <details className="dashboard-details">
                <summary>Session details</summary>
                <pre>{JSON.stringify(payload, null, 2)}</pre>
              </details>
            </div>
          ) : (
            <div className="dashboard-guest">
              <p>You are not signed in.</p>
              <Link to="/login" className="dashboard-cta">Sign in</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
