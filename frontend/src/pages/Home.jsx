import Bros from '../assets/Hero/Handshake_Light.png'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import MorphingText from '../components/MorphingText'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Home.css'
import './Mission.css'
import './Blog.css'

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 12 } }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  }

  return (
    <div className="home-root">
      <header><Navbar /></header>
      
      {/* Hero Section */}
      <section id="home" className="home-hero min-h-screen flex items-center">
        <motion.div
          className="home-hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="home-tagline">
            <span className="animate-pulse">✦</span> Bridge the gap between employees and HR
          </motion.div>

          <motion.h1 variants={itemVariants} className="home-heading">
            Elevate Your <span className="title-gradient">Communication</span>
          </motion.h1>

          <motion.div variants={itemVariants} className="home-heading-accent min-h-[5rem] relative">
            <MorphingText texts={morphTexts} className="text-left md:text-left flex justify-start items-center" />
          </motion.div>

          <motion.p variants={itemVariants} className="home-quote">
            A small act of <span className="text-highlight">improvement</span> is a big{' '}
            <span className="text-highlight">difference</span> in someone's work life. Let's make it happen together.
          </motion.p>

          <motion.div variants={itemVariants} className="home-cta">
            <Link to="/events" className="btn-primary">🎉 View Events</Link>
            <Link to="/login" className="btn-outline">✦ Sign in</Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="home-hero-visual"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <img
            src={Bros}
            alt="Professional handshake"
            className="home-hero-img"
          />
        </motion.div>
      </section>

      {/* Mission Section */}
      <motion.section 
        id="mission"
        className="mission-page py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="mission-hero text-center mb-16">
          <h2 className="title-gradient">Our Mission</h2>
          <p className="mission-lead text-xl max-w-2xl mx-auto">
            Empowering meaningful communication between employees and HR through transparency and trust.
          </p>
        </div>
        
        <div className="mission-content">
          <motion.div 
            className="mission-card"
            whileHover={{ y: -10 }}
          >
            <div className="text-4xl mb-4">🤝</div>
            <h3>Bridge the gap</h3>
            <p>
              We believe every voice matters. Our platform creates a direct channel for 
              workplace conversations—from feedback and concerns to celebrations and ideas.
            </p>
          </motion.div>
          
          <motion.div 
            className="mission-card"
            whileHover={{ y: -10 }}
          >
            <div className="text-4xl mb-4">🔒</div>
            <h3>Transparency & trust</h3>
            <p>
              Building trust through clear processes. Employees can submit tickets, 
              track resolutions, and HR can respond quickly and consistently.
            </p>
          </motion.div>
          
          <motion.div 
            className="mission-card"
            whileHover={{ y: -10 }}
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3>One platform, all needs</h3>
            <p>
              Events, ticketing, announcements, and dashboards—everything your team 
              needs to stay connected and productive in one place.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Blog Section */}
      <motion.section 
        id="blog"
        className="blog-page py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="blog-hero text-center mb-16">
          <h2 className="title-gradient">Latest Updates</h2>
          <p className="blog-lead">News, tips, and insights from our team</p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <motion.article 
              key={post.id} 
              className="blog-card"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="blog-date">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <footer><Footer /></footer>
    </div>
  )
}

export default Home
