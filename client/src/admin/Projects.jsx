import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['', 'open', 'in_progress', 'completed', 'cancelled'];
const STAGES = ['idea', 'prototype', 'mvp', 'beta', 'launched', 'scaling'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState(null);

  const limit = 20;

  useEffect(() => { loadProjects(); }, [page, search, statusFilter]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.get('/admin/projects', { params });
      setProjects(res.data.projects);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, data) => {
    try {
      await adminAPI.put(`/admin/projects/${id}`, data);
      toast.success('Project updated');
      loadProjects();
      setEditProject(null);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await adminAPI.delete(`/admin/projects/${id}`);
      toast.success('Project deleted');
      loadProjects();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusColor = (s) => {
    const map = { open: 'badge-success', in_progress: 'badge-info', completed: 'badge-primary', cancelled: 'badge-danger' };
    return map[s] || 'badge-warning';
  };

  return (
    <div className="page page-transition">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>{total} total projects</p>
        </div>
        <div className="page-header-stats">
          <span className="stat-chip">{projects.filter(p => p.status === 'open').length} open</span>
          <span className="stat-chip">{projects.filter(p => p.status === 'in_progress').length} in progress</span>
        </div>
      </div>

      <div className="filters-row">
        <input className="filter-input" placeholder="Search projects..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state"><h3>No projects found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Author</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Members</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: 14 }}>{p.title}</strong>
                        {p.tagline && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{p.tagline}</div>}
                      </div>
                    </td>
                    <td>
                      <div className="cell-author">
                        <div className="avatar-xs">{p.author?.name?.[0] || '?'}</div>
                        <span>{p.author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{p.stage}</span></td>
                    <td><span className={`badge ${statusColor(p.status)}`}>{p.status?.replace('_', ' ')}</span></td>
                    <td>{p.memberCount || 0}</td>
                    <td className="cell-date">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditProject(p)}>Edit</button>
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => deleteProject(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {editProject && (
        <div className="modal-overlay" onClick={() => setEditProject(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Project</h2>
              <button className="modal-close" onClick={() => setEditProject(null)}>✕</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const form = e.target;
              updateProject(editProject.id, {
                title: form.title.value,
                tagline: form.tagline.value,
                description: form.description.value,
                status: form.status.value,
                stage: form.stage.value,
              });
            }}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" defaultValue={editProject.title} required />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input name="tagline" defaultValue={editProject.tagline || ''} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={editProject.description || ''} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={editProject.status}>
                    {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stage</label>
                  <select name="stage" defaultValue={editProject.stage}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditProject(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--text-light); font-size: 14px; margin-top: 2px; }
        .page-header-stats { display: flex; gap: 8px; }
        .stat-chip { padding: 6px 14px; border-radius: 20px; background: var(--card); font-size: 13px; font-weight: 600; color: var(--text-light); }
        .filters-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .filter-input { flex: 1; max-width: 360px; padding: 10px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--card); }
        .filter-select { padding: 10px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--card); min-width: 150px; }
        .cell-author { display: flex; align-items: center; gap: 8px; }
        .cell-date { white-space: nowrap; color: var(--text-light); font-size: 13px; }
        .cell-actions { display: flex; gap: 4px; }
        .avatar-xs { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .btn-ghost { background: transparent; color: var(--primary); font-weight: 600; font-size: 13px; }
        .btn-ghost:hover { background: rgba(239,68,68,0.08); }
        .btn-danger-ghost { background: transparent; color: var(--danger); font-weight: 600; font-size: 13px; }
        .btn-danger-ghost:hover { background: rgba(225,112,85,0.08); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .modal-close { background: none; border: none; font-size: 20px; color: var(--text-light); cursor: pointer; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-lg { max-width: 600px; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-success { background: rgba(0,184,148,0.1); color: #00b894; }
        .badge-info { background: rgba(52,152,219,0.1); color: #3498db; }
        .badge-primary { background: rgba(239,68,68,0.1); color: var(--primary); }
        .badge-danger { background: rgba(225,112,85,0.1); color: var(--danger); }
        .badge-warning { background: rgba(253,203,110,0.2); color: #b8860b; }
      `}</style>
    </div>
  );
}
