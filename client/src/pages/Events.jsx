import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { id: 'all', label: 'All Events', icon: '📅' },
  { id: 'networking', label: 'Networking', icon: '🤝' },
  { id: 'hackathon', label: 'Hackathon', icon: '💻' },
  { id: 'pitch', label: 'Startup Pitch', icon: '🚀' },
  { id: 'webinar', label: 'Webinar', icon: '🎥' },
  { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
  { id: 'meetup', label: 'Community Meetup', icon: '☕' },
];

const SAMPLE_EVENTS = [
  {
    id: 1, title: 'AI in Healthcare Summit', type: 'webinar', date: 'Aug 25, 2026', time: '2:00 PM EAT',
    location: 'Virtual (Zoom)', description: 'Join leading AI researchers and healthcare professionals to discuss the future of AI-powered diagnostics and treatment.',
    speakers: ['Dr. Aisha Mohammed', 'James Okafor', 'Sara Chen'],
    attendees: 234, maxAttendees: 500, isOnline: true, isFree: true,
    tags: ['AI', 'Healthcare', 'Innovation'], organizer: 'TechForHealth',
  },
  {
    id: 2, title: 'Startup Pitch Night — Addis Ababa', type: 'pitch', date: 'Sep 5, 2026', time: '6:00 PM EAT',
    location: 'Innovation Hub, Addis Ababa', description: 'Watch 10 early-stage startups pitch to a panel of VCs and angel investors. Networking session follows.',
    speakers: ['Hosted by Ethiopia Ventures'],
    attendees: 89, maxAttendees: 150, isOnline: false, isFree: false, price: '$15',
    tags: ['Startups', 'Funding', 'Networking'], organizer: 'Ethiopia Ventures',
  },
  {
    id: 3, title: 'React & Beyond — Hackathon', type: 'hackathon', date: 'Sep 12-13, 2026', time: '9:00 AM - 6:00 PM',
    location: 'Nairobi Tech Hub, Kenya', description: '48-hour hackathon building innovative React applications. Prizes worth $5,000!',
    speakers: ['Mentors from Meta, Google, Andela'],
    attendees: 156, maxAttendees: 200, isOnline: false, isFree: true,
    tags: ['React', 'Hackathon', 'Prizes'], organizer: 'NairobiJS',
  },
  {
    id: 4, title: 'Career Growth in Tech — Panel Discussion', type: 'mentorship', date: 'Sep 18, 2026', time: '4:00 PM EAT',
    location: 'Virtual (Zoom)', description: 'Learn from senior engineers and leaders about navigating your tech career from junior to staff level.',
    speakers: ['Priya Sharma', 'Fatima Al-Rashid', 'Michael Chen'],
    attendees: 312, maxAttendees: 1000, isOnline: true, isFree: true,
    tags: ['Career', 'Mentorship', 'Growth'], organizer: 'Women in Tech Africa',
  },
  {
    id: 5, title: 'Lagos Tech Meetup — Monthly', type: 'meetup', date: 'Sep 22, 2026', time: '5:30 PM WAT',
    location: 'Co-Creation Hub, Lagos', description: 'Monthly community meetup for developers, designers, and tech enthusiasts. Lightning talks + networking.',
    speakers: ['Community Speakers'],
    attendees: 67, maxAttendees: 100, isOnline: false, isFree: true,
    tags: ['Community', 'Networking', 'Lagos'], organizer: 'Lagos Tech Community',
  },
  {
    id: 6, title: 'Building Your First SaaS — Workshop', type: 'webinar', date: 'Oct 1, 2026', time: '10:00 AM EAT',
    location: 'Virtual (Zoom)', description: 'Hands-on workshop covering SaaS architecture, billing, deployment, and scaling strategies.',
    speakers: ['Kwame Asante'],
    attendees: 178, maxAttendees: 300, isOnline: true, isFree: false, price: '$25',
    tags: ['SaaS', 'Workshop', 'Architecture'], organizer: 'SaaS Academy Africa',
  },
];

function EventCard({ event, onJoin, isRegistered }) {
  const [showDetail, setShowDetail] = useState(false);
  const spotsLeft = event.maxAttendees - event.attendees;
  const spotsPercent = (event.attendees / event.maxAttendees) * 100;

  return (
    <>
      <div className="event-card card" onClick={() => setShowDetail(true)}>
        <div className="event-card-top">
          <span className={`event-type-badge type-${event.type}`}>
            {EVENT_TYPES.find(t => t.id === event.type)?.icon} {EVENT_TYPES.find(t => t.id === event.type)?.label}
          </span>
          <span className={`event-price ${event.isFree ? 'free' : ''}`}>
            {event.isFree ? 'Free' : event.price}
          </span>
        </div>

        <h3 className="event-title">{event.title}</h3>

        <div className="event-meta">
          <span className="event-meta-item">📅 {event.date}</span>
          <span className="event-meta-item">⏰ {event.time}</span>
          <span className="event-meta-item">{event.isOnline ? '💻' : '📍'} {event.location}</span>
        </div>

        <p className="event-desc">{event.description.substring(0, 120)}...</p>

        <div className="event-tags">
          {event.tags.map(tag => <span key={tag} className="tag-skill tag-xs">{tag}</span>)}
        </div>

        <div className="event-spots">
          <div className="spots-bar">
            <div className="spots-fill" style={{ width: `${spotsPercent}%` }} />
          </div>
          <span className="spots-text">{spotsLeft} spots left</span>
        </div>

        <div className="event-card-footer">
          <span className="event-attendees">👥 {event.attendees} attending</span>
          <button
            className={`btn ${isRegistered ? 'btn-outline' : 'btn-primary'} btn-sm`}
            onClick={(e) => { e.stopPropagation(); onJoin(event.id); }}
          >
            {isRegistered ? 'Registered ✓' : 'Join Event'}
          </button>
        </div>
      </div>

      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="event-detail-header">
              <span className={`event-type-badge type-${event.type} lg`}>
                {EVENT_TYPES.find(t => t.id === event.type)?.icon} {EVENT_TYPES.find(t => t.id === event.type)?.label}
              </span>
              <h2>{event.title}</h2>
              <p className="event-organizer">by {event.organizer}</p>
            </div>

            <div className="event-detail-meta">
              <div className="event-detail-item">
                <span className="detail-icon">📅</span>
                <div>
                  <strong>Date</strong>
                  <p>{event.date}</p>
                </div>
              </div>
              <div className="event-detail-item">
                <span className="detail-icon">⏰</span>
                <div>
                  <strong>Time</strong>
                  <p>{event.time}</p>
                </div>
              </div>
              <div className="event-detail-item">
                <span className="detail-icon">{event.isOnline ? '💻' : '📍'}</span>
                <div>
                  <strong>Location</strong>
                  <p>{event.location}</p>
                </div>
              </div>
              <div className="event-detail-item">
                <span className="detail-icon">💰</span>
                <div>
                  <strong>Price</strong>
                  <p>{event.isFree ? 'Free' : event.price}</p>
                </div>
              </div>
            </div>

            <h3>About This Event</h3>
            <p className="event-detail-desc">{event.description}</p>

            <h3>Speakers</h3>
            <div className="event-speakers">
              {event.speakers.map((speaker, i) => (
                <div key={i} className="speaker-chip">
                  <div className="speaker-avatar">{speaker[0]}</div>
                  <span>{speaker}</span>
                </div>
              ))}
            </div>

            <h3>Tags</h3>
            <div className="skill-tags">{event.tags.map(tag => <span key={tag} className="tag-skill">{tag}</span>)}</div>

            <div className="event-detail-footer">
              <div className="event-spots-detail">
                <div className="spots-bar lg">
                  <div className="spots-fill" style={{ width: `${spotsPercent}%` }} />
                </div>
                <span>{event.attendees}/{event.maxAttendees} spots filled</span>
              </div>
              <button
                className={`btn ${isRegistered ? 'btn-outline' : 'btn-primary'} btn-lg`}
                onClick={() => { onJoin(event.id); setShowDetail(false); }}
              >
                {isRegistered ? 'Registered ✓' : 'Register Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [activeTab, setActiveTab] = useState('browse');
  const [activeType, setActiveType] = useState('all');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleJoin = (eventId) => {
    setRegisteredEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        toast.success('Unregistered from event');
      } else {
        next.add(eventId);
        toast.success('Registered for event!');
      }
      return next;
    });
  };

  const filteredEvents = events
    .filter(e => activeType === 'all' || e.type === activeType)
    .filter(e => !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="events-page page-transition">
      <div className="page-header">
        <h1>Innovation Events</h1>
        <p>Connect, learn, and grow at events across Africa</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          <span className="tab-icon">📅</span> Browse
        </button>
        <button className={`tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
          <span className="tab-icon">🎟️</span> My Events ({registeredEvents.size})
        </button>
        <button className={`tab ${activeTab === 'host' ? 'active' : ''}`} onClick={() => setActiveTab('host')}>
          <span className="tab-icon">➕</span> Host Event
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="events-browse">
          <div className="events-toolbar">
            <div className="search-bar-events">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search events, topics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="event-type-tabs">
            {EVENT_TYPES.map(type => (
              <button key={type.id} className={`event-type-tab ${activeType === type.id ? 'active' : ''}`} onClick={() => setActiveType(type.id)}>
                <span>{type.icon}</span> {type.label}
              </button>
            ))}
          </div>

          <div className="featured-event card">
            <div className="featured-badge">⭐ Featured</div>
            <div className="featured-content">
              <h2>AI in Healthcare Summit</h2>
              <p>The premier event exploring AI's impact on healthcare across Africa</p>
              <div className="featured-meta">
                <span>📅 Aug 25, 2026</span>
                <span>💻 Virtual</span>
                <span>👥 234 registered</span>
              </div>
              <button className="btn btn-primary" onClick={() => handleJoin(1)}>
                {registeredEvents.has(1) ? 'Registered ✓' : 'Register Free'}
              </button>
            </div>
          </div>

          <div className="events-grid">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={handleJoin}
                isRegistered={registeredEvents.has(event.id)}
              />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No events found</h3>
              <p>Try a different category or search term</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="my-events">
          {events.filter(e => registeredEvents.has(e.id)).length > 0 ? (
            <div className="events-grid">
              {events.filter(e => registeredEvents.has(e.id)).map(event => (
                <EventCard key={event.id} event={event} onJoin={handleJoin} isRegistered={true} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎟️</div>
              <h3>No events registered</h3>
              <p>Browse events and register to see them here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'host' && (
        <div className="host-event-section">
          <div className="card host-event-card">
            <h2>Host an Event</h2>
            <p className="host-desc">Share your knowledge, host a meetup, or organize a hackathon</p>
            <div className="form-group">
              <label>Event Title</label>
              <input placeholder="e.g., AI Workshop for Beginners" />
            </div>
            <div className="form-group">
              <label>Event Type</label>
              <select>
                {EVENT_TYPES.filter(t => t.id !== 'all').map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input placeholder="e.g., Virtual or physical address" />
              </div>
              <div className="form-group">
                <label>Max Attendees</label>
                <input type="number" placeholder="e.g., 100" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={5} placeholder="Describe your event..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ticket Price</label>
                <select>
                  <option>Free</option>
                  <option>Paid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tags</label>
                <input placeholder="e.g., AI, Workshop, Free (comma separated)" />
              </div>
            </div>
            <button className="btn btn-primary btn-lg">Create Event</button>
          </div>
        </div>
      )}

      <style>{`
        .events-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }
        .tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .tab:hover { background: rgba(74,108,247,0.05); }
        .tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .tab-icon { margin-right: 6px; }

        .events-toolbar { margin-bottom: 16px; }
        .search-bar-events { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
        .search-bar-events input { flex: 1; border: none; background: transparent; font-size: 14px; outline: none; }

        .event-type-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px; }
        .event-type-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--card); border: 2px solid var(--border); border-radius: 20px; cursor: pointer; font-size: 13px; white-space: nowrap; transition: all 0.2s; }
        .event-type-tab:hover { border-color: var(--primary); }
        .event-type-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

        .featured-event { padding: 32px; background: linear-gradient(135deg, rgba(74,108,247,0.05), rgba(139,92,246,0.05)); margin-bottom: 24px; position: relative; overflow: hidden; }
        .featured-badge { position: absolute; top: 16px; right: 16px; padding: 4px 12px; background: var(--primary); color: #fff; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .featured-content h2 { font-size: 24px; margin-bottom: 8px; }
        .featured-content p { color: var(--text-light); margin-bottom: 12px; }
        .featured-meta { display: flex; gap: 16px; margin-bottom: 16px; font-size: 14px; color: var(--text-light); }

        .events-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .event-card { padding: 20px; cursor: pointer; transition: all 0.2s; }
        .event-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .event-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .event-type-badge { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 500; }
        .event-type-badge.lg { font-size: 14px; padding: 6px 14px; }
        .type-networking { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .type-hackathon { background: rgba(139,92,246,0.1); color: #8b5cf6; }
        .type-pitch { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .type-webinar { background: rgba(16,185,129,0.1); color: #10b981; }
        .type-mentorship { background: rgba(236,72,153,0.1); color: #ec4899; }
        .type-meetup { background: rgba(6,182,212,0.1); color: #06b6d4; }
        .event-price { font-size: 14px; font-weight: 600; }
        .event-price.free { color: #22c55e; }
        .event-title { font-size: 18px; margin-bottom: 8px; }
        .event-meta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
        .event-meta-item { font-size: 13px; color: var(--text-light); }
        .event-desc { font-size: 14px; color: var(--text-light); line-height: 1.5; margin-bottom: 12px; }
        .event-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px; }
        .tag-xs { font-size: 10px; padding: 2px 6px; }
        .event-spots { margin-bottom: 12px; }
        .spots-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .spots-bar.lg { height: 6px; }
        .spots-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 2px; transition: width 0.3s; }
        .spots-text { font-size: 11px; color: var(--text-light); margin-top: 4px; display: block; }
        .event-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
        .event-attendees { font-size: 13px; color: var(--text-light); }

        .event-detail-header { margin-bottom: 20px; }
        .event-detail-header h2 { margin-top: 12px; }
        .event-organizer { color: var(--primary); font-size: 14px; }
        .event-detail-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius); margin-bottom: 20px; }
        .event-detail-item { display: flex; gap: 10px; }
        .detail-icon { font-size: 20px; }
        .event-detail-item strong { display: block; font-size: 13px; margin-bottom: 2px; }
        .event-detail-item p { font-size: 14px; margin: 0; }
        .event-detail-desc { font-size: 14px; line-height: 1.6; color: var(--text-light); margin-bottom: 20px; }
        .event-speakers { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .speaker-chip { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-secondary); border-radius: var(--radius); font-size: 14px; }
        .speaker-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
        .event-detail-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
        .event-spots-detail span { font-size: 13px; color: var(--text-light); display: block; margin-top: 4px; }

        .host-event-card { max-width: 600px; margin: 0 auto; padding: 32px; }
        .host-desc { color: var(--text-light); margin-bottom: 24px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-light); }

        @media (max-width: 768px) {
          .events-grid { grid-template-columns: 1fr; }
          .event-detail-meta { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
