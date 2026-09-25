import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../components/PublicNav.jsx';
import FilterPills from '../components/FilterPills.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import api from '../api/axios';

export default function Landing() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPeople = async (search = '', cat = 'all') => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (cat && cat !== 'all') params.category = cat;
      const res = await api.get('/users', { params });
      setPeople(res.data.users);
    } catch {
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, []);

  // Live search-as-you-type, debounced slightly
  useEffect(() => {
    const t = setTimeout(() => loadPeople(query, category), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  return (
    <div>
      <PublicNav />

      <header className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="hero-eyebrow">No money changes hands</span>
            <h1>Pin what you know.<br />Find what you <em>want to learn</em>.</h1>
            <p className="lede">
              SkillSwap is a board where people trade lessons directly — you teach someone
              guitar, they teach you Spanish. Everyone leaves with something new.
            </p>

            <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Search a skill, e.g. photography"
                aria-label="Search a skill"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">Join the board</Link>
              <a href="#how" className="btn btn-outline">See how it works</a>
            </div>
            <p className="hero-note">Free to join. No card required.</p>
          </div>

          <div className="hero-board" aria-hidden="true">
            <span className="sticker sticker-gold sticker-1">✦ 100% free</span>
            <span className="sticker sticker-clay sticker-2">🤝 no fees ever</span>
            <span className="sticker sticker-cream sticker-3">★ 4.8 rated</span>
            <div className="pin-card rot-l card-a">
              <h3>Riya S.</h3>
              <div className="tags">
                <span className="tag tag-teach">teaches python</span>
                <span className="tag tag-learn">wants guitar</span>
              </div>
            </div>
            <div className="pin-card rot-r card-b">
              <h3>Arjun K.</h3>
              <div className="tags">
                <span className="tag tag-teach">teaches guitar</span>
                <span className="tag tag-learn">wants spanish</span>
              </div>
            </div>
            <div className="pin-card rot-s card-c">
              <h3>Meera T.</h3>
              <div className="tags">
                <span className="tag tag-teach">teaches spanish</span>
                <span className="tag tag-learn">wants python</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="people">
        <div className="container">
          <div className="section-head">
            <span className="hero-eyebrow">On the board right now</span>
            <h2>People ready to swap</h2>
          </div>

          <FilterPills active={category} onChange={setCategory} />

          {loading && <p style={{ textAlign: 'center', color: 'var(--forest-soft)' }}>Loading the board...</p>}
          {!loading && people.length === 0 && (
            <p className="no-results-msg">No one matches that search yet — try a different skill.</p>
          )}

          <div className="people-grid">
            {people.map((p, i) => (
              <div key={p.id} className={`pin-card person-card ${['rot-l', 'rot-r', 'rot-s'][i % 3]}`}>
                <StreakBadge count={p.swapsCompleted} corner />
                <div className="person-top">
                  <div className="avatar">{p.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="person-name">{p.name}</div>
                    <div className="person-rating">
                      {p.ratingCount > 0 ? `★ ${p.ratingAvg} · ${p.ratingCount} ratings` : 'New on the board'}
                    </div>
                  </div>
                </div>
                {p.teachSkills?.length > 0 && (
                  <div className="person-row"><span className="row-label">Teaches</span> {p.teachSkills.join(', ')}</div>
                )}
                {p.learnSkills?.length > 0 && (
                  <div className="person-row"><span className="row-label">Wants</span> {p.learnSkills.join(', ')}</div>
                )}
                <div className="tags">
                  {p.teachSkills?.slice(0, 2).map((s) => <span key={s} className="tag tag-teach">{s}</span>)}
                  {p.learnSkills?.slice(0, 1).map((s) => <span key={s} className="tag tag-learn">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt" id="how">
        <div className="container">
          <div className="section-head">
            <span className="hero-eyebrow">Three steps</span>
            <h2>How a swap happens</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-num">01</span>
              <h3>Pin your card</h3>
              <p>List the skills you can teach and the ones you're hoping to pick up.</p>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Get matched</h3>
              <p>We surface people whose skills complement yours — you teach them, they teach you.</p>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <h3>Swap and rate</h3>
              <p>Chat, schedule a time, meet up (in person or online), then rate each other afterward.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Got a skill worth sharing?</h2>
          <p>Someone on the board is waiting to learn exactly what you know.</p>
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
