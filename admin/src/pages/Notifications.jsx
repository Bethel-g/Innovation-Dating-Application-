import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', type: 'custom',
    targetAudience: {
      skills: [], experienceRange: { min: 0, max: 30 },
      subscriptionTier: [], industries: [], isVerified: undefined,
      location: { city: '', country: '' },
    },
    schedule: { sendAt: '', frequency: 'once' },
  });

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    try {
      const res = await api.get('/admin/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/campaigns', form);
      toast.success('Campaign created!');
      setShowCreate(false);
      loadCampaigns();
      setForm({
        title: '', body: '', type: 'custom',
        targetAudience: { skills: [], experienceRange: { min: 0, max: 30 }, subscriptionTier: [], industries: [], isVerified: undefined, location: { city: '', country: '' } },
        schedule: { sendAt: '', frequency: 'once' },
      });
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  const sendCampaign = async (id) => {
    try {
      await api.post(`/admin/campaigns/${id}/send`);
      toast.success('Campaign sent!');
      loadCampaigns();
    } catch (err) {
      toast.error('Failed to send campaign');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="notifications-page page-transition">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Notification Campaigns</h1>
          <p>Create and manage push notification campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>New Campaign</button>
      </div>

      <div className="card">
        {campaigns.length === 0 ? (
          <div className="empty-state">
            <h3>No campaigns yet</h3>
            <p>Create your first notification campaign</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Status</th><th>Sent</th><th>Opened</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td><span className="badge badge-info">{c.type}</span></td>
                    <td><span className={`badge ${c.status === 'sent' ? 'badge-success' : c.status === 'scheduled' ? 'badge-warning' : c.status === 'draft' ? 'badge-info' : ''}`}>{c.status}</span></td>
                    <td>{c.sentCount}</td>
                    <td>{c.openedCount}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      {c.status === 'draft' && (
                        <button className="btn btn-primary btn-sm" onClick={() => sendCampaign(c.id)}>Send</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2>Create Campaign</h2>
            <form onSubmit={createCampaign}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Campaign title" />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={3} placeholder="Notification message" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="custom">Custom</option>
                  <option value="promotional">Promotional</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="form-group">
                <label>Send At</label>
                <input type="datetime-local" value={form.schedule.sendAt} onChange={e => setForm({ ...form, schedule: { ...form.schedule, sendAt: e.target.value } })} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create Campaign</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
