import Navbar from '../components/Navbar'
import './Mission.css'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

const Mission = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 12 } }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header><Navbar /></header>
      <main className="mission-page">
        <motion.section 
          className="mission-hero"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Our Mission</h1>
          <p className="mission-lead">
            Empowering meaningful communication between employees and HR through technology and transparency.
          </p>
        </motion.section>
        
        <motion.section 
          className="mission-content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="mission-card">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Bridge the Gap
            </h2>
            <p>
              We believe every voice matters. Our platform creates a direct channel for 
              workplace conversations - from feedback and concerns to celebrations and ideas.
              By connecting employees directly with HR, we ensure no message gets lost.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mission-card">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Transparency and Trust
            </h2>
            <p>
              Building trust through clear processes. Employees can submit tickets, 
              track resolutions, and HR can respond quickly and consistently. Every action
              is logged, every resolution is tracked, creating accountability at every level.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mission-card">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              One Platform, All Needs
            </h2>
            <p>
              Events, ticketing, announcements, and dashboards - everything your team 
              needs to stay connected and productive in one place. No more switching between
              tools or losing information across systems.
            </p>
          </motion.div>
        </motion.section>

        <motion.div 
          className="mission-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="mission-stat">
            <div className="mission-stat-value">500+</div>
            <div className="mission-stat-label">Active Users</div>
          </div>
          <div className="mission-stat">
            <div className="mission-stat-value">10k+</div>
            <div className="mission-stat-label">Tickets Resolved</div>
          </div>
          <div className="mission-stat">
            <div className="mission-stat-value">98%</div>
            <div className="mission-stat-label">Satisfaction Rate</div>
          </div>
        </motion.div>
      </main>
      <footer><Footer /></footer>
    </div>
  )
}

export default Mission
