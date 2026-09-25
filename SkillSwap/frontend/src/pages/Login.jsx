import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicNav />
      <main className="auth-wrap">
        <div className="auth-card">
          <div className="auth-head">
            <span className="logo"><span className="pin-dot"></span>SkillSwap</span>
            <h1>Welcome back</h1>
            <p>Log in to see your matches and swap requests.</p>
          </div>

          {error && <div style={{ marginBottom: 16, fontSize: '0.85rem', color: '#a32d2d', background: '#fcebeb', padding: 10, borderRadius: 8 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <p className="auth-foot">New to SkillSwap? <Link to="/signup">Create an account</Link></p>
        </div>
      </main>
      <footer className="site-footer">
        <div className="container">
          <Link to="/" className="logo"><span className="pin-dot"></span>SkillSwap</Link>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
