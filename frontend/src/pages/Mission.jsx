import Navbar from '../components/Navbar'
import './Mission.css'
import Footer from '../components/Footer'

const Mission = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header><Navbar /></header>
      <main className="mission-page">
        <section className="mission-hero">
          <h1>Our Mission</h1>
          <p className="mission-lead">
            Empowering meaningful communication between employees and HR
          </p>
        </section>
        <section className="mission-content">
          <div className="mission-card">
            <h2>Bridge the gap</h2>
            <p>
              We believe every voice matters. Our platform creates a direct channel for 
              workplace conversations—from feedback and concerns to celebrations and ideas.
            </p>
          </div>
          <div className="mission-card">
            <h2>Transparency & trust</h2>
            <p>
              Building trust through clear processes. Employees can submit tickets, 
              track resolutions, and HR can respond quickly and consistently.
            </p>
          </div>
          <div className="mission-card">
            <h2>One platform, all needs</h2>
            <p>
              Events, ticketing, announcements, and dashboards—everything your team 
              needs to stay connected and productive in one place.
            </p>
          </div>
        </section>
      </main>
      <footer><Footer /></footer>
    </div>
  )
}

export default Mission
