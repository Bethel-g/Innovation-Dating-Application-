import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const limit = 20;

  useEffect(() => { loadComments(); }, [page, search, flaggedOnly]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (flaggedOnly) params.isFlagged = 'true';
      const res = await adminAPI.get('/admin/comments', { params });
      setComments(res.data.comments);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await adminAPI.delete(`/admin/comments/${id}`);
      toast.success('Comment deleted');
      loadComments();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page page-transition">
      <div className="page-header">
        <div>
          <h1>Comments</h1>
          <p>{total} total comments · {comments.filter(c => c.isFlagged).length} flagged</p>
        </div>
      </div>

      <div className="filters-row">
        <input className="filter-input" placeholder="Search comments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <label className="filter-toggle">
          <input type="checkbox" checked={flaggedOnly} onChange={e => { setFlaggedOnly(e.target.checked); setPage(1); }} />
          <span>Flagged only</span>
        </label>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : comments.length === 0 ? (
          <div className="empty-state"><h3>No comments found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Comment</th>
                  <th>Post ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="cell-author">
                        <div className="avatar-xs">{c.author?.name?.[0] || '?'}</div>
                        <span>{c.author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="cell-content">{c.content?.length > 100 ? c.content.slice(0, 100) + '...' : c.content}</td>
                    <td className="cell-mono">{c.post?.slice(0, 8)}...</td>
                    <td>{c.isFlagged ? <span className="badge badge-danger">Flagged</span> : <span className="badge badge-success">Clean</span>}</td>
                    <td className="cell-date">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="cell-actions">
                        {c.isFlagged && (
                          <button className="btn btn-sm btn-ghost" onClick={async () => {
                            try {
                              await adminAPI.put(`/admin/comments/${c.id}`, { isFlagged: false });
                              toast.success('Comment approved');
                              loadComments();
                            } catch { toast.error('Failed'); }
                          }}>Approve</button>
                        )}
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => deleteComment(c.id)}>Delete</button>
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

      <style>{`
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--text-light); font-size: 14px; margin-top: 2px; }
        .filters-row { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
        .filter-input { flex: 1; max-width: 360px; padding: 10px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--card); }
        .filter-toggle { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--card); cursor: pointer; font-size: 14px; font-weight: 500; }
        .filter-toggle input { accent-color: var(--primary); }
        .cell-author { display: flex; align-items: center; gap: 8px; }
        .cell-content { max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-light); font-size: 13px; }
        .cell-mono { font-family: monospace; font-size: 12px; color: var(--text-light); }
        .cell-date { white-space: nowrap; color: var(--text-light); font-size: 13px; }
        .cell-actions { display: flex; gap: 4px; }
        .avatar-xs { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .btn-ghost { background: transparent; color: var(--primary); font-weight: 600; font-size: 13px; }
        .btn-ghost:hover { background: rgba(239,68,68,0.08); }
        .btn-danger-ghost { background: transparent; color: var(--danger); font-weight: 600; font-size: 13px; }
        .btn-danger-ghost:hover { background: rgba(225,112,85,0.08); }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-success { background: rgba(0,184,148,0.1); color: #00b894; }
        .badge-danger { background: rgba(225,112,85,0.1); color: var(--danger); }
      `}</style>
    </div>
  );
}
