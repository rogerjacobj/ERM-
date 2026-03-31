import React from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import "./dashboard.css"

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
        <motion.div 
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Dashboard</h1>
          {payload ? (
            <div className="dashboard-authenticated">
              <p className="dashboard-greeting">
                Signed in as <strong>{payload.email}</strong>
                <span className="dashboard-role">{payload.role}</span>
              </p>
              <Link 
                to={payload.role === 'hr' ? '/hr-dashboard' : '/employee-dashboard'} 
                className="dashboard-cta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
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
              <Link to="/login" className="dashboard-cta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                Sign in
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard
