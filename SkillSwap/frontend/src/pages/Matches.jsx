import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNav from '../components/AppNav.jsx';
import FilterPills from '../components/FilterPills.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [everyone, setEveryone] = useState([]);
  const [everyoneLoaded, setEveryoneLoaded] = useState(false);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/matches');
      setMatches(res.data.matches);
      // No calculated matches yet — fall back to showing everyone on the
      // public board so new users aren't stuck at a dead end.
      if (res.data.matches.length === 0) {
        const everyoneRes = await api.get('/users');
        setEveryone(everyoneRes.data.users.filter((u) => u.id !== user.id));
        setEveryoneLoaded(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const filtered = matches.filter(
    (m) => category === 'all' || m.user.categories?.includes(category)
  );

  return (
    <div>
      <AppNav />
      <header className="matches-hero">
        <div className="container">
          <span className="hero-eyebrow">Fresh off the board</span>
          <h1>Your matches</h1>
          <p className="lede">People whose skills complement yours. View a profile to send a swap request, or jump straight into chat.</p>
        </div>
      </header>

      <section style={{ paddingTop: 8 }}>
        <div className="container">
          {loading && <p style={{ textAlign: 'center', color: 'var(--forest-soft)' }}>Finding matches...</p>}
          {error && <p style={{ textAlign: 'center', color: '#a32d2d' }}>{error}</p>}

          {!loading && !error && matches.length === 0 && (
            <>
              <EmptyState
                icon="📌"
                title="No matches yet"
                message="Pin a few more skills to your card and check back — the board updates as new people join."
                ctaLabel="Edit my skills"
                ctaTo="/profile-edit"
              />

              {everyoneLoaded && everyone.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <p style={{ textAlign: 'center', color: 'var(--forest-soft)', fontSize: '0.9rem', marginBottom: 20 }}>
                    No calculated matches yet, but here's everyone else on the board:
                  </p>
                  <div className="people-grid">
                    {everyone.map((u, i) => (
                      <div key={u.id} className={`pin-card person-card ${['rot-l', 'rot-r', 'rot-s'][i % 3]}`}>
                        <StreakBadge count={u.swapsCompleted} corner />
                        <div className="person-top">
                          <div className="avatar">{u.name?.[0]?.toUpperCase()}</div>
                          <div>
                            <div className="person-name">{u.name}</div>
                            <div className="person-rating">
                              {u.ratingCount > 0 ? `★ ${u.ratingAvg} · ${u.swapsCompleted} swaps` : 'New on the board'}
                            </div>
                          </div>
                        </div>
                        {u.teachSkills?.length > 0 && (
                          <div className="person-row"><span className="row-label">Teaches</span> {u.teachSkills.join(', ')}</div>
                        )}
                        {u.learnSkills?.length > 0 && (
                          <div className="person-row"><span className="row-label">Wants</span> {u.learnSkills.join(', ')}</div>
                        )}
                        <div className="tags">
                          {u.teachSkills?.map((s) => <span key={s} className="tag tag-teach">{s}</span>)}
                          {u.learnSkills?.map((s) => <span key={s} className="tag tag-learn">{s}</span>)}
                        </div>
                        <div className="card-actions">
                          <Link to={`/profile/${u.id}`} className="btn btn-outline">View profile</Link>
                          <Link to={`/profile/${u.id}?swap=1`} className="btn btn-primary">💬 Chat</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && matches.length > 0 && (
            <>
              <FilterPills active={category} onChange={setCategory} />
              {filtered.length === 0 && (
                <p className="no-results-msg">No one in this category yet — try "All" or check back soon.</p>
              )}
              <div className="people-grid">
                {filtered.map((m, i) => (
                  <div key={m.user.id} className={`pin-card person-card ${['rot-l', 'rot-r', 'rot-s'][i % 3]}`}>
                    {m.matchType === 'mutual' && <span className="match-badge">✦ Mutual match</span>}
                    <StreakBadge count={m.user.swapsCompleted} corner={m.matchType !== 'mutual'} />
                    <div className="person-top">
                      <div className="avatar">{m.user.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="person-name">{m.user.name}</div>
                        <div className="person-rating">
                          {m.user.ratingCount > 0 ? `★ ${m.user.ratingAvg} · ${m.user.swapsCompleted} swaps` : 'New on the board'}
                        </div>
                      </div>
                    </div>
                    {m.theyCanTeachYou.length > 0 && (
                      <div className="person-row"><span className="row-label">Can teach you</span> {m.theyCanTeachYou.join(', ')}</div>
                    )}
                    {m.theyWantToLearnFromYou.length > 0 && (
                      <div className="person-row"><span className="row-label">Wants to learn</span> {m.theyWantToLearnFromYou.join(', ')}</div>
                    )}
                    <div className="tags">
                      {m.theyCanTeachYou.map((s) => <span key={s} className="tag tag-teach">{s}</span>)}
                      {m.theyWantToLearnFromYou.map((s) => <span key={s} className="tag tag-learn">{s}</span>)}
                    </div>
                    <div className="card-actions">
                      <Link to={`/profile/${m.user.id}`} className="btn btn-outline">View profile</Link>
                      <Link to={`/profile/${m.user.id}?swap=1`} className="btn btn-primary">💬 Chat</Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
