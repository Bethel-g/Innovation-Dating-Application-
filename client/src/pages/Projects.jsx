import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const KANBAN_COLUMNS = [
  { id: 'backlog', label: 'Backlog', icon: '📋', color: '#6b7280' },
  { id: 'todo', label: 'To Do', icon: '📝', color: '#3b82f6' },
  { id: 'in_progress', label: 'In Progress', icon: '🔨', color: '#f59e0b' },
  { id: 'review', label: 'Review', icon: '👀', color: '#8b5cf6' },
  { id: 'done', label: 'Done', icon: '✅', color: '#22c55e' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#6b7280' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'urgent', label: 'Urgent', color: '#dc2626' },
];

function KanbanTask({ task, onMove, onDelete }) {
  const priority = PRIORITIES.find(p => p.id === task.priority);
  return (
    <div className={`kanban-task ${task.priority || 'medium'}`}>
      <div className="task-header">
        <span className="task-priority" style={{ background: priority?.color || '#6b7280' }}>
          {priority?.label || 'Medium'}
        </span>
        <button className="task-delete" onClick={() => onDelete(task.id)} title="Delete task">✕</button>
      </div>
      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-desc">{task.description}</p>}
      {task.assignee && (
        <div className="task-assignee">
          {task.assignee.photos?.[0]?.url ? (
            <img src={task.assignee.photos[0].url} alt="" className="task-avatar" />
          ) : (
            <div className="avatar-tiny">{task.assignee.name?.[0]}</div>
          )}
          <span>{task.assignee.name}</span>
        </div>
      )}
      <div className="task-move-btns">
        {KANBAN_COLUMNS.map((col, idx) => {
          const currentColIdx = KANBAN_COLUMNS.findIndex(c => c.id === task.status);
          if (idx === currentColIdx) return null;
          if (Math.abs(idx - currentColIdx) > 1) return null;
          return (
            <button
              key={col.id}
              className="task-move-btn"
              onClick={() => onMove(task.id, col.id)}
              title={`Move to ${col.label}`}
              style={{ color: col.color }}
            >
              {idx < currentColIdx ? '←' : '→'} {col.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, onMoveTask, onDeleteTask }) {
  return (
    <div className="kanban-board">
      {KANBAN_COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="kanban-column">
            <div className="kanban-col-header" style={{ borderTopColor: col.color }}>
              <span className="col-icon">{col.icon}</span>
              <span className="col-label">{col.label}</span>
              <span className="col-count">{colTasks.length}</span>
            </div>
            <div className="kanban-col-body">
              {colTasks.map(task => (
                <KanbanTask
                  key={task.id}
                  task={task}
                  onMove={onMoveTask}
                  onDelete={onDeleteTask}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="kanban-empty">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CreateTaskModal({ onClose, onSubmit, members }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assigneeId: '', status: 'backlog' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Task title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Optional description" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Unassigned</option>
                {members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Column</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Task'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { id } = useParams();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data?.projects || res.data || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (projectId) => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectAPI.getById(projectId),
        projectAPI.getTasks?.(projectId) || Promise.resolve({ data: [] }),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data || []);
    } catch (err) {
      toast.error('Failed to load project');
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await projectAPI.updateTask?.(taskId, { status: newStatus }) || Promise.resolve();
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch {
      toast.error('Failed to move task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await projectAPI.deleteTask?.(taskId) || Promise.resolve();
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleCreateTask = async (form) => {
    try {
      const res = await projectAPI.createTask?.({ ...form, projectId: project?.id }) || { data: { id: Date.now(), ...form, status: form.status || 'backlog' } };
      setTasks(prev => [...prev, res.data]);
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (!id) {
    return (
      <div className="projects-page page-transition">
        <div className="page-header">
          <h1>Projects</h1>
          <p>Collaborative workspaces with task management</p>
        </div>

        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map(project => (
              <Link to={`/projects/${project.id}`} key={project.id} className="project-card card">
                <div className="project-card-top">
                  <span className={`project-status status-${project.status || 'open'}`}>
                    {project.status?.replace('_', ' ') || 'Open'}
                  </span>
                  <span className="project-task-count">
                    {project.tasks?.length || 0} tasks
                  </span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description?.substring(0, 120)}{project.description?.length > 120 ? '...' : ''}</p>
                {project.skills?.length > 0 && (
                  <div className="skill-tags">
                    {project.skills.slice(0, 3).map(s => <span key={s} className="tag-skill">{s}</span>)}
                  </div>
                )}
                <div className="project-card-footer">
                  <div className="project-members-mini">
                    {project.members?.slice(0, 3).map(m => (
                      <div key={m.id} className="avatar-tiny" title={m.name}>{m.name?.[0]}</div>
                    ))}
                    {project.members?.length > 3 && <span className="member-more">+{project.members.length - 3}</span>}
                  </div>
                  <span className="project-date">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <h3>No projects yet</h3>
            <p>Create your first collaborative project!</p>
          </div>
        )}

        <style>{`
          .projects-page { max-width: 1000px; margin: 0 auto; }
          .page-header { margin-bottom: 24px; }
          .page-header h1 { font-size: 28px; }
          .page-header p { color: var(--text-light); font-size: 15px; }
          .projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .project-card { padding: 20px; text-decoration: none; color: inherit; transition: all 0.2s; }
          .project-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
          .project-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .project-status { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 500; text-transform: capitalize; }
          .status-open { background: #d1fae5; color: #059669; }
          .status-in_progress { background: #fef3c7; color: #d97706; }
          .status-completed { background: #dbeafe; color: #2563eb; }
          .project-task-count { font-size: 12px; color: var(--text-light); }
          .project-card h3 { font-size: 18px; margin-bottom: 8px; }
          .project-card p { font-size: 14px; color: var(--text-light); line-height: 1.5; margin-bottom: 12px; }
          .project-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
          .project-members-mini { display: flex; }
          .avatar-tiny { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 600; border: 2px solid var(--card); margin-left: -6px; }
          .avatar-tiny:first-child { margin-left: 0; }
          .member-more { font-size: 11px; color: var(--text-light); margin-left: 6px; }
          .project-date { font-size: 12px; color: var(--text-light); }
          .empty-icon { font-size: 48px; margin-bottom: 12px; }
          .empty-state { text-align: center; padding: 60px 20px; }
          .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
          .empty-state p { color: var(--text-light); }
          @media (max-width: 768px) { .projects-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="project-workspace page-transition">
      {project ? (
        <>
          <div className="workspace-header">
            <Link to="/projects" className="back-link">← Back to Projects</Link>
            <div className="workspace-title-row">
              <h1>{project.title}</h1>
              <span className={`project-status status-${project.status || 'open'}`}>
                {project.status?.replace('_', ' ') || 'Open'}
              </span>
            </div>
            <p className="workspace-desc">{project.description}</p>
          </div>

          <div className="workspace-tabs">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'kanban', label: 'Kanban Board', icon: '📋' },
              { id: 'team', label: 'Team', icon: '👥' },
              { id: 'activity', label: 'Activity', icon: '📈' },
            ].map(tab => (
              <button key={tab.id} className={`workspace-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="workspace-overview">
              <div className="overview-grid">
                <div className="overview-card card">
                  <h3>Tasks</h3>
                  <div className="overview-stat">{tasks.length}</div>
                  <div className="overview-breakdown">
                    {KANBAN_COLUMNS.map(col => (
                      <div key={col.id} className="breakdown-item">
                        <span className="breakdown-dot" style={{ background: col.color }} />
                        <span>{col.label}</span>
                        <span className="breakdown-count">{tasks.filter(t => t.status === col.id).length}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overview-card card">
                  <h3>Team</h3>
                  <div className="overview-stat">{project.members?.length || 0}</div>
                  <div className="team-avatars">
                    {project.members?.map(m => (
                      <div key={m.id} className="team-member-mini">
                        {m.photos?.[0]?.url ? (
                          <img src={m.photos[0].url} alt="" />
                        ) : (
                          <div className="avatar-tiny">{m.name?.[0]}</div>
                        )}
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overview-card card">
                  <h3>Skills</h3>
                  <div className="skill-tags">
                    {project.skills?.map(s => <span key={s} className="tag-skill">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="workspace-kanban">
              <div className="kanban-toolbar">
                <h3>Task Board</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreateTask(true)}>+ New Task</button>
              </div>
              <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} onDeleteTask={handleDeleteTask} />
            </div>
          )}

          {activeTab === 'team' && (
            <div className="workspace-team">
              <h3>Team Members</h3>
              <div className="team-grid">
                {project.members?.map(m => (
                  <div key={m.id} className="team-card card">
                    {m.photos?.[0]?.url ? (
                      <img src={m.photos[0].url} alt="" className="team-avatar" />
                    ) : (
                      <div className="avatar-placeholder-md">{m.name?.[0]}</div>
                    )}
                    <h4>{m.name}</h4>
                    <p>{m.headline || 'Team Member'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="workspace-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {(project.activity || tasks.slice(0, 5)).map((item, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <p>{item.description || item.title || 'Activity'}</p>
                      <span className="activity-time">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showCreateTask && (
            <CreateTaskModal
              onClose={() => setShowCreateTask(false)}
              onSubmit={handleCreateTask}
              members={project.members}
            />
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Project not found</h3>
          <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
        </div>
      )}

      <style>{`
        .project-workspace { max-width: 1100px; margin: 0 auto; }
        .workspace-header { margin-bottom: 24px; }
        .back-link { font-size: 14px; color: var(--primary); text-decoration: none; margin-bottom: 12px; display: inline-block; }
        .workspace-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .workspace-title-row h1 { font-size: 28px; margin: 0; }
        .workspace-desc { color: var(--text-light); font-size: 15px; }

        .workspace-tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .workspace-tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .workspace-tab:hover { background: rgba(74,108,247,0.05); }
        .workspace-tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }

        .overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .overview-card { padding: 20px; }
        .overview-card h3 { font-size: 14px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .overview-stat { font-size: 32px; font-weight: 700; color: var(--primary); }
        .overview-breakdown { margin-top: 12px; }
        .breakdown-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; }
        .breakdown-dot { width: 8px; height: 8px; border-radius: 50%; }
        .breakdown-count { margin-left: auto; font-weight: 600; }
        .team-avatars { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .team-member-mini { display: flex; align-items: center; gap: 8px; font-size: 14px; }

        .kanban-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .kanban-board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; overflow-x: auto; }
        .kanban-column { min-height: 200px; }
        .kanban-col-header { padding: 12px; background: var(--card); border-radius: var(--radius) var(--radius) 0 0; border-top: 3px solid; display: flex; align-items: center; gap: 8px; }
        .col-icon { font-size: 16px; }
        .col-label { font-weight: 600; font-size: 13px; }
        .col-count { margin-left: auto; font-size: 12px; background: var(--bg-secondary); padding: 2px 8px; border-radius: 10px; }
        .kanban-col-body { min-height: 150px; background: rgba(0,0,0,0.02); border-radius: 0 0 var(--radius) var(--radius); padding: 8px; display: flex; flex-direction: column; gap: 8px; }

        .kanban-task { background: var(--card); border-radius: var(--radius-sm); padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); cursor: default; }
        .kanban-task.urgent { border-left: 3px solid #dc2626; }
        .kanban-task.high { border-left: 3px solid #ef4444; }
        .kanban-task.medium { border-left: 3px solid #f59e0b; }
        .kanban-task.low { border-left: 3px solid #6b7280; }
        .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .task-priority { font-size: 10px; padding: 2px 6px; border-radius: 8px; color: #fff; font-weight: 600; text-transform: uppercase; }
        .task-delete { background: none; border: none; color: var(--text-light); cursor: pointer; font-size: 14px; opacity: 0; transition: opacity 0.2s; }
        .kanban-task:hover .task-delete { opacity: 1; }
        .task-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .task-desc { font-size: 12px; color: var(--text-light); margin-bottom: 8px; line-height: 1.4; }
        .task-assignee { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-light); margin-bottom: 8px; }
        .task-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
        .task-move-btns { display: flex; gap: 4px; flex-wrap: wrap; }
        .task-move-btn { font-size: 11px; padding: 2px 6px; background: transparent; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; transition: all 0.2s; }
        .task-move-btn:hover { background: var(--bg-secondary); }
        .kanban-empty { text-align: center; color: var(--text-light); font-size: 13px; padding: 20px; }

        .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .team-card { padding: 20px; text-align: center; }
        .team-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; }
        .avatar-placeholder-md { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 600; margin: 0 auto 12px; }
        .team-card h4 { font-size: 16px; margin-bottom: 4px; }
        .team-card p { font-size: 13px; color: var(--text-light); }

        .activity-list { display: flex; flex-direction: column; gap: 0; }
        .activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 6px; flex-shrink: 0; }
        .activity-content p { font-size: 14px; margin-bottom: 2px; }
        .activity-time { font-size: 12px; color: var(--text-light); }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }

        @media (max-width: 1024px) {
          .kanban-board { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .overview-grid { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: 1fr; }
          .kanban-board { grid-template-columns: 1fr; }
          .workspace-tabs { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
