import { useTheme } from "../context/ThemeContext";
import "./Footer.css";

const Footer = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🏢 Employee Resources</span>
          <span className="footer-copy">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="footer-right">
          <button
            onClick={toggleTheme}
            className="footer-theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'} {isDark ? 'Light' : 'Dark'}
          </button>
          <div className="footer-accents">
            <span className="footer-dot footer-dot-yellow"></span>
            <span className="footer-dot footer-dot-blue"></span>
            <span className="footer-dot footer-dot-pink"></span>
            <span className="footer-dot footer-dot-mint"></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
