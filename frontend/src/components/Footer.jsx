import { useState } from "react";
import arrow from "../assets/Footers/Arrow.png";
import moon from "../assets/Footers/moon.png";
import sun from "../assets/Footers/sun.png";
import { useTheme } from "../context/ThemeContext";
import "./Footer.css";

const Footer = () => {
  const [expanded, setExpanded] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <footer className="footer-container">
      <button
        onClick={() => setExpanded(!expanded)}
        className="footer-toggle"
        aria-expanded={expanded}
        aria-label="Toggle theme options"
      >
        <img src={arrow} alt="" className={`footer-arrow ${expanded ? 'open' : ''}`} />
      </button>

      <div className={`footer-palette ${expanded ? 'open' : ''}`}>
        <button
          onClick={toggleTheme}
          className="footer-theme-btn"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <img src={isDark ? sun : moon} alt="" className="footer-theme-icon" />
        </button>
      </div>

      <div className="footer-line" />
    </footer>
  );
};

export default Footer;
