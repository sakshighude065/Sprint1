import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <PublicNav />
      <header className="about-hero">
        <div className="container">
          <span className="hero-eyebrow">Get in touch</span>
          <h1>Questions, feedback, or a skill you want on the board?</h1>
          <p>Send us a note — we read every message.</p>
        </div>
      </header>

      <section style={{ paddingTop: 16 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Reach us directly</h2>
              <div className="contact-method">
                <div className="contact-icon">✉️</div>
                <div><h3>Email</h3><p>hello@skillswap.example</p></div>
              </div>
              <div className="contact-method">
                <div className="contact-icon">💬</div>
                <div><h3>Community chat</h3><p>Join swappers trading tips in our community server.</p></div>
              </div>
              <div className="contact-method">
                <div className="contact-icon">📍</div>
                <div><h3>Based in</h3><p>Mumbai, India — swapping worldwide.</p></div>
              </div>
            </div>

            <div className="pin-card rot-s contact-form-card">
              {sent && <div className="form-success show">Thanks — your message has been pinned to our inbox. We'll reply soon.</div>}
              <form onSubmit={handleSubmit}>
                <div className="field-row">
                  <div className="field"><label>Name</label><input type="text" placeholder="Your name" required /></div>
                  <div className="field"><label>Email</label><input type="email" placeholder="you@example.com" required /></div>
                </div>
                <div className="field"><label>Subject</label><input type="text" placeholder="What's this about?" required /></div>
                <div className="field"><label>Message</label><textarea rows={5} placeholder="Tell us what's on your mind" required /></div>
                <button type="submit" className="btn btn-primary btn-block">Send message</button>
              </form>
            </div>
          </div>
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
