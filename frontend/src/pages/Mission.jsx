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
    <div className="min-h-screen flex flex-col">
      <header><Navbar /></header>
      <main className="mission-page">
        <motion.section 
          className="mission-hero"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Our Mission</h1>
          <p className="mission-lead">
            Empowering meaningful communication between employees and HR
          </p>
        </motion.section>
        <motion.section 
          className="mission-content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="mission-card glass-panel">
            <h2>Bridge the gap</h2>
            <p>
              We believe every voice matters. Our platform creates a direct channel for 
              workplace conversations—from feedback and concerns to celebrations and ideas.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="mission-card glass-panel">
            <h2>Transparency & trust</h2>
            <p>
              Building trust through clear processes. Employees can submit tickets, 
              track resolutions, and HR can respond quickly and consistently.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="mission-card glass-panel">
            <h2>One platform, all needs</h2>
            <p>
              Events, ticketing, announcements, and dashboards—everything your team 
              needs to stay connected and productive in one place.
            </p>
          </motion.div>
        </motion.section>
      </main>
      <footer><Footer /></footer>
    </div>
  )
}

export default Mission
