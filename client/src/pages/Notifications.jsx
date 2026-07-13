import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationAPI } from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      toast.success('Notifications marked as read');
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

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="notifications-page page-transition">
      <div className="page-header notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount} unread alerts</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={markAllAsRead} disabled={unreadCount === 0}>Mark all read</button>
      </div>

      <div className="card notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications</h3>
            <p>Messages, matches, admin announcements, and reminders will appear here.</p>
          </div>
        ) : notifications.map(item => (
          <button
            key={item.id}
            className={`notification-row ${item.isRead ? '' : 'unread'}`}
            onClick={() => !item.isRead && markAsRead(item.id)}
          >
            <span className="notification-dot" />
            <span className="notification-body">
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </span>
            <span className="notification-type">{item.type?.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      <style>{`
        .notifications-page { max-width: 760px; margin: 0 auto; }
        .notifications-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .notifications-list { padding: 0; overflow: hidden; }
        .notification-row { width: 100%; display: grid; grid-template-columns: 10px 1fr auto; align-items: center; gap: 14px; padding: 18px 20px; background: transparent; text-align: left; border-bottom: 1px solid var(--border); color: var(--text); }
        .notification-row:last-child { border-bottom: 0; }
        .notification-row:hover { background: var(--bg); }
        .notification-row.unread { background: rgba(74,108,247,0.06); }
        .notification-dot { width: 9px; height: 9px; border-radius: 50%; background: transparent; }
        .notification-row.unread .notification-dot { background: var(--primary); }
        .notification-body { min-width: 0; }
        .notification-body strong, .notification-body span { display: block; }
        .notification-body span { color: var(--text-light); font-size: 14px; }
        .notification-type { color: var(--text-light); font-size: 12px; text-transform: capitalize; }
        @media (max-width: 768px) { .notifications-page { padding-bottom: 78px; } .notification-row { grid-template-columns: 10px 1fr; } .notification-type { display: none; } }
      `}</style>
    </div>
  );
}
