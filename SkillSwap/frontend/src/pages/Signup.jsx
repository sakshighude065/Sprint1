import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';
import SkillTagInput from '../components/SkillTagInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '' });
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [isPinned, setIsPinned] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { needsOnboarding } = await register({ ...form, teachSkills, learnSkills, isPinned });
      if (needsOnboarding) {
        navigate(`/profile-edit?onboarding=1`);
      } else {
        navigate('/matches');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PublicNav />
      <main className="auth-wrap" style={{ minHeight: 'auto', paddingTop: 40, paddingBottom: 40 }}>
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="auth-head">
            <span className="logo"><span className="pin-dot"></span>SkillSwap</span>
            <h1>Pin your card</h1>
            <p>Tell the board what you can teach and what you're hoping to learn.</p>
          </div>

          {error && <div style={{ marginBottom: 16, fontSize: '0.85rem', color: '#a32d2d', background: '#fcebeb', padding: 10, borderRadius: 8 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input type="text" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="field">
              <label>Short bio <span style={{ fontWeight: 400, color: 'var(--forest-soft)' }}>(optional)</span></label>
              <textarea rows={2} placeholder="A line about yourself" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>

            <SkillTagInput
              label="Skills I can teach"
              hint="e.g. html, guitar, spanish"
              tags={teachSkills}
              onChange={setTeachSkills}
              tagClass="tag-teach"
            />
            <SkillTagInput
              label="Skills I want to learn"
              hint="e.g. css, cooking, chess"
              tags={learnSkills}
              onChange={setLearnSkills}
              tagClass="tag-learn"
            />

            <label className="pin-toggle">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              <span className="pin-toggle-box"><span className="pin-toggle-dot"></span></span>
              <span className="pin-toggle-text">
                <strong>Pin my card to the board</strong>
                <span>Show my profile publicly so others can find and match with me. You can unpin anytime from your profile.</span>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="auth-foot">Already have an account? <Link to="/login">Log in</Link></p>
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
