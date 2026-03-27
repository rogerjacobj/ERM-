import Navbar from '../components/Navbar'
import './Blog.css'
import Footer from '../components/Footer'

const Blog = () => {
  const posts = [
    { id: 1, title: 'Welcome to Employee Resources', date: '2025-03-01', excerpt: 'Introducing our new platform for seamless HR and employee communication.' },
    { id: 2, title: 'Best Practices for Submitting Tickets', date: '2025-02-28', excerpt: 'Tips to get faster resolutions when you raise a concern.' },
    { id: 3, title: 'Upcoming Company Events', date: '2025-02-25', excerpt: 'Stay tuned for town halls, wellness workshops, and more.' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header><Navbar /></header>
      <main className="blog-page">
        <section className="blog-hero">
          <h1>Blog</h1>
          <p className="blog-lead">Updates, tips, and company news</p>
        </section>
        <section className="blog-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-card">
              <time className="blog-date">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              <h2 className="blog-title">{post.title}</h2>
              <p className="blog-excerpt">{post.excerpt}</p>
            </article>
          ))}
        </section>
      </main>
      <footer><Footer /></footer>
    </div>
  )
}

export default Blog
