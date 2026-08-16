import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationAPI } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'connection', label: 'Connections', icon: '🤝' },
  { id: 'message', label: 'Messages', icon: '💬' },
  { id: 'project', label: 'Projects', icon: '📁' },
  { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
  { id: 'system', label: 'System', icon: '⚙️' },
];

function formatTime(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type) {
  switch (type) {
    case 'connection':
    case 'match': return '🤝';
    case 'message': return '💬';
    case 'project': return '📁';
    case 'mentorship': return '🎓';
    case 'system': return '⚙️';
    case 'like': return '❤️';
    case 'comment': return '💬';
    case 'follow': return '👤';
    case 'endorsement': return '⭐';
    case 'achievement': return '🏆';
    default: return '🔔';
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll({ limit: 50 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(item => item.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.id === 'all'
      ? notifications.length
      : notifications.filter(n => n.type === cat.id).length;
    return acc;
  }, {});

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="notifications-page page-transition">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="text-secondary">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all read
        </button>
      </div>

      {/* Category Tabs */}
      <div className="notification-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`notification-category ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="notification-category-icon">{cat.icon}</span>
            <span>{cat.label}</span>
            {categoryCounts[cat.id] > 0 && (
              <span className="notification-category-count">{categoryCounts[cat.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="card notification-list-card">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              {activeCategory === 'all'
                ? 'You\'re all caught up! New alerts will appear here.'
                : `No ${CATEGORIES.find(c => c.id === activeCategory)?.label.toLowerCase()} notifications yet.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              className={`notification-row ${item.isRead ? '' : 'unread'}`}
              onClick={() => !item.isRead && markAsRead(item.id)}
            >
              <div className="notification-icon-wrapper">
                <span className="notification-icon">{getNotificationIcon(item.type)}</span>
                {!item.isRead && <span className="notification-unread-dot" />}
              </div>
              <div className="notification-content">
                <div className="notification-title-row">
                  <strong className="notification-title">{item.title}</strong>
                  <span className="notification-time">{formatTime(item.createdAt)}</span>
                </div>
                <p className="notification-body">{item.body}</p>
                {item.type && (
                  <span className={`notification-type-badge badge badge-${
                    item.type === 'connection' || item.type === 'match' ? 'primary' :
                    item.type === 'message' ? 'info' :
                    item.type === 'project' ? 'success' :
                    item.type === 'mentorship' ? 'warning' : 'neutral'
                  }`}>
                    {item.type.replace('_', ' ')}
                  </span>
                )}
              </div>
              <button
                className="notification-delete"
                onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
                title="Remove"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .notifications-page { max-width: 720px; margin: 0 auto; }
        .notifications-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: var(--space-5);
        }
        .notifications-header h1 { font-size: var(--text-3xl); margin-bottom: 2px; }

        .notification-categories {
          display: flex; gap: var(--space-2);
          margin-bottom: var(--space-5);
          overflow-x: auto;
          padding-bottom: var(--space-2);
        }
        .notification-category {
          display: flex; align-items: center; gap: var(--space-2);
          padding: 8px 16px; border-radius: var(--radius-full);
          font-size: var(--text-sm); font-weight: var(--weight-semibold);
          color: var(--text-secondary); background: var(--card);
          border: 1px solid var(--border-light);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .notification-category:hover { border-color: var(--primary-border); color: var(--primary); }
        .notification-category.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary-border); }
        .notification-category-icon { font-size: 14px; }
        .notification-category-count {
          background: var(--text-tertiary); color: var(--text-inverse);
          font-size: 11px; padding: 1px 7px; border-radius: var(--radius-full);
          font-weight: var(--weight-bold);
        }
        .notification-category.active .notification-category-count { background: var(--primary); color: white; }

        .notification-list-card { padding: 0; overflow: hidden; }
        .notification-row {
          display: flex; align-items: flex-start; gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--border-light);
          cursor: pointer; transition: background var(--transition-fast);
          position: relative;
        }
        .notification-row:last-child { border-bottom: none; }
        .notification-row:hover { background: var(--bg-secondary); }
        .notification-row.unread { background: var(--primary-light); }

        .notification-icon-wrapper { position: relative; flex-shrink: 0; }
        .notification-icon {
          width: 40px; height: 40px;
          background: var(--bg-secondary); border-radius: var(--radius-lg);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .notification-unread-dot {
          position: absolute; top: -2px; right: -2px;
          width: 10px; height: 10px; background: var(--primary);
          border-radius: 50%; border: 2px solid var(--card);
        }

        .notification-content { flex: 1; min-width: 0; }
        .notification-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
        .notification-title { font-size: var(--text-base); }
        .notification-time { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; flex-shrink: 0; }
        .notification-body { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px; line-height: var(--leading-relaxed); }
        .notification-type-badge { margin-top: var(--space-2); text-transform: capitalize; }

        .notification-delete {
          flex-shrink: 0; width: 28px; height: 28px;
          border-radius: var(--radius-md); display: flex;
          align-items: center; justify-content: center;
          color: var(--text-tertiary); opacity: 0;
          transition: all var(--transition-fast);
        }
        .notification-row:hover .notification-delete { opacity: 1; }
        .notification-delete:hover { background: var(--danger-light); color: var(--danger); }

        @media (max-width: 768px) {
          .notifications-page { padding-bottom: 80px; }
          .notification-row { padding: var(--space-3) var(--space-4); }
          .notification-delete { opacity: 1; }
          .notification-categories { gap: var(--space-1); }
        }
      `}</style>
    </div>
  );
}
