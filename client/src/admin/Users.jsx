import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [roleForm, setRoleForm] = useState({ role: 'member', permissions: [] });
  const [roleDefs, setRoleDefs] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const limit = 20;

  useEffect(() => { loadUsers(); }, [page, search]);
  useEffect(() => {
    adminAPI.getRoles().then(res => setRoleDefs(res.data)).catch(() => {});
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ params: { page, limit, search, sort: sortField, order: sortDir } });
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
      const res = await adminAPI.getUser(id);
      setSelectedUser(res.data);
      setRoleForm({ role: res.data.user.role || 'member', permissions: res.data.user.permissions || [] });
      setShowDetail(true);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const updateUser = async (id, updates) => {
    try {
      await adminAPI.updateUser(id, updates);
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
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deactivated');
      loadUsers();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const totalPages = Math.ceil(total / limit);

  const filteredUsers = users.filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'staff') return ['admin', 'moderator', 'support'].includes(u.role);
    if (activeTab === 'verified') return u.isVerified;
    if (activeTab === 'inactive') return !u.isActive;
    return true;
  });

  const togglePermission = (permission) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(item => item !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const saveAccess = async () => {
    if (!selectedUser?.user?.id) return;
    try {
      await adminAPI.updateUserRole(selectedUser.user.id, { role: roleForm.role, permissions: roleForm.permissions });
      toast.success('Role & permissions updated');
      setSelectedUser(prev => ({ ...prev, user: { ...prev.user, role: roleForm.role, permissions: roleForm.permissions } }));
      loadUsers();
    } catch (err) {
      toast.error('Failed to update access');
    }
  };

  return (
    <div className="admin-users page-transition">
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p className="text-secondary">{total} total users registered on the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { id: 'all', label: 'All Users' },
          { id: 'staff', label: 'Staff' },
          { id: 'verified', label: 'Verified' },
          { id: 'inactive', label: 'Inactive' },
        ].map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setPage(1); }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Bulk Actions */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="text-sm text-secondary">{selectedUsers.length} selected</span>
            <button className="btn btn-secondary btn-sm">Export CSV</button>
            <button className="btn btn-danger btn-sm">Deactivate</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card admin-table-card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p style={{ marginTop: 12 }}>Loading users...</p></div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    User {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Email</th>
                  <th className="sortable" onClick={() => handleSort('role')}>
                    Role {sortField === 'role' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th className="sortable" onClick={() => handleSort('createdAt')}>
                    Joined {sortField === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={selectedUsers.includes(u.id) ? 'selected' : ''}>
                    <td className="td-checkbox">
                      <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} />
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar avatar-sm">
                          {u.name?.[0]}
                          {u.isOnline && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--card)' }} />}
                        </div>
                        <div className="user-cell-info">
                          <strong>{u.name}</strong>
                          {u.headline && <span className="text-xs text-secondary">{u.headline}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-secondary">{u.email}</td>
                    <td>
                      <span className={`badge ${['admin', 'moderator', 'support'].includes(u.role) ? 'badge-primary' : 'badge-neutral'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div className="skills-cell">
                        {u.skills?.slice(0, 2).map(s => <span key={s} className="tag-skill">{s}</span>)}
                        {u.skills?.length > 2 && <span className="text-xs text-tertiary">+{u.skills.length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-sm text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-cell">
                        <button className="btn btn-ghost btn-sm" onClick={() => viewUser(u.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Manage
                        </button>
                        <button className="btn btn-ghost btn-sm text-danger" onClick={() => deactivateUser(u.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <span className="text-sm text-secondary">Page {page} of {totalPages} ({total} users)</span>
            <div className="pagination-buttons">
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
              <h2>Manage User</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowDetail(false)}>✕</button>
            </div>

            <div className="user-detail-header">
              <div className="avatar avatar-xl">
                {selectedUser.user.name?.[0]}
              </div>
              <div>
                <h3>{selectedUser.user.name}</h3>
                <p className="text-secondary">{selectedUser.user.email}</p>
                {selectedUser.user.headline && <p className="text-sm text-secondary">{selectedUser.user.headline}</p>}
              </div>
            </div>

            <div className="user-detail-stats">
              <div className="user-detail-stat">
                <strong>{selectedUser.matches || 0}</strong>
                <span>Matches</span>
              </div>
              <div className="user-detail-stat">
                <strong>{selectedUser.reports?.length || 0}</strong>
                <span>Reports</span>
              </div>
              <div className="user-detail-stat">
                <strong className="text-capitalize">{selectedUser.user.subscriptionTier || 'free'}</strong>
                <span>Plan</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <div className="flex gap-2">
                  <button className={`btn btn-sm ${selectedUser.user.isActive ? 'btn-success' : 'btn-secondary'}`} onClick={() => updateUser(selectedUser.user.id, { isActive: true })}>Active</button>
                  <button className={`btn btn-sm ${!selectedUser.user.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => updateUser(selectedUser.user.id, { isActive: false })}>Inactive</button>
                </div>
              </div>
              <div className="form-group">
                <label>Verification</label>
                <div className="flex gap-2">
                  <button className={`btn btn-sm ${selectedUser.user.isVerified ? 'btn-success' : 'btn-secondary'}`} onClick={() => updateUser(selectedUser.user.id, { isVerified: true })}>Verified</button>
                  <button className={`btn btn-sm ${!selectedUser.user.isVerified ? 'btn-secondary' : 'btn-secondary'}`} onClick={() => updateUser(selectedUser.user.id, { isVerified: false })}>Unverified</button>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>Role & Permissions</h4>
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
                {Object.entries(roleDefs?.roles || {}).map(([key, val]) => (
                  <button key={key} className={`badge badge-lg cursor-pointer ${roleForm.role === key ? 'badge-primary' : 'badge-neutral'}`}
                    onClick={() => setRoleForm({ role: key, permissions: [...(roleDefs.roles[key].permissions || [])] })}>
                    {val.label || key}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Custom Role</label>
                <select className="select" value={roleForm.role} onChange={e => setRoleForm(prev => ({ ...prev, role: e.target.value }))}>
                  <option value="member">Member</option>
                  <option value="support">Support</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {roleDefs?.availablePermissions?.map(permission => (
                    <label key={permission} className={`badge cursor-pointer ${roleForm.permissions.includes(permission) ? 'badge-primary' : 'badge-neutral'}`}>
                      <input type="checkbox" checked={roleForm.permissions.includes(permission)} onChange={() => togglePermission(permission)} style={{ accentColor: 'var(--primary)' }} />
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
        .admin-users { max-width: 1200px; margin: 0 auto; }
        .admin-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5); }
        .admin-page-header h1 { font-size: var(--text-3xl); }

        .admin-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-5); }
        .admin-tabs .tab { flex: none; padding: 8px 16px; border-radius: var(--radius-full); background: var(--card); border: 1px solid var(--border-light); font-size: var(--text-sm); }
        .admin-tabs .tab.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary-border); }

        .admin-toolbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-4); }
        .admin-search { display: flex; align-items: center; gap: var(--space-2); flex: 1; max-width: 400px; padding: 8px 14px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-md); }
        .admin-search svg { color: var(--text-tertiary); flex-shrink: 0; }
        .admin-search input { flex: 1; border: none; background: none; font-size: var(--text-sm); color: var(--text); outline: none; }
        .bulk-actions { display: flex; align-items: center; gap: var(--space-3); }

        .admin-table-card { padding: 0; overflow: hidden; }
        .admin-table-wrapper { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th {
          text-align: left; padding: 12px 16px;
          font-size: var(--text-xs); font-weight: var(--weight-semibold);
          color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;
          border-bottom: 2px solid var(--border-light);
          background: var(--bg-secondary);
        }
        .admin-table th.sortable { cursor: pointer; user-select: none; }
        .admin-table th.sortable:hover { color: var(--primary); }
        .admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-light); font-size: var(--text-sm); }
        .admin-table tr:hover { background: var(--bg-secondary); }
        .admin-table tr.selected { background: var(--primary-light); }
        .th-checkbox, .td-checkbox { width: 40px; text-align: center; }
        .th-checkbox input, .td-checkbox input { accent-color: var(--primary); }

        .user-cell { display: flex; align-items: center; gap: var(--space-3); }
        .user-cell-info { display: flex; flex-direction: column; }
        .skills-cell { display: flex; gap: 4px; flex-wrap: wrap; }
        .action-cell { display: flex; gap: 4px; }

        .text-danger { color: var(--danger) !important; }
        .text-capitalize { text-transform: capitalize; }
        .cursor-pointer { cursor: pointer; }

        .admin-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--border-light);
        }
        .pagination-buttons { display: flex; gap: var(--space-2); }

        .user-detail-header {
          display: flex; align-items: center; gap: var(--space-4);
          padding: var(--space-4); background: var(--bg-secondary);
          border-radius: var(--radius-lg); margin-bottom: var(--space-4);
        }
        .user-detail-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3); margin-bottom: var(--space-4);
        }
        .user-detail-stat {
          text-align: center; padding: var(--space-3);
          background: var(--bg-secondary); border-radius: var(--radius-md);
        }
        .user-detail-stat strong { display: block; font-size: var(--text-lg); }
        .user-detail-stat span { font-size: var(--text-xs); color: var(--text-secondary); }

        @media (max-width: 768px) {
          .admin-toolbar { flex-direction: column; align-items: stretch; }
          .admin-search { max-width: none; }
          .admin-table th:nth-child(n+5), .admin-table td:nth-child(n+5) { display: none; }
        }
      `}</style>
    </div>
  );
}
