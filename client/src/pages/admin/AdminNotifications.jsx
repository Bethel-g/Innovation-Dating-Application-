import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'custom', targetAudience: {}, schedule: { sendAt: '', frequency: 'once' } });

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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1>Notifications</h1><p>Manage campaigns</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>New Campaign</button>
      </div>
      <div className="card">
        {loading ? <div className="empty-state"><div className="spinner" /></div> : campaigns.length === 0
          ? <div className="empty-state"><h3>No campaigns</h3></div>
          : <div className="table-wrapper"><table><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Sent</th><th>Actions</th></tr></thead><tbody>
            {campaigns.map(c => <tr key={c._id}>
              <td>{c.title}</td>
              <td><span className="badge badge-info">{c.type}</span></td>
              <td><span className={`badge ${c.status === 'sent' ? 'badge-success' : c.status === 'scheduled' ? 'badge-warning' : 'badge-info'}`}>{c.status}</span></td>
              <td>{c.sentCount}</td>
              <td>{c.status === 'draft' && <button className="btn btn-primary btn-sm" onClick={() => sendCampaign(c._id)}>Send</button>}</td>
            </tr>)}
          </tbody></table></div>}
      </div>
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
          <h2>Create Campaign</h2>
          <form onSubmit={createCampaign}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Body</label><textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={3} /></div>
            <div className="modal-actions"><button type="submit" className="btn btn-primary">Create</button><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}
