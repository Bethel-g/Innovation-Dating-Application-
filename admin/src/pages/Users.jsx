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
  const [roleForm, setRoleForm] = useState({ role: 'member', permissions: [] });
  const [roleDefs, setRoleDefs] = useState(null);

  const limit = 20;

  useEffect(() => { loadUsers(); }, [page, search]);

  useEffect(() => {
    api.get('/admin/roles').then(res => setRoleDefs(res.data)).catch(() => {});
  }, []);

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
      setRoleForm({
        role: res.data.user.role || 'member',
        permissions: res.data.user.permissions || [],
      });
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
      if (selectedUser?.user.id === id) {
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

  const togglePermission = (permission) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(item => item !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const applyRolePreset = (role) => {
    if (!roleDefs?.roles?.[role]) return;
    setRoleForm({
      role,
      permissions: [...(roleDefs.roles[role].permissions || [])],
    });
  };

  const saveAccess = async () => {
    if (!selectedUser?.user?.id) return;
    try {
      await api.put(`/admin/users/${selectedUser.user.id}/role`, {
        role: roleForm.role,
        permissions: roleForm.permissions,
      });
      toast.success('Role & permissions updated');
      setSelectedUser(prev => ({ ...prev, user: { ...prev.user, role: roleForm.role, permissions: roleForm.permissions } }));
    } catch (err) {
      toast.error('Failed to update access');
    }
  };

  return (
    <div className="page page-transition">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>{total} total users</p>
        </div>
        <div className="page-header-stats">
          <span className="stat-chip">{users.filter(u => u.role !== 'member').length} staff</span>
          <span className="stat-chip">{users.filter(u => u.isVerified).length} verified</span>
          <span className="stat-chip">{users.filter(u => !u.isActive).length} inactive</span>
        </div>
      </div>

      <div className="filters-row">
        <input className="filter-input" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
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
                  <th>Role</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-author">
                        <div className="avatar-xs">{u.name?.[0]}</div>
                        <div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                          {u.headline && <div className="cell-headline">{u.headline}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="cell-mono">{u.email}</td>
                    <td><span className={`badge badge-role ${u.role !== 'member' ? 'badge-staff' : ''}`}>{u.role}</span></td>
                    <td className="cell-skills">{u.skills?.slice(0, 2).join(', ') || '—'}</td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>{u.isVerified ? <span className="badge badge-success">✓</span> : <span className="badge badge-warning">—</span>}</td>
                    <td className="cell-date">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => viewUser(u.id)}>Manage</button>
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => deactivateUser(u.id)}>Deactivate</button>
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
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage User</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>✕</button>
            </div>

            <div className="user-profile-section">
              <div className="user-profile-avatar">{selectedUser.user.name?.[0]}</div>
              <div className="user-profile-info">
                <strong>{selectedUser.user.name}</strong>
                <span>{selectedUser.user.email}</span>
                <span>{selectedUser.user.headline || 'No headline'}</span>
              </div>
              <div className="user-profile-meta">
                <span>🎯 {selectedUser.matches} matches</span>
                <span>📊 {selectedUser.reports?.length || 0} reports</span>
                <span>⭐ {selectedUser.user.subscriptionTier || 'free'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="form-group">
                <label>Status</label>
                <div className="badge-group">
                  <button className={`badge-btn ${selectedUser.user.isActive ? 'active' : ''}`} onClick={() => updateUser(selectedUser.user.id, { isActive: true })}>Active</button>
                  <button className={`badge-btn ${!selectedUser.user.isActive ? 'active' : ''}`} onClick={() => updateUser(selectedUser.user.id, { isActive: false })}>Inactive</button>
                </div>
              </div>
              <div className="form-group">
                <label>Verification</label>
                <div className="badge-group">
                  <button className={`badge-btn ${selectedUser.user.isVerified ? 'active' : ''}`} onClick={() => updateUser(selectedUser.user.id, { isVerified: true })}>Verified</button>
                  <button className={`badge-btn ${!selectedUser.user.isVerified ? 'active' : ''}`} onClick={() => updateUser(selectedUser.user.id, { isVerified: false })}>Unverified</button>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Role & Permissions</h3>

              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {Object.entries(roleDefs?.roles || {}).map(([key, val]) => (
                  <button
                    key={key}
                    className={`role-preset-btn ${roleForm.role === key ? 'active' : ''}`}
                    onClick={() => applyRolePreset(key)}
                  >
                    {val.label}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Custom Role</label>
                <select value={roleForm.role} onChange={e => setRoleForm(prev => ({ ...prev, role: e.target.value }))}>
                  <option value="member">Member</option>
                  <option value="support">Support</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {roleDefs?.availablePermissions?.map(permission => (
                    <label key={permission} className={`perm-chip ${roleForm.permissions.includes(permission) ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                      />
                      <span>{permission.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-sm" onClick={saveAccess}>Save Role & Permissions</button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>Close</button>
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
        .cell-author { display: flex; align-items: center; gap: 10px; }
        .cell-headline { font-size: 12px; color: var(--text-light); }
        .cell-mono { font-family: monospace; font-size: 13px; color: var(--text-light); }
        .cell-skills { font-size: 13px; color: var(--text-light); max-width: 140px; }
        .cell-date { white-space: nowrap; color: var(--text-light); font-size: 13px; }
        .cell-actions { display: flex; gap: 4px; }
        .avatar-xs { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 600; flex-shrink: 0; }
        .btn-ghost { background: transparent; color: var(--primary); font-weight: 600; font-size: 13px; }
        .btn-ghost:hover { background: rgba(239,68,68,0.08); }
        .btn-danger-ghost { background: transparent; color: var(--danger); font-weight: 600; font-size: 13px; }
        .btn-danger-ghost:hover { background: rgba(225,112,85,0.08); }
        .badge-role { text-transform: capitalize; }
        .badge-staff { background: rgba(239,68,68,0.1); color: var(--primary); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .modal-close { background: none; border: none; font-size: 20px; color: var(--text-light); cursor: pointer; }
        .modal-lg { max-width: 640px; }
        .user-profile-section { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg); border-radius: var(--radius); margin-bottom: 16px; }
        .user-profile-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 700; flex-shrink: 0; }
        .user-profile-info { flex: 1; min-width: 0; }
        .user-profile-info strong { display: block; font-size: 16px; }
        .user-profile-info span { display: block; font-size: 13px; color: var(--text-light); }
        .user-profile-meta { display: flex; flex-direction: column; gap: 4px; text-align: right; font-size: 13px; color: var(--text-light); }
        .badge-group { display: flex; gap: 6px; }
        .badge-btn { padding: 6px 14px; border-radius: 8px; border: 2px solid var(--border); background: transparent; color: var(--text-light); font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .badge-btn.active { border-color: var(--primary); background: rgba(239,68,68,0.08); color: var(--primary); font-weight: 600; }
        .role-preset-btn { padding: 6px 14px; border-radius: 8px; border: 2px solid var(--border); background: transparent; color: var(--text-light); font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .role-preset-btn.active { border-color: var(--primary); background: rgba(239,68,68,0.08); color: var(--primary); font-weight: 600; }
        .permissions-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .perm-chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; border: 2px solid var(--border); cursor: pointer; transition: all 0.15s; font-size: 13px; }
        .perm-chip.active { border-color: var(--primary); background: rgba(239,68,68,0.06); }
        .perm-chip input { accent-color: var(--primary); }
      `}</style>
    </div>
  );
}
