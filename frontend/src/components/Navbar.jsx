import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';
import bell from '../assets/Navbar/Bell_pin_fill.png';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
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

  const isHomePage = location.pathname === '/';

  const navItems = [
    { to: isHomePage ? '#home' : '/', label: 'Home', isAnchor: isHomePage },
    { to: '/events', label: 'Events' },
    ...(token ? [{ to: '/attendance', label: 'Attendance' }, { to: '/job-progress', label: 'Job Progress' }] : []),
    { to: isHomePage ? '#mission' : '/mission', label: 'Our Mission', isAnchor: isHomePage },
    { to: dashboardTo, label: 'Dashboard' },
    { to: isHomePage ? '#blog' : '/blog', label: 'Blog', isAnchor: isHomePage },
  ];

  const handleNavClick = (e, item) => {
    setOpen(false);
    if (item.isAnchor) {
      e.preventDefault();
      const element = document.querySelector(item.to);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={(e) => {
          if (isHomePage) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}>
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
                {item.isAnchor ? (
                  <a
                    href={item.to}
                    className="nav-link"
                    onClick={(e) => handleNavClick(e, item)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="nav-link"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
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
