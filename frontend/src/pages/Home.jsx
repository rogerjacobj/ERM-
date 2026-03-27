import Bros from '../assets/Hero/Handshake_Light.png'
import TalkingImage from '../assets/Hero/Talking.png'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import MorphingText from '../components/MorphingText'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import './Home.css'
import './Mission.css'
import './Blog.css'

const Home = () => {
  const { isDark } = useTheme()

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
          <motion.p variants={itemVariants} className="home-tagline">
            Bridge the gap between employees and HR
          </motion.p>

          <motion.h1 variants={itemVariants} className="home-heading">
            Elevate Your Communication Through our web
          </motion.h1>

          <motion.div variants={itemVariants} className="home-heading-accent min-h-[5rem] relative">
            <MorphingText texts={morphTexts} className="text-left md:text-left flex justify-start items-center" />
          </motion.div>

          <motion.p variants={itemVariants} className="home-quote">
            A small act of <span className="text-primary">improvement</span> is a big{' '}
            <span className="text-primary">difference</span> in someone's work life. Let's make it happen.
          </motion.p>

          <motion.div variants={itemVariants} className="home-cta">
            <Link to="/events" className="btn-primary">View Events</Link>
            <Link to="/login" className="btn-outline">Sign in</Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="home-hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <img
            key={isDark ? 'dark' : 'light'}
            src={isDark ? TalkingImage : Bros}
            alt={isDark ? 'People in conversation' : 'Professional handshake'}
            className={`home-hero-img ${isDark ? 'dark' : ''}`}
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
          <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
          <p className="mission-lead text-xl opacity-80 max-w-2xl mx-auto">
            Empowering meaningful communication between employees and HR
          </p>
        </div>
        
        <div className="mission-content grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
          <motion.div 
            className="mission-card glass-panel p-8"
            whileHover={{ y: -10 }}
          >
            <h3 className="text-2xl font-bold mb-4">Bridge the gap</h3>
            <p className="opacity-80">
              We believe every voice matters. Our platform creates a direct channel for 
              workplace conversations—from feedback and concerns to celebrations and ideas.
            </p>
          </motion.div>
          
          <motion.div 
            className="mission-card glass-panel p-8"
            whileHover={{ y: -10 }}
          >
            <h3 className="text-2xl font-bold mb-4">Transparency & trust</h3>
            <p className="opacity-80">
              Building trust through clear processes. Employees can submit tickets, 
              track resolutions, and HR can respond quickly and consistently.
            </p>
          </motion.div>
          
          <motion.div 
            className="mission-card glass-panel p-8"
            whileHover={{ y: -10 }}
          >
            <h3 className="text-2xl font-bold mb-4">One platform, all needs</h3>
            <p className="opacity-80">
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
          <h2 className="text-4xl font-bold mb-4">Latest Updates</h2>
          <p className="blog-lead text-xl opacity-80">News, tips, and insights from our team</p>
        </div>

        <div className="blog-grid grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
          {blogPosts.map((post) => (
            <motion.article 
              key={post.id} 
              className="blog-card glass-panel p-6"
              whileHover={{ scale: 1.02 }}
            >
              <time className="blog-date text-sm opacity-60 mb-2 block">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              <h3 className="blog-title text-xl font-bold mb-3">{post.title}</h3>
              <p className="blog-excerpt opacity-80 text-sm line-clamp-3">{post.excerpt}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <footer><Footer /></footer>
    </div>
  )
}

export default Home
