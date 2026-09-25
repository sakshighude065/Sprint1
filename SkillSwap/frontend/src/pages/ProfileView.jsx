import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import AppNav from '../components/AppNav.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function starString(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export default function ProfileView() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const isMe = !id || id === me?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSwap, setSentSwap] = useState(null);
  const [swapDate, setSwapDate] = useState('');
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const targetId = isMe ? me?.id : id;
        if (!targetId) return;
        const res = await api.get(`/users/${targetId}`);
        setProfile(res.data.user);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    if (me) load();
  }, [id, me, isMe]);

  const sendRequest = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.post('/swaps', {
        toUser: id,
        offeredSkill,
        requestedSkill,
        message: note,
      });
      setSentSwap(res.data.swap);
      showToast(`Swap request sent to ${profile.name.split(' ')[0]}!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const confirmSchedule = async () => {
    if (!swapDate || !sentSwap) return;
    try {
      await api.put(`/swaps/${sentSwap._id}/schedule`, { scheduledAt: new Date(swapDate).toISOString() });
      setScheduled(true);
      showToast('✓ Swap scheduled!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule');
    }
  };

  if (loading) return (
    <div>
      <AppNav />
      <p style={{ textAlign: 'center', padding: 60, color: 'var(--forest-soft)' }}>Loading profile...</p>
    </div>
  );

  if (!profile) return (
    <div>
      <AppNav />
      <p style={{ textAlign: 'center', padding: 60, color: 'var(--forest-soft)' }}>Profile not found.</p>
    </div>
  );

  return (
    <div>
      <AppNav />
      <main className="profile-wrap">
        <div className="container">
          <Link to="/matches" className="back-link">← Back to matches</Link>

          <div className="profile-layout">
            <div className="pin-card rot-s profile-card">
              <div className="profile-top">
                <div className="avatar avatar-lg">{profile.name?.[0]?.toUpperCase()}</div>
                <div>
                  <h1 className="profile-name">{profile.name}{isMe ? ' (you)' : ''}</h1>
                  <div className="profile-rating">
                    <span className="stars">{starString(profile.ratingAvg)}</span>
                    {profile.ratingCount > 0 ? `${profile.ratingAvg} · ${profile.ratingCount} ratings` : 'No ratings yet'}
                  </div>
                  <StreakBadge count={profile.swapsCompleted} />
                </div>
              </div>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <div className="profile-skill-block">
                <span className="row-label">Teaches</span>
                <div className="tags">
                  {profile.teachSkills?.length
                    ? profile.teachSkills.map((s) => <span key={s} className="tag tag-teach">{s}</span>)
                    : <span className="field-hint">Nothing listed yet</span>}
                </div>
              </div>
              <div className="profile-skill-block">
                <span className="row-label">Wants to learn</span>
                <div className="tags">
                  {profile.learnSkills?.length
                    ? profile.learnSkills.map((s) => <span key={s} className="tag tag-learn">{s}</span>)
                    : <span className="field-hint">Nothing listed yet</span>}
                </div>
              </div>

              {isMe ? (
                <>
                  <p className="field-hint" style={{ marginTop: 14 }}>
                    {profile.isPinned ? '✦ Pinned to the public board — visible to everyone browsing SkillSwap.' : 'Your card is currently unpinned — hidden from the board.'}
                  </p>
                  <button onClick={() => navigate('/profile-edit')} className="btn btn-primary btn-block" style={{ marginTop: 12 }}>
                    ✏️ Edit my profile
                  </button>
                </>
              ) : (
                <button onClick={() => navigate(`/swap-requests`)} className="btn btn-outline btn-block" style={{ marginTop: 18 }}>
                  💬 Message {profile.name.split(' ')[0]} (via swap requests)
                </button>
              )}
            </div>

            {!isMe && (
              <div className="profile-side">
                {!sentSwap ? (
                  <div className="pin-card rot-l swap-panel">
                    <h3>Request a swap</h3>
                    <p className="field-hint" style={{ marginBottom: 14 }}>Tell them what you'll teach and what you'd like to learn.</p>
                    <form onSubmit={sendRequest}>
                      <div className="field">
                        <label>Skill you'll teach them</label>
                        <input type="text" value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)} placeholder="e.g. css" required />
                      </div>
                      <div className="field">
                        <label>Skill you want to learn from them</label>
                        <input type="text" value={requestedSkill} onChange={(e) => setRequestedSkill(e.target.value)} placeholder="e.g. guitar" required />
                      </div>
                      <div className="field">
                        <label>Note (optional)</label>
                        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Say hi and set expectations" />
                      </div>
                      <button type="submit" disabled={sending} className="btn btn-primary btn-block">
                        {sending ? 'Sending...' : 'Send swap request'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="pin-card rot-r schedule-panel">
                    <h3>Schedule your swap</h3>
                    <p className="field-hint" style={{ marginBottom: 14 }}>
                      Request sent! Once {profile.name.split(' ')[0]} accepts, pick a time below.
                    </p>
                    <div className="field">
                      <label>Date &amp; time</label>
                      <input type="datetime-local" value={swapDate} onChange={(e) => setSwapDate(e.target.value)} />
                    </div>
                    <button type="button" onClick={confirmSchedule} className="btn btn-outline btn-block">Confirm time</button>
                    {scheduled && <p className="field-hint" style={{ marginTop: 10, color: 'var(--forest)' }}>✓ Scheduled — you'll both get a reminder.</p>}
                    <Link to="/swap-requests" className="btn btn-primary btn-block" style={{ marginTop: 14 }}>View in swap requests →</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
