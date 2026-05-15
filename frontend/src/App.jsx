import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import React, { useState, useEffect, useCallback } from 'react'
import ToastNotification from './components/ToastNotification'
import { database, ref, onValue, off } from './config/firebase'

// Existing pages
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Mission from './pages/Mission'
import Blog from './pages/Blog'
import Events from './pages/Events'
import JobProgress from './pages/JobProgress'

// New enterprise pages
import HrDashboardNew from './pages/HrDashboardNew'
import EmployeeDashboardNew from './pages/EmployeeDashboardNew'
import AttendanceNew from './pages/AttendanceNew'
import EmployeeProfile from './pages/EmployeeProfile'
import Notifications from './pages/Notifications'
import HrReports from './pages/HrReports'

function decodeToken() {
  try { return JSON.parse(atob(localStorage.getItem('token'))) } catch { return null }
}

const App = () => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Global Firebase listener for real-time notifications
  useEffect(() => {
    if (!database) return
    const user = decodeToken()
    if (!user) return

    const email = user.email || ''
    const sanitized = email.replace(/[.#$[\]]/g, '_')
    const userRef = ref(database, `notifications/${sanitized}`)
    const hrRef = user.role === 'hr' ? ref(database, 'notifications/hr_channel') : null

    const handleSnapshot = (snapshot) => {
      const data = snapshot.val()
      if (!data) return
      const entries = Object.values(data)
      if (entries.length > 0) {
        const latest = entries[entries.length - 1]
        if (latest.timestamp && Date.now() - latest.timestamp < 10000) {
          setToasts(prev => [...prev, { ...latest, id: `toast-${Date.now()}-${Math.random()}` }])
        }
      }
    }

    onValue(userRef, handleSnapshot)
    if (hrRef) onValue(hrRef, handleSnapshot)

    return () => {
      off(userRef)
      if (hrRef) off(hrRef)
    }
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastNotification toasts={toasts} removeToast={removeToast} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* HR routes */}
          <Route path="/hr-dashboard" element={<HrDashboardNew />} />
          <Route path="/hr-reports" element={<HrReports />} />

          {/* Employee routes */}
          <Route path="/employee-dashboard" element={<EmployeeDashboardNew />} />
          <Route path="/employee-profile" element={<EmployeeProfile />} />

          {/* Shared routes */}
          <Route path="/attendance" element={<AttendanceNew />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/job-progress" element={<JobProgress />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App