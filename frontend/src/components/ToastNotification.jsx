import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ICON_MAP = {
  new_ticket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ticket_update: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>,
  emergency_update: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

const TYPE_COLORS = {
  new_ticket: '#6366f1',
  ticket_update: '#10b981',
  emergency_update: '#f43f5e',
}

export default function ToastNotification({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px',
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 100, damping: 16 }}
            style={{
              background: '#fff', borderRadius: '14px', padding: '1rem 1.1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${TYPE_COLORS[toast.type] || '#6366f1'}`,
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              cursor: 'pointer', position: 'relative',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '10px',
              background: `${TYPE_COLORS[toast.type] || '#6366f1'}15`,
              color: TYPE_COLORS[toast.type] || '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {ICON_MAP[toast.type] || ICON_MAP.new_ticket}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{toast.title}</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{toast.message}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); removeToast(toast.id) }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', padding: 0, lineHeight: 1 }}>
              ✕
            </button>
            {/* Auto-dismiss progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              onAnimationComplete={() => removeToast(toast.id)}
              style={{
                position: 'absolute', bottom: 0, left: 0, height: 3,
                background: TYPE_COLORS[toast.type] || '#6366f1',
                borderRadius: '0 0 0 14px', opacity: 0.4,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
