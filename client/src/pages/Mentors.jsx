import { useState, useEffect } from 'react';
import { mentorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Mentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(null);
  const [bookForm, setBookForm] = useState({ date: '', topic: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mentorsRes, sessionsRes] = await Promise.all([
        mentorsAPI.getAll(),
        mentorsAPI.getSessions(),
      ]);
      setMentors(mentorsRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e, mentorId) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mentorsAPI.bookSession({ mentorId, ...bookForm });
      toast.success('Session booked!');
      setShowBook(null);
      setBookForm({ date: '', topic: '', message: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="mentors-page page-transition">
      <div className="page-header">
        <h1>Mentorship</h1>
        <p>Learn from experienced professionals</p>
      </div>

      <div className="mentors-section">
        <h2>Available Mentors</h2>
        <div className="grid grid-2">
          {mentors.map(mentor => (
            <div key={mentor.id} className="card mentor-card">
              <div className="mentor-avatar">
                {mentor.photos?.[0]?.url ? (
                  <img src={mentor.photos[0].url} alt="" />
                ) : (
                  <div className="avatar-placeholder-sm">{mentor.name?.[0]}</div>
                )}
              </div>
              <div className="mentor-info">
                <h3>{mentor.name}</h3>
                {mentor.headline && <p className="mentor-headline">{mentor.headline}</p>}
                <div className="mentor-rating">⭐ {mentor.rating || 'New'}</div>
                <div className="mentor-expertise">
                  <strong>Expertise:</strong>
                  <div className="skill-tags">
                    {mentor.skills?.slice(0, 5).map(s => <span key={s} className="tag-skill">{s}</span>)}
                  </div>
                </div>
                {mentor.experience && <p className="mentor-experience">📊 {mentor.experience} years experience</p>}
                <p className="mentor-bio">{mentor.bio?.substring(0, 120)}</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowBook(mentor.id)}>Book Session</button>
              </div>
            </div>
          ))}
        </div>
        {mentors.length === 0 && (
          <div className="empty-state">
            <h3>No mentors available yet</h3>
            <p>Check back later for mentorship opportunities</p>
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="sessions-section" style={{ marginTop: 40 }}>
          <h2>My Sessions</h2>
          <div className="grid grid-2">
            {sessions.map(session => (
              <div key={session.id} className="card">
                <h3>{session.mentor?.name}</h3>
                <p>📅 {new Date(session.date).toLocaleDateString()}</p>
                <p>📋 {session.topic}</p>
                <span className={`badge ${session.status === 'confirmed' ? 'badge-success' : session.status === 'pending' ? 'badge-warning' : 'badge-primary'}`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBook && (
        <div className="modal-overlay" onClick={() => setShowBook(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Book a Session</h2>
            <form onSubmit={(e) => handleBook(e, showBook)}>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" value={bookForm.date} onChange={e => setBookForm({ ...bookForm, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Topic</label>
                <input value={bookForm.topic} onChange={e => setBookForm({ ...bookForm, topic: e.target.value })} required placeholder="What do you want to discuss?" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={bookForm.message} onChange={e => setBookForm({ ...bookForm, message: e.target.value })} rows={3} placeholder="Any specific questions?" />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Book Session'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBook(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .mentors-page { max-width: 1000px; margin: 0 auto; }
        .mentors-section h2, .sessions-section h2 { font-size: 22px; margin-bottom: 20px; }
        .mentor-card { display: flex; gap: 16px; padding: 20px; }
        .mentor-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
        .mentor-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder-sm { width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 600; }
        .mentor-info { flex: 1; }
        .mentor-info h3 { font-size: 18px; margin-bottom: 4px; }
        .mentor-headline { color: var(--primary); font-size: 14px; }
        .mentor-expertise { margin: 8px 0; }
        .mentor-expertise strong { font-size: 13px; display: block; margin-bottom: 4px; }
        .mentor-experience { font-size: 14px; color: var(--text-light); margin: 4px 0; }
        .mentor-bio { font-size: 14px; color: var(--text-light); margin: 8px 0; line-height: 1.5; }
      `}</style>
    </div>
  );
}
