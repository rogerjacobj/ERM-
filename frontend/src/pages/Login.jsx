import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config/api'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('employee')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!email) return 'Email is required.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Enter a valid email.'
    if (!password) return 'Password is required.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Login failed: ${res.status}`)
      }

      const data = await res.json()
      if (data.token) localStorage.setItem('token', data.token)

      if (role === 'hr') navigate('/hr-dashboard')
      else navigate('/employee-dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <Navbar />
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">Access for employees and HR</p>
          <p className="login-hint">
            Test: password <strong>password123</strong>. Use any email. Toggle role to test HR vs Employee.
          </p>

          <div className="role-toggle" role="tablist" aria-label="Select role">
            <button
              type="button"
              aria-pressed={role === 'employee'}
              className={`role-btn ${role === 'employee' ? 'active' : ''}`}
              onClick={() => setRole('employee')}
            >
              Employee
            </button>
            <button
              type="button"
              aria-pressed={role === 'hr'}
              className={`role-btn ${role === 'hr' ? 'active' : ''}`}
              onClick={() => setRole('hr')}
            >
              HR
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span className="login-label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'hr' ? 'hr@company.com' : 'you@company.com'}
                aria-label="Email"
                required
                className="login-input"
              />
            </label>

            <label className="login-field">
              <span className="login-label">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                aria-label="Password"
                required
                className="login-input"
              />
            </label>

            {error && (
              <div className="login-error" role="alert">{error}</div>
            )}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : `Sign in as ${role === 'hr' ? 'HR' : 'Employee'}`}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? Contact HR to create one.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login
