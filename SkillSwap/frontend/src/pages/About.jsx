import React from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';

export default function About() {
  return (
    <div>
      <PublicNav />
      <header className="about-hero">
        <div className="container">
          <span className="hero-eyebrow">Why we built this</span>
          <h1>Everyone knows something worth teaching.</h1>
          <p>SkillSwap started as a corkboard outside a co-working space — handwritten cards offering guitar lessons in exchange for help with Spanish. We just moved the board online.</p>
        </div>
      </header>

      <section>
        <div className="container">
          <div className="value-grid">
            <div className="pin-card rot-l value-card">
              <div className="value-icon">🤝</div>
              <h3>Trade, not transact</h3>
              <p>No money changes hands. You teach, someone else teaches you back — value flows in both directions.</p>
            </div>
            <div className="pin-card rot-r value-card">
              <div className="value-icon">🎯</div>
              <h3>Matched on purpose</h3>
              <p>We look for people whose "teach" list lines up with your "learn" list, and vice versa — real mutual swaps, not one-sided asks.</p>
            </div>
            <div className="pin-card rot-s value-card">
              <div className="value-icon">💬</div>
              <h3>Talk it through first</h3>
              <p>Chat and agree on a time before you commit. Every swap is scheduled, never a surprise.</p>
            </div>
            <div className="pin-card rot-l value-card">
              <div className="value-icon">⭐</div>
              <h3>Ratings keep it honest</h3>
              <p>After a swap, both sides rate each other — so good teachers and good learners rise to the top of the board.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="stats-strip">
            <div><div className="stat-num">3,400+</div><div className="stat-label">skills pinned</div></div>
            <div><div className="stat-num">1,120</div><div className="stat-label">swaps completed</div></div>
            <div><div className="stat-num">4.8★</div><div className="stat-label">average rating</div></div>
            <div><div className="stat-num">0</div><div className="stat-label">dollars exchanged</div></div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Come see the board</h2>
          <p>Whatever you know, someone here wants to learn it.</p>
          <Link to="/signup" className="btn btn-primary" style={{ marginTop: 20 }}>Join the board</Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <Link to="/" className="logo"><span className="pin-dot"></span>SkillSwap</Link>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Log in</Link>
          </div>
          <span className="footer-note">© 2026 SkillSwap. A trade, not a transaction.</span>
        </div>
      </footer>
    </div>
  );
}
