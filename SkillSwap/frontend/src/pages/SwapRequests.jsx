import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNav from '../components/AppNav.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const statusMeta = {
  pending: { label: 'Pending', icon: '↻', className: 'status-pending' },
  accepted: { label: 'Accepted', icon: '✓', className: 'status-accepted' },
  rejected: { label: 'Rejected', icon: '✕', className: 'status-completed' },
  cancelled: { label: 'Cancelled', icon: '✕', className: 'status-completed' },
  completed: { label: 'Completed', icon: '✓', className: 'status-completed' },
};

export default function SwapRequests() {
  const { user } = useAuth();
  const showToast = useToast();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFor, setRatingFor] = useState(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  const loadSwaps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/swaps');
      setSwaps(res.data.swaps);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load swap requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/swaps/${id}`, { status });
      if (status === 'accepted') showToast('✓ Swap accepted!');
      if (status === 'completed') showToast('✓ Marked as completed');
      loadSwaps();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update request');
    }
  };

  const scheduleSwap = async (id) => {
    const when = prompt('Enter a date & time (e.g. 2026-09-20 15:00)');
    if (!when) return;
    const date = new Date(when);
    if (isNaN(date.getTime())) {
      showToast('Could not parse that date. Try YYYY-MM-DD HH:mm');
      return;
    }
    try {
      await api.put(`/swaps/${id}/schedule`, { scheduledAt: date.toISOString() });
      showToast('✓ Swap scheduled!');
      loadSwaps();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule swap');
    }
  };

  const submitRating = async () => {
    try {
      await api.post('/ratings', { swapId: ratingFor._id, score, comment });
      showToast('✓ Thanks for rating!');
      setRatingFor(null);
      setComment('');
      loadSwaps();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  return (
    <div>
      <AppNav />
      <header className="matches-hero">
        <div className="container">
          <span className="hero-eyebrow">Pending, accepted &amp; done</span>
          <h1>Swap requests</h1>
        </div>
      </header>

      <section style={{ paddingTop: 8 }}>
        <div className="container">
          {loading && <p style={{ textAlign: 'center', color: 'var(--forest-soft)' }}>Loading swap requests...</p>}

          {!loading && swaps.length === 0 && (
            <EmptyState
              icon="🔄"
              title="No swap requests yet"
              message="Browse your matches and send your first request — it only takes a minute."
              ctaLabel="Browse matches"
              ctaTo="/matches"
            />
          )}

          <div className="swap-list">
            {swaps.map((swap) => {
              const isRecipient = swap.toUser._id === user.id;
              const other = isRecipient ? swap.fromUser : swap.toUser;
              const meta = statusMeta[swap.status];
              return (
                <div key={swap._id} className="pin-card swap-req-card">
                  <div className="swap-req-top">
                    <div className="person-top" style={{ marginBottom: 0 }}>
                      <div className="avatar">{other.name?.[0]?.toUpperCase()}</div>
                      <div className="person-name">{isRecipient ? 'From' : 'To'}: {other.name}</div>
                    </div>
                    <span className={`status-badge ${meta.className}`}>{meta.icon} {meta.label}</span>
                  </div>

                  <p className="person-row">
                    <span className="row-label">They teach you</span> {isRecipient ? swap.offeredSkill : swap.requestedSkill}
                  </p>
                  <p className="person-row">
                    <span className="row-label">You teach them</span> {isRecipient ? swap.requestedSkill : swap.offeredSkill}
                  </p>
                  {swap.message && <p className="field-hint" style={{ fontStyle: 'italic' }}>"{swap.message}"</p>}
                  {swap.scheduledAt && (
                    <p className="person-row">
                      <span className="row-label">Scheduled</span> {new Date(swap.scheduledAt).toLocaleString()}
                    </p>
                  )}

                  <div className="swap-actions">
                    {swap.status === 'pending' && isRecipient && (
                      <>
                        <button className="btn btn-primary" onClick={() => updateStatus(swap._id, 'accepted')}>✓ Accept</button>
                        <button className="btn btn-outline" onClick={() => updateStatus(swap._id, 'rejected')}>✕ Reject</button>
                      </>
                    )}
                    {swap.status === 'pending' && !isRecipient && (
                      <button className="btn btn-outline" onClick={() => updateStatus(swap._id, 'cancelled')}>✕ Cancel request</button>
                    )}
                    {swap.status === 'accepted' && (
                      <>
                        <button className="btn btn-outline" onClick={() => scheduleSwap(swap._id)}>
                          {swap.scheduledAt ? 'Reschedule' : 'Schedule'}
                        </button>
                        <Link to={`/chat/${swap._id}`} className="btn btn-outline">💬 Open chat</Link>
                        <button className="btn btn-primary" onClick={() => updateStatus(swap._id, 'completed')}>✓ Mark completed</button>
                      </>
                    )}
                    {swap.status === 'completed' && (
                      <>
                        <Link to={`/chat/${swap._id}`} className="btn btn-outline">💬 View chat</Link>
                        <button className="btn btn-primary" onClick={() => { setRatingFor(swap); setScore(5); setComment(''); }}>
                          ★ Rate {other.name.split(' ')[0]}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {ratingFor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50,
        }}>
          <div className="pin-card" style={{ maxWidth: 360, width: '100%' }}>
            <h3 style={{ marginBottom: 14 }}>Rate your swap</h3>
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, fontSize: '1.6rem' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: n <= score ? 'var(--gold-deep)' : 'var(--line)' }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Optional comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setRatingFor(null)}>Close</button>
              <button className="btn btn-primary" onClick={submitRating}>Submit rating</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
