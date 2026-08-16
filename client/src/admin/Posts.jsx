import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const POST_TYPES = ['', 'post', 'idea', 'achievement', 'project_update', 'article', 'question'];

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const limit = 20;

  useEffect(() => { loadPosts(); }, [page, search, typeFilter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await adminAPI.get('/admin/posts', { params });
      setPosts(res.data.posts);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await adminAPI.delete(`/admin/posts/${id}`);
      toast.success('Post deleted');
      loadPosts();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page page-transition">
      <div className="page-header">
        <div>
          <h1>Posts</h1>
          <p>{total} total posts across the platform</p>
        </div>
        <div className="page-header-stats">
          <span className="stat-chip">{posts.filter(p => p.type === 'post').length} posts</span>
          <span className="stat-chip">{posts.filter(p => p.type === 'idea').length} ideas</span>
          <span className="stat-chip">{posts.filter(p => p.type === 'question').length} questions</span>
        </div>
      </div>

      <div className="filters-row">
        <input className="filter-input" placeholder="Search post content..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {POST_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state"><h3>No posts found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Content</th>
                  <th>Type</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Shares</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="cell-author">
                        <div className="avatar-xs">{p.author?.name?.[0] || '?'}</div>
                        <span>{p.author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="cell-content">{p.content?.length > 80 ? p.content.slice(0, 80) + '...' : p.content}</td>
                    <td><span className="badge badge-type">{p.type}</span></td>
                    <td>{p.likeCount || 0}</td>
                    <td>{p.commentCount || 0}</td>
                    <td>{p.shareCount || 0}</td>
                    <td className="cell-date">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedPost(p)}>View</button>
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => deletePost(p.id)}>Delete</button>
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

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post Details</h2>
              <button className="modal-close" onClick={() => setSelectedPost(null)}>✕</button>
            </div>
            <div className="post-detail">
              <div className="post-detail-author">
                <div className="avatar-md">{selectedPost.author?.name?.[0] || '?'}</div>
                <div>
                  <strong>{selectedPost.author?.name || 'Unknown'}</strong>
                  <span>{selectedPost.author?.email || ''}</span>
                </div>
                <span className="badge badge-type">{selectedPost.type}</span>
              </div>
              <div className="post-detail-content">
                <p>{selectedPost.content}</p>
              </div>
              {selectedPost.hashtags?.length > 0 && (
                <div className="post-detail-tags">
                  {selectedPost.hashtags.map(t => <span key={t}>#{t}</span>)}
                </div>
              )}
              {selectedPost.mediaUrls?.length > 0 && (
                <div className="post-detail-media">
                  {selectedPost.mediaUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Media ${i}`} />
                  ))}
                </div>
              )}
              <div className="post-detail-stats">
                <span>❤️ {selectedPost.likeCount || 0} likes</span>
                <span>💬 {selectedPost.commentCount || 0} comments</span>
                <span>🔄 {selectedPost.shareCount || 0} shares</span>
                <span>📅 {new Date(selectedPost.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => { deletePost(selectedPost.id); setSelectedPost(null); }}>Delete Post</button>
              <button className="btn btn-secondary" onClick={() => setSelectedPost(null)}>Close</button>
            </div>
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
        .cell-content { max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-light); font-size: 13px; }
        .cell-date { white-space: nowrap; color: var(--text-light); font-size: 13px; }
        .cell-actions { display: flex; gap: 4px; }
        .btn-ghost { background: transparent; color: var(--primary); font-weight: 600; }
        .btn-ghost:hover { background: rgba(239,68,68,0.08); }
        .btn-danger-ghost { background: transparent; color: var(--danger); font-weight: 600; }
        .btn-danger-ghost:hover { background: rgba(225,112,85,0.08); }
        .badge-type { background: rgba(239,68,68,0.08); color: #EF4444; text-transform: capitalize; }
        .avatar-xs { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .avatar-md { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700; flex-shrink: 0; }
        .modal-lg { max-width: 640px; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .modal-close { background: none; border: none; font-size: 20px; color: var(--text-light); cursor: pointer; }
        .post-detail { display: flex; flex-direction: column; gap: 16px; }
        .post-detail-author { display: flex; align-items: center; gap: 12px; }
        .post-detail-author strong { display: block; font-size: 15px; }
        .post-detail-author span { font-size: 13px; color: var(--text-light); }
        .post-detail-content { background: var(--bg); padding: 16px; border-radius: var(--radius-sm); line-height: 1.7; font-size: 15px; }
        .post-detail-tags { display: flex; flex-wrap: wrap; gap: 8px; color: var(--primary); font-weight: 600; font-size: 14px; }
        .post-detail-media { display: flex; gap: 12px; flex-wrap: wrap; }
        .post-detail-media img { max-width: 200px; border-radius: var(--radius-sm); }
        .post-detail-stats { display: flex; gap: 20px; color: var(--text-light); font-size: 14px; border-top: 1px solid var(--border); padding-top: 16px; }
      `}</style>
    </div>
  );
}
