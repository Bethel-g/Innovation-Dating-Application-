import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const limit = 20;

  useEffect(() => { loadUsers(); }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit, search } });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data);
      setShowDetail(true);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const updateUser = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      loadUsers();
      if (selectedUser?.user._id === id) {
        setSelectedUser(prev => ({ ...prev, user: { ...prev.user, ...updates } }));
      }
    } catch (err) {
      toast.error('Update failed');
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="users-page page-transition">
      <div className="page-header">
        <h1>User Management</h1>
        <p>{total} total users</p>
      </div>

      <div className="search-bar">
        <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><h3>No users found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Tier</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar-sm">{u.name?.[0]}</div>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td><span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>{u.isVerified ? 'Verified' : 'Unverified'}</span></td>
                    <td><span className="badge badge-info">{u.subscriptionTier}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => viewUser(u._id)}>View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deactivateUser(u._id)}>Deactivate</button>
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

      {showDetail && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>User Details</h2>
            <div className="user-detail-info">
              <p><strong>Name:</strong> {selectedUser.user.name}</p>
              <p><strong>Email:</strong> {selectedUser.user.email}</p>
              <p><strong>Status:</strong> {selectedUser.user.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Verified:</strong> {selectedUser.user.isVerified ? 'Yes' : 'No'}</p>
              <p><strong>Tier:</strong> {selectedUser.user.subscriptionTier}</p>
              <p><strong>Joined:</strong> {new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
              <p><strong>Matches:</strong> {selectedUser.matches}</p>
              <p><strong>Reports:</strong> {selectedUser.reports?.length || 0}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary btn-sm" onClick={() => updateUser(selectedUser.user._id, { isVerified: !selectedUser.user.isVerified })}>
                {selectedUser.user.isVerified ? 'Unverify' : 'Verify'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
