import React, { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './events.css'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

const Events = () => {
  const [events] = useState([
    { id: 'ev-1', title: 'Town Hall Meeting', date: '2025-11-10T10:00:00', location: 'Main Auditorium', description: 'Quarterly company-wide town hall to share updates and Q&A with leadership.' },
    { id: 'ev-2', title: 'Wellness Workshop', date: '2025-11-18T14:00:00', location: 'Room 204', description: 'A session on stress management, breathing exercises and ergonomics.' },
    { id: 'ev-3', title: 'Holiday Party', date: '2025-12-20T18:30:00', location: 'Cafeteria', description: 'End of year celebration with food, music and awards.' },
  ])

  const [query, setQuery] = useState('')
  const [rsvps, setRsvps] = useState({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return events
    return events.filter(e => `${e.title} ${e.location} ${e.description}`.toLowerCase().includes(q))
  }, [events, query])

  const toggleRsvp = (id) => {
    setRsvps(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="events-root">
      <header><Navbar /></header>
      <main className="events-main">
        <section className="events-hero">
          <div>
            <h1>Company Events</h1>
            <p className="events-lead">Stay connected — join company activities, learning sessions, and social gatherings.</p>
          </div>
          <div className="events-search-wrap">
            <input
              type="search"
              className="events-search"
              placeholder="Search events, locations, or topics"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </section>

        <section className="events-grid">
          {filtered.length === 0 && (
            <div className="events-empty">No events found.</div>
          )}

          {filtered.map(ev => (
            <article key={ev.id} className="event-card">
              <div className="event-date-block">
                <strong>{new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>
                <span className="event-time">{new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="event-body">
                <h3 className="event-title">{ev.title}</h3>
                <div className="event-meta">{ev.location} • {formatDate(ev.date)}</div>
                <p className="event-desc">{ev.description}</p>
                <div className="event-actions">
                  <button
                    className={`event-btn ${rsvps[ev.id] ? 'event-btn-ghost' : 'event-btn-primary'}`}
                    onClick={() => toggleRsvp(ev.id)}
                  >
                    {rsvps[ev.id] ? 'Cancel RSVP' : 'RSVP'}
                  </button>
                  <button className="event-btn event-btn-outline" onClick={(e) => e.preventDefault()}>
                    Add to calendar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <footer><Footer /></footer>
    </div>
  )
}

export default Events
