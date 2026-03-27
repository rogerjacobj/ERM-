import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';
import bell from '../assets/Navbar/Bell_pin_fill.png';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let dashboardTo = '/dashboard';
  if (token) {
    try {
      const payload = JSON.parse(atob(token));
      dashboardTo = payload && payload.role === 'hr' ? '/hr-dashboard' : '/employee-dashboard';
    } catch {
      dashboardTo = '/dashboard';
    }
  }

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    ...(token ? [{ to: '/attendance', label: 'Attendance' }, { to: '/job-progress', label: 'Job Progress' }] : []),
    { to: '/mission', label: 'Our Mission' },
    { to: dashboardTo, label: 'Dashboard' },
    { to: '/blog', label: 'Blog' },
  ];

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Employee Resources
        </Link>

        {!token && (
          <div className="navbar-login-desktop">
            <Link to="/login" className="login-pill">Sign in</Link>
          </div>
        )}

        <button
          className="navbar-hamburger"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className={`hamburger-line ${open ? 'open' : ''}`} />
          <span className={`hamburger-line ${open ? 'open' : ''}`} />
          <span className={`hamburger-line ${open ? 'open' : ''}`} />
        </button>

        <nav className={`navbar-nav ${open ? 'open' : ''}`}>
          {!token && (
            <Link to="/login" className="login-pill-mobile" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          )}
          <ul className="navbar-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="nav-link"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar-actions">
          <img src={bell} alt="Notifications" className="navbar-bell" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
