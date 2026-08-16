import { useState, useEffect } from 'react';
import { mentorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SESSION_TYPES = [
  { id: 'quick', label: 'Quick Chat', duration: '15 min', icon: '☕', desc: 'Quick questions' },
  { id: 'standard', label: 'Standard', duration: '30 min', icon: '📋', desc: 'Guidance session' },
  { id: 'deep', label: 'Deep Dive', duration: '60 min', icon: '🎯', desc: 'In-depth mentoring' },
  { id: 'review', label: 'Code Review', duration: '45 min', icon: '🔍', desc: 'Review work together' },
];

const EXPERTISE_AREAS = [
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data Science',
  'Machine Learning', 'Product Management', 'UI/UX Design', 'Startup Strategy',
  'Career Growth', 'Leadership', 'Entrepreneurship', 'Marketing',
];

function MentorCard({ mentor, onBook, onViewReviews }) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedType, setSelectedType] = useState('standard');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookForm, setBookForm] = useState({ date: '', topic: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const availability = mentor.availability || [
    { day: 'Mon', slots: ['10:00', '14:00'] },
    { day: 'Wed', slots: ['11:00', '15:00'] },
    { day: 'Fri', slots: ['09:00', '13:00'] },
  ];

  const reviews = mentor.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : mentor.rating || 'New';

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onBook(mentor.id, {
        sessionType: selectedType,
        date: selectedSlot || bookForm.date,
        topic: bookForm.topic,
        message: bookForm.message,
      });
      setShowBooking(false);
      setBookForm({ date: '', topic: '', message: '' });
      setSelectedSlot(null);
    } catch {
      toast.error('Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mentor-card card">
      <div className="mentor-card-header">
        <div className="mentor-avatar-area">
          {mentor.photos?.[0]?.url ? (
            <img src={mentor.photos[0].url} alt="" className="mentor-avatar" />
          ) : (
            <div className="avatar-placeholder-lg">{mentor.name?.[0]}</div>
          )}
          {mentor.verified && <span className="verified-check">✓</span>}
        </div>
        <div className="mentor-quick-info">
          <h3>{mentor.name}</h3>
          <p className="mentor-headline">{mentor.headline || 'Professional Mentor'}</p>
          <div className="mentor-rating-row">
            <span className="rating-stars">{'⭐'.repeat(Math.round(avgRating))}</span>
            <span className="rating-number">{avgRating}</span>
            <span className="rating-count">({reviews.length || mentor.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </div>

      {mentor.bio && <p className="mentor-bio">{mentor.bio.substring(0, 160)}</p>}

      <div className="mentor-details-grid">
        {mentor.experience && (
          <div className="mentor-detail">
            <span className="detail-icon">📊</span>
            <span>{mentor.experience} years experience</span>
          </div>
        )}
        {mentor.hourlyRate && (
          <div className="mentor-detail">
            <span className="detail-icon">💰</span>
            <span>${mentor.hourlyRate}/session</span>
          </div>
        )}
        <div className="mentor-detail">
          <span className="detail-icon">📍</span>
          <span>{mentor.location || 'Remote'}</span>
        </div>
        <div className="mentor-detail">
          <span className="detail-icon">⚡</span>
          <span>{mentor.responseTime || 'Within 24h'}</span>
        </div>
      </div>

      <div className="mentor-skills-section">
        <strong>Expertise</strong>
        <div className="skill-tags">
          {mentor.skills?.slice(0, 5).map(s => <span key={s} className="tag-skill">{s}</span>)}
        </div>
      </div>

      {mentor.sessionTypes && (
        <div className="session-types-row">
          {mentor.sessionTypes.map(st => (
            <div key={st} className="session-type-badge">
              {SESSION_TYPES.find(s => s.id === st)?.icon} {SESSION_TYPES.find(s => s.id === st)?.label}
            </div>
          ))}
        </div>
      )}

      {availability.length > 0 && (
        <div className="availability-section">
          <strong>Availability this week</strong>
          <div className="availability-grid">
            {availability.map(day => (
              <div key={day.day} className="avail-day">
                <span className="avail-day-label">{day.day}</span>
                <div className="avail-slots">
                  {day.slots?.map(slot => (
                    <span key={slot} className="avail-slot">{slot}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mentor-actions">
        <button className="btn btn-primary" onClick={() => setShowBooking(true)}>Book Session</button>
        <button className="btn btn-outline" onClick={() => onViewReviews(mentor)}>Reviews ({reviews.length})</button>
      </div>

      {showBooking && (
        <div className="modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Book {mentor.name}</h2>

            <div className="form-group">
              <label>Session Type</label>
              <div className="session-type-grid">
                {SESSION_TYPES.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    className={`session-type-option ${selectedType === st.id ? 'selected' : ''}`}
                    onClick={() => setSelectedType(st.id)}
                  >
                    <span className="st-icon">{st.icon}</span>
                    <span className="st-label">{st.label}</span>
                    <span className="st-duration">{st.duration}</span>
                    <span className="st-desc">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Select Time Slot</label>
              <div className="slot-picker">
                {availability.map(day => (
                  <div key={day.day} className="slot-day">
                    <span className="slot-day-name">{day.day}</span>
                    <div className="slot-options">
                      {day.slots?.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          className={`slot-btn ${selectedSlot === `${day.day} ${slot}` ? 'selected' : ''}`}
                          onClick={() => setSelectedSlot(`${day.day} ${slot}`)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Topic</label>
                <input value={bookForm.topic} onChange={e => setBookForm({ ...bookForm, topic: e.target.value })} required placeholder="What do you want to discuss?" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={bookForm.message} onChange={e => setBookForm({ ...bookForm, message: e.target.value })} rows={3} placeholder="Any specific questions or context?" />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting || !selectedSlot}>
                  {submitting ? 'Booking...' : 'Book Session'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBooking(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsModal({ mentor, onClose }) {
  const reviews = mentor.reviews || [];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <h2>Reviews for {mentor.name}</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review, i) => (
              <div key={i} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    {review.user?.photos?.[0]?.url ? (
                      <img src={review.user.photos[0].url} alt="" className="review-avatar" />
                    ) : (
                      <div className="avatar-xs">{review.user?.name?.[0]}</div>
                    )}
                    <span className="review-name">{review.user?.name || 'Anonymous'}</span>
                  </div>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-text">{review.text}</p>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet</p>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [filterExpertise, setFilterExpertise] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadData(); }, []);

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

  const handleBook = async (mentorId, bookingData) => {
    try {
      await mentorsAPI.bookSession({ mentorId, ...bookingData });
      toast.success('Session booked!');
      loadData();
    } catch (err) {
      throw err;
    }
  };

  const filteredMentors = mentors
    .filter(m => filterExpertise === 'all' || m.skills?.includes(filterExpertise))
    .filter(m => !searchQuery || m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.headline?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
      if (sortBy === 'price') return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      return 0;
    });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="mentors-page page-transition">
      <div className="page-header">
        <h1>Mentorship</h1>
        <p>Learn from experienced professionals and accelerate your growth</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          <span className="tab-icon">🔍</span> Browse Mentors
        </button>
        <button className={`tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
          <span className="tab-icon">📅</span> My Sessions ({sessions.length})
        </button>
        <button className={`tab ${activeTab === 'become' ? 'active' : ''}`} onClick={() => setActiveTab('become')}>
          <span className="tab-icon">🎓</span> Become a Mentor
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="browse-section">
          <div className="browse-toolbar">
            <div className="search-bar-mentors">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>

          <div className="expertise-tabs">
            <button className={`expertise-tab ${filterExpertise === 'all' ? 'active' : ''}`} onClick={() => setFilterExpertise('all')}>All</button>
            {EXPERTISE_AREAS.map(area => (
              <button key={area} className={`expertise-tab ${filterExpertise === area ? 'active' : ''}`} onClick={() => setFilterExpertise(area)}>
                {area}
              </button>
            ))}
          </div>

          <div className="mentors-grid">
            {filteredMentors.map(mentor => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onBook={handleBook}
                onViewReviews={(m) => setSelectedMentor(m)}
              />
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>No mentors found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="sessions-section">
          {sessions.length > 0 ? (
            <div className="sessions-grid">
              {sessions.map(session => (
                <div key={session.id} className="session-card card">
                  <div className="session-header">
                    <div className="session-mentor">
                      {session.mentor?.photos?.[0]?.url ? (
                        <img src={session.mentor.photos[0].url} alt="" />
                      ) : (
                        <div className="avatar-xs">{session.mentor?.name?.[0]}</div>
                      )}
                      <div>
                        <h4>{session.mentor?.name}</h4>
                        <p className="session-type-label">
                          {SESSION_TYPES.find(s => s.id === session.sessionType)?.icon} {SESSION_TYPES.find(s => s.id === session.sessionType)?.label || session.topic}
                        </p>
                      </div>
                    </div>
                    <span className={`session-status status-${session.status}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="session-details">
                    <div className="session-detail">
                      <span className="detail-icon">📅</span>
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="session-detail">
                      <span className="detail-icon">📋</span>
                      <span>{session.topic}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No sessions yet</h3>
              <p>Browse mentors and book your first session!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'become' && (
        <div className="become-section">
          <div className="become-card card">
            <div className="become-header">
              <div className="become-icon">🎓</div>
              <h2>Share Your Expertise</h2>
              <p>Help the next generation of professionals grow while building your reputation</p>
            </div>
            <div className="become-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">💰</span>
                <h4>Earn Money</h4>
                <p>Set your own rates and earn from mentoring sessions</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🏆</span>
                <h4>Build Reputation</h4>
                <p>Earn reviews and badges that establish your expertise</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🌐</span>
                <h4>Expand Network</h4>
                <p>Connect with professionals across various fields</p>
              </div>
            </div>
            <button className="btn btn-primary btn-lg">Apply to Become a Mentor</button>
          </div>
        </div>
      )}

      {selectedMentor && (
        <ReviewsModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}

      <style>{`
        .mentors-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }

        .tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .tab:hover { background: rgba(74,108,247,0.05); }
        .tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }

        .browse-toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
        .search-bar-mentors { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
        .search-bar-mentors input { flex: 1; border: none; background: transparent; font-size: 14px; outline: none; }
        .sort-select { padding: 10px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; cursor: pointer; }

        .expertise-tabs { display: flex; gap: 6px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px; }
        .expertise-tab { padding: 6px 14px; border-radius: 16px; border: 1px solid var(--border); background: var(--card); cursor: pointer; font-size: 12px; white-space: nowrap; transition: all 0.2s; }
        .expertise-tab:hover { border-color: var(--primary); }
        .expertise-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

        .mentors-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .mentor-card { padding: 24px; }

        .mentor-card-header { display: flex; gap: 16px; margin-bottom: 12px; }
        .mentor-avatar-area { position: relative; flex-shrink: 0; }
        .mentor-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder-lg { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 600; }
        .verified-check { position: absolute; bottom: 0; right: 0; width: 24px; height: 24px; background: var(--primary); color: #fff; border-radius: 50%; border: 2px solid var(--card); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }

        .mentor-quick-info h3 { font-size: 20px; margin-bottom: 2px; }
        .mentor-headline { color: var(--primary); font-size: 14px; font-weight: 500; }
        .mentor-rating-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .rating-stars { font-size: 14px; }
        .rating-number { font-weight: 700; font-size: 14px; }
        .rating-count { color: var(--text-light); font-size: 13px; }

        .mentor-bio { color: var(--text-light); font-size: 14px; line-height: 1.5; margin-bottom: 12px; }

        .mentor-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px; }
        .mentor-detail { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-light); }

        .mentor-skills-section { margin-bottom: 12px; }
        .mentor-skills-section strong { font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }

        .session-types-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .session-type-badge { font-size: 12px; padding: 4px 10px; background: rgba(74,108,247,0.08); border-radius: 12px; }

        .availability-section { margin-bottom: 16px; }
        .availability-section strong { font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
        .availability-grid { display: flex; gap: 12px; flex-wrap: wrap; }
        .avail-day { display: flex; align-items: center; gap: 8px; }
        .avail-day-label { font-size: 12px; font-weight: 600; min-width: 32px; }
        .avail-slots { display: flex; gap: 4px; }
        .avail-slot { font-size: 11px; padding: 2px 6px; background: rgba(34,197,94,0.1); color: #059669; border-radius: 4px; }

        .mentor-actions { display: flex; gap: 8px; }

        .session-type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .session-type-option { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px; border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; background: var(--card); }
        .session-type-option:hover { border-color: var(--primary); }
        .session-type-option.selected { border-color: var(--primary); background: rgba(74,108,247,0.05); }
        .st-icon { font-size: 24px; }
        .st-label { font-weight: 600; font-size: 14px; }
        .st-duration { font-size: 12px; color: var(--primary); font-weight: 500; }
        .st-desc { font-size: 11px; color: var(--text-light); }

        .slot-picker { display: flex; flex-direction: column; gap: 8px; }
        .slot-day { display: flex; align-items: center; gap: 8px; }
        .slot-day-name { font-size: 13px; font-weight: 600; min-width: 36px; }
        .slot-options { display: flex; gap: 6px; }
        .slot-btn { padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--card); cursor: pointer; font-size: 13px; transition: all 0.2s; }
        .slot-btn:hover { border-color: var(--primary); }
        .slot-btn.selected { background: var(--primary); color: #fff; border-color: var(--primary); }

        .sessions-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .session-card { padding: 16px; }
        .session-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .session-mentor { display: flex; align-items: center; gap: 10px; }
        .session-mentor img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .session-mentor h4 { font-size: 16px; margin-bottom: 0; }
        .session-type-label { font-size: 12px; color: var(--text-light); }
        .session-status { font-size: 12px; padding: 4px 10px; border-radius: 12px; text-transform: capitalize; }
        .status-confirmed { background: #d1fae5; color: #059669; }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-completed { background: #dbeafe; color: #2563eb; }
        .session-details { display: flex; gap: 16px; }
        .session-detail { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-light); }

        .become-section { max-width: 600px; margin: 0 auto; }
        .become-card { padding: 40px; text-align: center; }
        .become-header { margin-bottom: 32px; }
        .become-icon { font-size: 48px; margin-bottom: 12px; }
        .become-header h2 { font-size: 24px; margin-bottom: 8px; }
        .become-header p { color: var(--text-light); }
        .become-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; text-align: center; }
        .benefit-icon { font-size: 32px; display: block; margin-bottom: 8px; }
        .benefit-item h4 { font-size: 14px; margin-bottom: 4px; }
        .benefit-item p { font-size: 13px; color: var(--text-light); }
        .btn-lg { padding: 14px 32px; font-size: 16px; }

        .reviews-list { max-height: 400px; overflow-y: auto; }
        .review-item { padding: 16px 0; border-bottom: 1px solid var(--border); }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .review-author { display: flex; align-items: center; gap: 8px; }
        .review-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .avatar-xs { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; }
        .review-name { font-weight: 600; font-size: 14px; }
        .review-rating { font-size: 14px; }
        .review-text { font-size: 14px; color: var(--text-light); line-height: 1.5; margin-bottom: 4px; }
        .review-date { font-size: 12px; color: var(--text-light); }
        .no-reviews { text-align: center; color: var(--text-light); padding: 40px; }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-light); }

        @media (max-width: 768px) {
          .browse-toolbar { flex-direction: column; }
          .mentor-details-grid { grid-template-columns: 1fr; }
          .become-benefits { grid-template-columns: 1fr; }
          .session-type-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
