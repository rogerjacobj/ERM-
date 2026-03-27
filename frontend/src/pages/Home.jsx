import Bros from '../assets/Hero/Handshake_Light.png'
import TalkingImage from '../assets/Hero/Talking.png'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Home.css'

const Home = () => {
  const { isDark } = useTheme()

  return (
    <div className="home-root">
      <header><Navbar /></header>
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-tagline animate-fade-up">Bridge the gap between employees and HR</p>
          <h1 className="home-heading animate-fade-up delay-100">Making A Difference:</h1>
          <h2 className="home-heading-accent animate-fade-up delay-200">Communication Starts with You</h2>
          <p className="home-quote animate-fade-up delay-300">
            A small act of <span className="text-primary">communication</span> is a big{' '}
            <span className="text-primary">difference</span> in someone's work life.
          </p>
          <div className="home-cta animate-fade-up delay-400">
            <Link to="/events" className="btn-primary">View Events</Link>
            <Link to="/login" className="btn-outline">Sign in</Link>
          </div>
        </div>
        <div className="home-hero-visual animate-scale-in delay-300">
          <img
            key={isDark ? 'dark' : 'light'}
            src={isDark ? TalkingImage : Bros}
            alt={isDark ? 'People in conversation' : 'Professional handshake'}
            className={`home-hero-img ${isDark ? 'dark' : ''}`}
          />
        </div>
      </section>
      <footer><Footer /></footer>
    </div>
  )
}

export default Home
