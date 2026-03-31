import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import MorphingText from '../components/MorphingText'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Home.css'

const Home = () => {
  const morphTexts = [
    "Communication",
    "Collaboration",
    "Management",
    "Efficiency",
    "Success"
  ]

  const blogPosts = [
    { id: 1, title: 'Welcome to Employee Resources', date: '2025-03-01', excerpt: 'Introducing our new platform for seamless HR and employee communication.' },
    { id: 2, title: 'Best Practices for Submitting Tickets', date: '2025-02-28', excerpt: 'Tips to get faster resolutions when you raise a concern.' },
    { id: 3, title: 'Upcoming Company Events', date: '2025-02-25', excerpt: 'Stay tuned for town halls, wellness workshops, and more.' },
  ]

  const features = [
    { icon: 'ticket', color: 'blue', title: 'Ticket Management', description: 'Submit and track support tickets with real-time status updates and notifications.' },
    { icon: 'calendar', color: 'green', title: 'Event Calendar', description: 'Stay updated with company events, meetings, and important deadlines.' },
    { icon: 'clock', color: 'orange', title: 'Time Tracking', description: 'Clock in/out seamlessly and view your attendance history anytime.' },
    { icon: 'chart', color: 'purple', title: 'Job Progress', description: 'Track project milestones and update progress in real-time.' },
    { icon: 'users', color: 'cyan', title: 'Team Directory', description: 'Find colleagues quickly with our comprehensive employee directory.' },
    { icon: 'bell', color: 'pink', title: 'Notifications', description: 'Never miss important updates with instant notifications.' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 12 } }
  }

  const FeatureIcon = ({ type }) => {
    const icons = {
      ticket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>,
      calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
      clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
      users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
    }
    return icons[type] || null
  }

  return (
    <div className="home-root">
      <header><Navbar /></header>
      
      {/* Hero Section */}
      <section id="home" className="home-hero">
        <motion.div
          className="home-hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={itemVariants} className="home-tagline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Enterprise Resource Management
          </motion.p>

          <motion.h1 variants={itemVariants} className="home-heading">
            Streamline Your Workplace
          </motion.h1>

          <motion.div variants={itemVariants} className="home-heading-accent">
            <MorphingText texts={morphTexts} className="text-left md:text-left flex justify-start items-center" />
          </motion.div>

          <motion.p variants={itemVariants} className="home-quote">
            Connect employees and HR through a unified platform. Submit tickets, track progress, manage attendance, and stay updated with company events.
          </motion.p>

          <motion.div variants={itemVariants} className="home-cta">
            <Link to="/events" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
              </svg>
              View Events
            </Link>
            <Link to="/login" className="btn-outline">
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="home-stats">
            <div className="home-stat">
              <div className="home-stat-value">500+</div>
              <div className="home-stat-label">Active Users</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-value">99.9%</div>
              <div className="home-stat-label">Uptime</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-value">24/7</div>
              <div className="home-stat-label">Support</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="home-hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div style={{ 
            width: '100%', 
            maxWidth: '500px', 
            aspectRatio: '1', 
            background: 'var(--color-bg-subtle)', 
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>WorkHub Dashboard</span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="home-features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="home-features-inner">
          <div className="home-features-header">
            <h2>Everything you need to manage your workforce</h2>
            <p>Powerful features designed to streamline HR operations and enhance employee experience</p>
          </div>
          
          <motion.div 
            className="home-features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                variants={itemVariants}
              >
                <div className={`feature-icon ${feature.color}`}>
                  <FeatureIcon type={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        id="mission"
        className="mission-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mission-section-inner">
          <div className="mission-section-header">
            <h2>Our Mission</h2>
            <p>Empowering meaningful communication between employees and HR</p>
          </div>
          
          <motion.div 
            className="mission-cards"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="mission-card">
              <h3>Bridge the Gap</h3>
              <p>We believe every voice matters. Our platform creates a direct channel for workplace conversations - from feedback and concerns to celebrations and ideas.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mission-card">
              <h3>Transparency and Trust</h3>
              <p>Building trust through clear processes. Employees can submit tickets, track resolutions, and HR can respond quickly and consistently.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mission-card">
              <h3>One Platform, All Needs</h3>
              <p>Events, ticketing, announcements, and dashboards - everything your team needs to stay connected and productive in one place.</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Blog Section */}
      <motion.section 
        id="blog"
        className="blog-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="blog-section-inner">
          <div className="blog-section-header">
            <h2>Latest Updates</h2>
            <Link to="/blog">View all posts</Link>
          </div>

          <motion.div 
            className="blog-cards"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {blogPosts.map((post) => (
              <motion.article 
                key={post.id} 
                className="blog-card"
                variants={itemVariants}
              >
                <div className="blog-card-date">
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="home-cta-section">
        <div className="home-cta-inner">
          <h2>Ready to get started?</h2>
          <p>Join thousands of employees who are already using WorkHub to streamline their workplace communication.</p>
          <Link to="/login" className="btn-primary">
            Sign in to your account
          </Link>
        </div>
      </section>

      <footer><Footer /></footer>
    </div>
  )
}

export default Home
