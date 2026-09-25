import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function PublicNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => (pathname === path ? 'active' : '');

  return (
    <nav className={`site-nav ${open ? 'open' : ''}`}>
      <div className="container">
        <Logo />
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/about" className={isActive('/about')}>About us</Link>
          <Link to="/contact" className={isActive('/contact')}>Contact</Link>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn btn-outline">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Sign up</Link>
        </div>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
