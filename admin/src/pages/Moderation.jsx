import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Moderation() {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { loadData(); }, [tab, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'reports') {
        const res = await api.get('/admin/reports', { params: { page, limit: 20, status: 'pending' } });
        setReports(res.data.reports);
      } else {
        const res = await api.get('/admin/flagged-messages', { params: { page, limit: 20 } });
        setMessages(res.data.messages);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (id, status, actionTaken) => {
    try {
      await api.put(`/admin/reports/${id}`, { status, actionTaken, resolution: `Action: ${actionTaken}` });
      toast.success(`Report ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to resolve report');
    }
  };

  const moderateMessage = async (id, action) => {
    try {
      await api.put(`/admin/messages/${id}/moderate`, { action });
      toast.success(`Message ${action}d`);
      loadData();
    } catch (err) {
      toast.error('Moderation failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="moderation-page page-transition">
      <div className="page-header">
        <h1>Content Moderation</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>Reports ({reports.length})</button>
        <button className={`tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>Flagged Messages ({messages.length})</button>
      </div>

      {tab === 'reports' ? (
        <div className="card">
          {reports.length === 0 ? (
            <div className="empty-state"><h3>No pending reports</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Reporter</th><th>Reported</th><th>Reason</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r._id}>
                      <td>{r.reporter?.name || 'Unknown'}</td>
                      <td>{r.reported?.name || 'Unknown'}</td>
                      <td><span className="badge badge-warning">{r.reason}</span></td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => resolveReport(r._id, 'resolved', 'warn')}>Warn</button>
                          <button className="btn btn-danger btn-sm" onClick={() => resolveReport(r._id, 'resolved', 'ban')}>Ban</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => resolveReport(r._id, 'dismissed', 'none')}>Dismiss</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {messages.length === 0 ? (
            <div className="empty-state"><h3>No flagged messages</h3></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Sender</th><th>Content</th><th>Reason</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m._id}>
                      <td>{m.sender?.name || 'Unknown'}</td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.content}</td>
                      <td><span className="badge badge-warning">{m.flagReason}</span></td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => moderateMessage(m._id, 'approve')}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => moderateMessage(m._id, 'delete')}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
