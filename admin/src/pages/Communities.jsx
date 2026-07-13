import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editCommunity, setEditCommunity] = useState(null);

  const limit = 20;

  useEffect(() => { loadCommunities(); }, [page, search]);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/communities', { params: { page, limit, search } });
      setCommunities(res.data.communities);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const updateCommunity = async (id, data) => {
    try {
      await api.put(`/admin/communities/${id}`, data);
      toast.success('Community updated');
      loadCommunities();
      setEditCommunity(null);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteCommunity = async (id) => {
    if (!window.confirm('Delete this community and all its members?')) return;
    try {
      await api.delete(`/admin/communities/${id}`);
      toast.success('Community deleted');
      loadCommunities();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page page-transition">
      <div className="page-header">
        <div>
          <h1>Communities</h1>
          <p>{total} total communities</p>
        </div>
      </div>

      <div className="filters-row">
        <input className="filter-input" placeholder="Search communities..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : communities.length === 0 ? (
          <div className="empty-state"><h3>No communities found</h3></div>
        ) : communities.map(c => (
          <div key={c.id} className="community-card card">
            <div className="community-card-header">
              <div className="community-icon">{c.name?.[0] || 'C'}</div>
              <div className="community-info">
                <strong>{c.name}</strong>
                <span>{c.memberCount || 0} members · {c.visibility}</span>
              </div>
              <span className={`badge ${c.isVerified ? 'badge-success' : 'badge-warning'}`}>
                {c.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <p className="community-desc">{c.description?.slice(0, 120)}</p>
            <div className="community-tags">
              {c.tags?.slice(0, 4).map(t => <span key={t}>{t}</span>)}
              {c.tags?.length > 4 && <span>+{c.tags.length - 4}</span>}
            </div>
            <div className="community-card-footer">
              <span className="community-author">by {c.author?.name || 'Unknown'}</span>
              <div className="community-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => setEditCommunity(c)}>Edit</button>
                <button className="btn btn-sm btn-danger-ghost" onClick={() => deleteCommunity(c.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 20 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {editCommunity && (
        <div className="modal-overlay" onClick={() => setEditCommunity(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Community</h2>
              <button className="modal-close" onClick={() => setEditCommunity(null)}>✕</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const form = e.target;
              updateCommunity(editCommunity.id, {
                name: form.name.value,
                description: form.description.value,
                visibility: form.visibility.value,
                isVerified: form.isVerified.checked,
              });
            }}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" defaultValue={editCommunity.name} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={editCommunity.description} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Visibility</label>
                  <select name="visibility" defaultValue={editCommunity.visibility}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                    <input type="checkbox" name="isVerified" defaultChecked={editCommunity.isVerified} />
                    Verified
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditCommunity(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--text-light); font-size: 14px; margin-top: 2px; }
        .filters-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .filter-input { flex: 1; max-width: 360px; padding: 10px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--card); }
        .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .community-card { display: flex; flex-direction: column; gap: 12px; padding: 20px; }
        .community-card-header { display: flex; align-items: center; gap: 12px; }
        .community-icon { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700; flex-shrink: 0; }
        .community-info { flex: 1; min-width: 0; }
        .community-info strong { display: block; font-size: 15px; }
        .community-info span { font-size: 13px; color: var(--text-light); }
        .community-desc { color: var(--text-light); font-size: 14px; line-height: 1.5; }
        .community-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .community-tags span { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; background: var(--bg); color: var(--text-light); }
        .community-card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 12px; }
        .community-author { font-size: 12px; color: var(--text-light); }
        .community-actions { display: flex; gap: 4px; }
        .btn-ghost { background: transparent; color: var(--primary); font-weight: 600; font-size: 13px; }
        .btn-ghost:hover { background: rgba(239,68,68,0.08); }
        .btn-danger-ghost { background: transparent; color: var(--danger); font-weight: 600; font-size: 13px; }
        .btn-danger-ghost:hover { background: rgba(225,112,85,0.08); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .modal-close { background: none; border: none; font-size: 20px; color: var(--text-light); cursor: pointer; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      `}</style>
    </div>
  );
}
