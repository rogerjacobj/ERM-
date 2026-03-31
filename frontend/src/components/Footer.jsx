import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>WorkHub</span>
          </div>
          <span className="footer-copy">&copy; {new Date().getFullYear()} WorkHub. All rights reserved.</span>
        </div>
        
        <div className="footer-right">
          <div className="footer-links">
            <Link to="/mission" className="footer-link">About</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
            <Link to="/events" className="footer-link">Events</Link>
          </div>
          
          <button
            onClick={toggleTheme}
            className="footer-theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
