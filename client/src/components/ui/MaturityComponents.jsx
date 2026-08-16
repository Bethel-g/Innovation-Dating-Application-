import { useState } from 'react';

/* ===== Skeleton Loaders ===== */
export function Skeleton({ width, height, borderRadius, style, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || 20,
        borderRadius: borderRadius || 'var(--radius)',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3, hasAvatar = false, hasImage = false }) {
  return (
    <div className="skeleton-card card">
      {hasImage && <Skeleton height={180} borderRadius="var(--radius) var(--radius) 0 0" />}
      <div className="skeleton-card-body">
        {hasAvatar && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Skeleton width={48} height={48} borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} />
            </div>
          </div>
        )}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '70%' : '100%'}
            height={14}
            style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 3 }) {
  return (
    <div className="skeleton-feed">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} hasAvatar lines={4} />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="skeleton-profile">
      <Skeleton height={200} borderRadius="var(--radius-xl) var(--radius-xl) 0 0" />
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <Skeleton width={100} height={100} borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={24} style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={14} />
          </div>
        </div>
        <Skeleton lines={5} />
      </div>
    </div>
  );
}

/* ===== Empty States ===== */
export function EmptyState({ icon, title, description, action, actionLabel, onAction }) {
  return (
    <div className="empty-state-component">
      <div className="empty-state-icon-lg">{icon || '📭'}</div>
      <h3>{title || 'Nothing here yet'}</h3>
      <p>{description || 'There\'s nothing to show right now.'}</p>
      {action && (
        <button className="btn btn-primary" onClick={onAction || action}>
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}

export const EMPTY_STATES = {
  feed: { icon: '📰', title: 'Your feed is empty', description: 'Follow professionals or create the first post in your network.', actionLabel: 'Discover People' },
  matches: { icon: '🤝', title: 'No connections yet', description: 'Start discovering professionals to build your network!', actionLabel: 'Start Discovering' },
  messages: { icon: '💬', title: 'No messages yet', description: 'Connect with someone to start a conversation.', actionLabel: 'Find Connections' },
  projects: { icon: '🚀', title: 'No projects yet', description: 'Create your first collaborative project!', actionLabel: 'Create Project' },
  ideas: { icon: '💡', title: 'No ideas posted', description: 'Share your innovative ideas with the community.', actionLabel: 'Post an Idea' },
  jobs: { icon: '💼', title: 'No saved jobs', description: 'Save jobs you\'re interested in to view them later.', actionLabel: 'Browse Jobs' },
  events: { icon: '📅', title: 'No events yet', description: 'Browse events and register to see them here.', actionLabel: 'Browse Events' },
  notifications: { icon: '🔔', title: 'All caught up!', description: 'No new notifications right now.' },
  search: { icon: '🔍', title: 'No results found', description: 'Try adjusting your search terms or filters.' },
  endorsements: { icon: '⭐', title: 'No endorsements yet', description: 'Endorse others to build your professional network.' },
};

/* ===== Error States ===== */
export function ErrorState({ title, message, onRetry, icon }) {
  return (
    <div className="error-state-component">
      <div className="error-icon">{icon || '⚠️'}</div>
      <h3>{title || 'Something went wrong'}</h3>
      <p>{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

/* ===== Confirmation Modal ===== */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel, cancelLabel, variant = 'danger' }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon ${variant}`}>
          {variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : '❓'}
        </div>
        <h3>{title || 'Are you sure?'}</h3>
        <p>{message || 'This action cannot be undone.'}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>{cancelLabel || 'Cancel'}</button>
          <button className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Success Toast Content ===== */
export function SuccessToast({ message, action, actionLabel }) {
  return (
    <div className="success-toast-content">
      <span className="success-check">✓</span>
      <span>{message}</span>
      {action && <button className="toast-action" onClick={action}>{actionLabel}</button>}
    </div>
  );
}

/* ===== Loading Overlay ===== */
export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <div className="spinner" />
        <span>{text}</span>
      </div>
    </div>
  );
}

/* ===== Page Loading ===== */
export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      <span>Loading...</span>
    </div>
  );
}

/* ===== Global Styles ===== */
export function MaturityStyles() {
  return (
    <style>{`
      /* Skeleton */
      .skeleton {
        background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-light) 50%, var(--bg-secondary) 75%);
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
      }
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton-card { padding: 20px; }
      .skeleton-card-body { display: flex; flex-direction: column; gap: 8px; }

      /* Empty State */
      .empty-state-component { text-align: center; padding: 60px 20px; }
      .empty-state-icon-lg { font-size: 64px; margin-bottom: 16px; }
      .empty-state-component h3 { font-size: 22px; margin-bottom: 8px; }
      .empty-state-component p { color: var(--text-light); margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }

      /* Error State */
      .error-state-component { text-align: center; padding: 60px 20px; }
      .error-icon { font-size: 64px; margin-bottom: 16px; }
      .error-state-component h3 { font-size: 22px; margin-bottom: 8px; color: var(--danger); }
      .error-state-component p { color: var(--text-light); margin-bottom: 24px; }

      /* Confirm Modal */
      .confirm-modal { text-align: center; max-width: 400px; padding: 32px; }
      .confirm-icon { font-size: 48px; margin-bottom: 16px; }
      .confirm-modal h3 { font-size: 20px; margin-bottom: 8px; }
      .confirm-modal p { color: var(--text-light); margin-bottom: 24px; }
      .btn-danger { background: var(--danger); color: #fff; }
      .btn-danger:hover { background: #dc2626; }

      /* Success Toast */
      .success-toast-content { display: flex; align-items: center; gap: 8px; }
      .success-check { width: 24px; height: 24px; background: #22c55e; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
      .toast-action { background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; margin-left: 8px; font-size: 13px; }

      /* Loading */
      .loading-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); }
      .loading-overlay-content { display: flex; flex-direction: column; align-items: center; gap: 12px; }
      .page-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 12px; }
      .page-loader-spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}
