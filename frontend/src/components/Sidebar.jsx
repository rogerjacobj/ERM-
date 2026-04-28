import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Sidebar.css'

function decodeToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token))
  } catch { return null }
}

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation()
  const user = decodeToken()
  const isHr = user?.role === 'hr'

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const hrNav = [
    { to: '/hr-dashboard',  icon: '🏠', label: 'Dashboard' },
    { to: '/attendance',    icon: '📅', label: 'Attendance' },
    { to: '/job-progress',  icon: '📊', label: 'Job Progress' },
    { to: '/hr-reports',    icon: '📈', label: 'Reports' },
    { to: '/notifications', icon: '🔔', label: 'Notifications' },
  ]

  const empNav = [
    { to: '/employee-dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/attendance',         icon: '📅', label: 'Attendance' },
    { to: '/job-progress',       icon: '📊', label: 'Job Progress' },
    { to: '/employee-profile',   icon: '👤', label: 'My Profile' },
    { to: '/notifications',      icon: '🔔', label: 'Notifications' },
  ]

  const navItems = isHr ? hrNav : empNav

  return (
    <motion.aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <span>ERM</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="sidebar-logo-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="logo-title">WorkNexus</span>
              <span className="logo-sub">HR Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)}>
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          ◀
        </motion.span>
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">MENU</div>}
        {navItems.map(item => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="sidebar-link-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && <motion.div className="sidebar-active-pill" layoutId="activePill" />}
            </Link>
          )
        })}
      </nav>

      {/* User card at bottom */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name || 'User'}</div>
              <div className="sidebar-user-role">{user.role?.toUpperCase()}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={logout} title="Logout">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
