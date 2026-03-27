import Navbar from '../components/Navbar'
import './Blog.css'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

const Blog = () => {
  const posts = [
    { id: 1, title: 'Welcome to Employee Resources', date: '2025-03-01', excerpt: 'Introducing our new platform for seamless HR and employee communication.' },
    { id: 2, title: 'Best Practices for Submitting Tickets', date: '2025-02-28', excerpt: 'Tips to get faster resolutions when you raise a concern.' },
    { id: 3, title: 'Upcoming Company Events', date: '2025-02-25', excerpt: 'Stay tuned for town halls, wellness workshops, and more.' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header><Navbar /></header>
      <main className="blog-page">
        <motion.section 
          className="blog-hero"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Blog</h1>
          <p className="blog-lead">Updates, tips, and company news</p>
        </motion.section>
        <motion.section 
          className="blog-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {posts.map((post) => (
            <motion.article 
              key={post.id} 
              className="blog-card glass-panel"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <time className="blog-date">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              <h2 className="blog-title">{post.title}</h2>
              <p className="blog-excerpt">{post.excerpt}</p>
            </motion.article>
          ))}
        </motion.section>
      </main>
      <footer><Footer /></footer>
    </div>
  )
}

export default Blog
