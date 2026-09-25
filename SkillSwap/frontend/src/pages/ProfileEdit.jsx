import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppNav from '../components/AppNav.jsx';
import SkillTagInput from '../components/SkillTagInput.jsx';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProfileEdit() {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const onboarding = searchParams.get('onboarding') === '1';

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [isPinned, setIsPinned] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setTeachSkills(user.teachSkills || []);
      setLearnSkills(user.learnSkills || []);
      setIsPinned(user.isPinned !== undefined ? user.isPinned : true);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', { name, bio, teachSkills, learnSkills, isPinned });
      updateUser(res.data.user);
      showToast('✓ Profile updated!');
      navigate('/matches');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <AppNav />
      <main className="auth-wrap" style={{ minHeight: 'auto', paddingTop: 40, paddingBottom: 40 }}>
        <div className="auth-card" style={{ maxWidth: 480 }}>

          {onboarding && (
            <div className="onboarding-banner">
              <span className="onboarding-badge">📌</span>
              <div>
                <strong>Almost there!</strong>
                <p>Add a couple of skills so people can find and match with you on the board.</p>
              </div>
            </div>
          )}

          <div className="auth-head">
            <span className="logo"><span className="pin-dot"></span>SkillSwap</span>
            <h1>{onboarding ? 'Pin your card' : 'Update your profile'}</h1>
            <p>{onboarding ? "You skipped adding skills at signup — let's fix that." : 'Changes are reflected on the board right away.'}</p>
          </div>

          <form onSubmit={handleSave}>
            <div className="field">
              <label>Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Short bio <span style={{ fontWeight: 400, color: 'var(--forest-soft)' }}>(optional)</span></label>
              <textarea rows={2} placeholder="A line about yourself" value={bio} onChange={(e) => setBio(e.target.value)} />
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
                <span>Show my profile publicly so others can find and match with me.</span>
              </span>
            </label>

            <button type="submit" disabled={saving} className="btn btn-primary btn-block">
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>

          {onboarding && (
            <p className="auth-foot"><Link to="/matches">Skip for now, I'll add skills later →</Link></p>
          )}
          <p className="auth-foot"><Link to={`/profile/${user.id}`}>Preview how others see your card →</Link></p>
        </div>
      </main>
    </div>
  );
}
