import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (path) => (pathname === path ? 'active' : '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`site-nav ${open ? 'open' : ''}`}>
      <div className="container">
        <Logo to="/matches" />
        <div className="nav-links">
          <Link to="/matches" className={isActive('/matches')}>Matches</Link>
          <Link to="/swap-requests" className={isActive('/swap-requests')}>Swap requests</Link>
          <Link to="/profile-edit" className={isActive('/profile-edit')}>Profile</Link>
        </div>
        <div className="nav-cta">
          <span className="hi-user">Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} className="btn btn-outline">Log out</button>
        </div>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
