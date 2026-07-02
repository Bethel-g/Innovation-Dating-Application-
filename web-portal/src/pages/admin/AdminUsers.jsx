import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 20, search } });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deactivated');
      loadUsers();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="page-header"><h1>User Management</h1><p>{total} users</p></div>
      <div className="search-bar"><input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
      <div className="card">
        {loading ? <div className="empty-state"><div className="spinner" /></div>
          : users.length === 0 ? <div className="empty-state"><h3>No users found</h3></div>
          : <div className="table-wrapper"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
            {users.map(u => <tr key={u._id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar-sm">{u.name?.[0]}</div>{u.name}</div></td>
              <td>{u.email}</td>
              <td><span className="badge badge-info">{u.role}</span></td>
              <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => deactivateUser(u._id)}>Deactivate</button></td>
            </tr>)}
          </tbody></table></div>}
        {totalPages > 1 && <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>}
      </div>
    </div>
  );
}
