import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { chatAPI, feedAPI, matchAPI, notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const POST_TYPES = [
  { value: 'post', label: 'Post', icon: '📝' },
  { value: 'idea', label: 'Idea', icon: '💡' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'project_update', label: 'Project Update', icon: '📋' },
  { value: 'article', label: 'Article', icon: '📰' },
];

const FEED_TABS = [
  { id: 'foryou', label: 'For You', icon: '✨', desc: 'AI-curated based on your interests' },
  { id: 'following', label: 'Following', icon: '👥', desc: 'Posts from people you follow' },
  { id: 'trending', label: 'Trending', icon: '🔥', desc: 'Most popular posts right now' },
  { id: 'industry', label: 'Your Industry', icon: '🏢', desc: 'Posts relevant to your field' },
  { id: 'recommended', label: 'Recommended', icon: '🎯', desc: 'Suggested content and connections' },
];

function formatTime(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Feed() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [composer, setComposer] = useState({ content: '', type: 'post', hashtags: '' });
  const [composerFocused, setComposerFocused] = useState(false);
  const [feedTab, setFeedTab] = useState('foryou');

  useEffect(() => { loadHome(); }, []);

  useEffect(() => {
    if (searchParams.get('compose')) {
      setTimeout(() => document.getElementById('post-composer')?.focus(), 200);
      setComposerFocused(true);
    }
  }, [searchParams]);

  const loadHome = async () => {
    setLoading(true);
    try {
      const [feedRes, notificationRes, conversationRes, suggestionRes, countRes] = await Promise.allSettled([
        feedAPI.getFeed({ limit: 20 }),
        notificationAPI.getAll({ limit: 5 }),
        chatAPI.getConversations(),
        matchAPI.getPotential(),
        feedAPI.getFollowCounts(),
      ]);

      let nextPosts = feedRes.status === 'fulfilled' ? feedRes.value.data.posts || [] : [];
      if (nextPosts.length === 0) {
        const exploreRes = await feedAPI.getExplore({ limit: 20 });
        nextPosts = exploreRes.data.posts || [];
      }

      setPosts(nextPosts);
      setNotifications(notificationRes.status === 'fulfilled' ? notificationRes.value.data.notifications || [] : []);
      setConversations(conversationRes.status === 'fulfilled' ? conversationRes.value.data || [] : []);
      setSuggestions(suggestionRes.status === 'fulfilled' ? suggestionRes.value.data.slice(0, 4) : []);
      setFollowCounts(countRes.status === 'fulfilled' ? countRes.value.data : { followers: 0, following: 0 });
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!composer.content.trim()) return;
    setPosting(true);
    try {
      const hashtags = composer.hashtags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean);
      const res = await feedAPI.createPost({ content: composer.content.trim(), type: composer.type, hashtags });
      setPosts(prev => [{ ...res.data, author: user, isLikedByMe: false }, ...prev]);
      setComposer({ content: '', type: 'post', hashtags: '' });
      setComposerFocused(false);
      toast.success('Post shared!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share post');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await feedAPI.likePost(postId);
      setPosts(prev => prev.map(post => post.id === postId
        ? { ...post, isLikedByMe: res.data.liked, likeCount: res.data.likeCount }
        : post
      ));
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const selectedType = POST_TYPES.find(t => t.value === composer.type);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="feed-page page-transition">
      <aside className="feed-left">
        <div className="card profile-card-mini">
          <div className="profile-cover-mini" />
          <div className="profile-mini-body">
            <Link to="/profile" className="profile-mini-avatar-link">
              {user?.photos?.[0]?.url ? (
                <img src={user.photos[0].url} alt="" className="profile-mini-avatar" />
              ) : (
                <div className="profile-mini-avatar">{user?.name?.[0]}</div>
              )}
            </Link>
            <Link to="/profile"><h3 className="profile-mini-name">{user?.name}</h3></Link>
            <p className="profile-mini-headline">{user?.headline || 'Build your professional network'}</p>
            <div className="profile-mini-stats">
              <div className="profile-mini-stat">
                <strong>{followCounts.followers}</strong>
                <span>Followers</span>
              </div>
              <div className="profile-mini-stat">
                <strong>{followCounts.following}</strong>
                <span>Following</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card shortcuts-card">
          <h4 className="shortcuts-title">Quick Links</h4>
          <Link to="/matches" className="shortcut-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span>Discover</span>
          </Link>
          <Link to="/chat" className="shortcut-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span>Messages</span>
          </Link>
          <Link to="/notifications" className="shortcut-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span>Notifications</span>
          </Link>
          <Link to="/ideas" className="shortcut-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            <span>Ideas</span>
          </Link>
          <Link to="/settings" className="shortcut-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      <main className="feed-main">
        {/* Composer */}
        <div className="card composer-card">
          <form onSubmit={createPost}>
            <div className="composer-top">
              <Link to="/profile" className="composer-avatar">
                {user?.photos?.[0]?.url ? <img src={user.photos[0].url} alt="" /> : user?.name?.[0]}
              </Link>
              <textarea
                id="post-composer"
                className={`composer-input ${composerFocused ? 'focused' : ''}`}
                value={composer.content}
                onChange={e => setComposer({ ...composer, content: e.target.value })}
                onFocus={() => setComposerFocused(true)}
                placeholder="Share an update, question, idea, or project milestone..."
                rows={composerFocused ? 4 : 2}
              />
            </div>

            {composerFocused && (
              <div className="composer-expanded">
                <div className="composer-type-selector">
                  {POST_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`composer-type-btn ${composer.type === type.value ? 'active' : ''}`}
                      onClick={() => setComposer({ ...composer, type: type.value })}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>

                <div className="composer-hashtag-row">
                  <input
                    className="input"
                    value={composer.hashtags}
                    onChange={e => setComposer({ ...composer, hashtags: e.target.value })}
                    placeholder="Add hashtags, comma separated"
                  />
                </div>

                <div className="composer-footer">
                  <div className="composer-actions-left">
                    <button type="button" className="composer-action-btn" title="Add photo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </button>
                    <button type="button" className="composer-action-btn" title="Add file">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                    </button>
                  </div>
                  <div className="composer-footer-right">
                    <span className="text-xs text-tertiary">{composer.content.length}/2000</span>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm btn-pill"
                      disabled={posting || !composer.content.trim()}
                    >
                      {posting ? <span className="spinner spinner-sm" /> : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Feed Tabs */}
        <div className="feed-tabs">
          {FEED_TABS.map(tab => (
            <button
              key={tab.id}
              className={`feed-tab ${feedTab === tab.id ? 'active' : ''}`}
              onClick={() => setFeedTab(tab.id)}
              title={tab.desc}
            >
              <span className="feed-tab-icon">{tab.icon}</span>
              <span className="feed-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📝</div>
            <h3>Your feed is empty</h3>
            <p>Follow professionals or create the first post in your network.</p>
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="card feed-post">
              <div className="post-header">
                <Link to={`/profile/${post.author?.id}`} className="post-author">
                  {post.author?.photos?.[0]?.url ? (
                    <img src={post.author.photos[0].url} alt="" className="post-author-avatar" />
                  ) : (
                    <div className="post-author-avatar">{post.author?.name?.[0] || 'U'}</div>
                  )}
                  <div className="post-author-info">
                    <strong className="post-author-name">{post.author?.name || 'Professional'}</strong>
                    <span className="post-author-meta">{post.author?.headline || 'Network update'} · {formatTime(post.createdAt)}</span>
                  </div>
                </Link>
                <div className="post-header-right">
                  <span className={`badge badge-${post.type === 'achievement' ? 'success' : post.type === 'question' ? 'info' : post.type === 'idea' ? 'warning' : 'neutral'}`}>
                    {POST_TYPES.find(t => t.value === post.type)?.icon} {post.type?.replace('_', ' ')}
                  </span>
                  <button className="btn-icon" title="More options">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                </div>
              </div>

              <div className="post-content">
                <p>{post.content}</p>
              </div>

              {post.hashtags?.length > 0 && (
                <div className="post-tags">
                  {post.hashtags.map(tag => (
                    <span key={tag} className="post-tag">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="post-stats">
                {post.likeCount > 0 && <span>{post.likeCount} likes</span>}
                {post.commentCount > 0 && <span>{post.commentCount} comments</span>}
                {post.shareCount > 0 && <span>{post.shareCount} shares</span>}
              </div>

              <div className="post-actions">
                <button
                  className={`post-action-btn ${post.isLikedByMe ? 'liked' : ''}`}
                  onClick={() => toggleLike(post.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLikedByMe ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  <span>Like</span>
                </button>
                <button className="post-action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <span>Comment</span>
                </button>
                <button className="post-action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  <span>Share</span>
                </button>
              </div>
            </article>
          ))
        )}
      </main>

      <aside className="feed-right">
        <div className="card side-panel">
          <div className="side-panel-header">
            <h4>Notifications</h4>
            <Link to="/notifications" className="side-panel-link">See all</Link>
          </div>
          {notifications.length === 0 ? (
            <p className="side-empty">No new alerts</p>
          ) : notifications.map(item => (
            <Link to="/notifications" key={item.id} className={`notice-item ${item.isRead ? '' : 'unread'}`}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </Link>
          ))}
        </div>

        <div className="card side-panel">
          <div className="side-panel-header">
            <h4>Messages</h4>
            <Link to="/chat" className="side-panel-link">Open inbox</Link>
          </div>
          {conversations.slice(0, 4).length === 0 ? (
            <p className="side-empty">No conversations yet</p>
          ) : conversations.slice(0, 4).map(conv => (
            <Link to={`/chat/${conv.match.id}`} key={conv.match.id} className="message-preview">
              <div className="avatar avatar-xs">
                {conv.otherUser?.name?.[0]}
              </div>
              <div className="message-preview-info">
                <strong>{conv.otherUser?.name || 'Connection'}</strong>
                <span>{conv.lastMessage?.content || 'Start chatting'}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="card side-panel">
          <div className="side-panel-header">
            <h4>People to Know</h4>
            <Link to="/matches" className="side-panel-link">Discover</Link>
          </div>
          {suggestions.length === 0 ? (
            <p className="side-empty">Suggestions will appear here</p>
          ) : suggestions.map(item => (
            <Link to={`/profile/${item.user.id}`} key={item.user.id} className="suggestion-item">
              <div className="avatar avatar-xs">{item.user.name?.[0]}</div>
              <div className="suggestion-info">
                <strong>{item.user.name}</strong>
                <span>{item.compatibilityScore}% compatible</span>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <style>{`
        .feed-page { display: grid; grid-template-columns: 260px minmax(0, 1fr) 300px; gap: var(--space-5); align-items: start; }
        .feed-left, .feed-right { display: flex; flex-direction: column; gap: var(--space-4); position: sticky; top: calc(var(--space-6) + 8px); }
        .feed-main { display: flex; flex-direction: column; gap: var(--space-4); min-width: 0; }

        .feed-tabs { display: flex; gap: 0; background: var(--card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-light); }
        .feed-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 8px; background: transparent; color: var(--text-secondary); border: none; cursor: pointer; transition: all 0.2s; font-size: 12px; }
        .feed-tab:hover { background: var(--bg-secondary); }
        .feed-tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .feed-tab-icon { font-size: 16px; }
        .feed-tab-label { font-weight: 600; }

        /* Profile Mini Card */
        .profile-card-mini { padding: 0; overflow: hidden; }
        .profile-cover-mini { height: 64px; background: linear-gradient(135deg, var(--primary), var(--secondary)); }
        .profile-mini-body { padding: 0 var(--space-4) var(--space-4); text-align: center; }
        .profile-mini-avatar-link { display: block; margin-top: -36px; margin-bottom: var(--space-2); }
        .profile-mini-avatar {
          width: 72px; height: 72px; margin: 0 auto;
          border-radius: var(--radius-full); border: 3px solid var(--card);
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex; align-items: center; justify-content: center;
          color: var(--text-inverse); font-size: var(--text-xl); font-weight: var(--weight-bold);
          overflow: hidden;
        }
        .profile-mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-mini-name { font-size: var(--text-base); margin-bottom: 2px; }
        .profile-mini-headline { color: var(--text-secondary); font-size: var(--text-xs); line-height: 1.4; }
        .profile-mini-stats { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border-light); }
        .profile-mini-stat { text-align: center; }
        .profile-mini-stat strong { display: block; font-size: var(--text-md); font-weight: var(--weight-bold); }
        .profile-mini-stat span { font-size: var(--text-xs); color: var(--text-secondary); }

        /* Shortcuts */
        .shortcuts-card { display: flex; flex-direction: column; gap: var(--space-1); padding: var(--space-4); }
        .shortcuts-title { font-size: var(--text-sm); color: var(--text-secondary); font-weight: var(--weight-semibold); margin-bottom: var(--space-2); }
        .shortcut-link { display: flex; align-items: center; gap: var(--space-3); padding: 8px 10px; border-radius: var(--radius-md); color: var(--text-secondary); font-weight: var(--weight-medium); font-size: var(--text-sm); transition: all var(--transition-fast); }
        .shortcut-link:hover { background: var(--bg-secondary); color: var(--text); }
        .shortcut-link svg { flex-shrink: 0; }

        /* Composer */
        .composer-card { padding: var(--space-4); }
        .composer-top { display: flex; gap: var(--space-3); }
        .composer-avatar {
          width: 40px; height: 40px; border-radius: var(--radius-full); flex-shrink: 0;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex; align-items: center; justify-content: center;
          color: var(--text-inverse); font-weight: var(--weight-bold); font-size: var(--text-sm);
          overflow: hidden;
        }
        .composer-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .composer-input {
          flex: 1; border: none; background: var(--bg-secondary); border-radius: var(--radius-lg);
          padding: 12px 16px; font-size: var(--text-base); color: var(--text); resize: none;
          transition: all var(--transition-base); min-height: 44px; line-height: 1.5;
        }
        .composer-input:focus { outline: none; background: var(--bg); box-shadow: 0 0 0 2px var(--primary-border); }
        .composer-input::placeholder { color: var(--text-tertiary); }
        .composer-input.focused { min-height: 100px; }

        .composer-expanded { margin-top: var(--space-4); border-top: 1px solid var(--border-light); padding-top: var(--space-4); }
        .composer-type-selector { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
        .composer-type-btn {
          display: flex; align-items: center; gap: var(--space-1);
          padding: 6px 12px; border-radius: var(--radius-full);
          font-size: var(--text-xs); font-weight: var(--weight-semibold);
          color: var(--text-secondary); background: var(--bg-secondary);
          transition: all var(--transition-fast);
        }
        .composer-type-btn:hover { background: var(--primary-light); color: var(--primary); }
        .composer-type-btn.active { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-border); }

        .composer-hashtag-row { margin-bottom: var(--space-3); }
        .composer-hashtag-row .input { font-size: var(--text-sm); padding: 8px 12px; background: var(--bg-secondary); }

        .composer-footer { display: flex; align-items: center; justify-content: space-between; }
        .composer-actions-left { display: flex; gap: var(--space-1); }
        .composer-action-btn {
          width: 36px; height: 36px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); transition: all var(--transition-fast);
        }
        .composer-action-btn:hover { background: var(--bg-secondary); color: var(--primary); }
        .composer-footer-right { display: flex; align-items: center; gap: var(--space-3); }

        /* Posts */
        .feed-post { display: flex; flex-direction: column; gap: var(--space-3); }
        .post-header { display: flex; align-items: center; justify-content: space-between; }
        .post-author { display: flex; align-items: center; gap: var(--space-3); }
        .post-author-avatar {
          width: 44px; height: 44px; border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: var(--text-inverse); display: flex; align-items: center; justify-content: center;
          font-weight: var(--weight-bold); font-size: var(--text-sm); overflow: hidden; flex-shrink: 0;
        }
        .post-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .post-author-info { min-width: 0; }
        .post-author-name { display: block; font-size: var(--text-base); }
        .post-author-meta { display: block; color: var(--text-secondary); font-size: var(--text-xs); text-transform: capitalize; }
        .post-header-right { display: flex; align-items: center; gap: var(--space-2); }

        .post-content { line-height: var(--leading-relaxed); white-space: pre-wrap; }
        .post-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .post-tag { color: var(--primary); font-weight: var(--weight-semibold); font-size: var(--text-sm); cursor: pointer; }
        .post-tag:hover { text-decoration: underline; }

        .post-stats { display: flex; gap: var(--space-4); color: var(--text-secondary); font-size: var(--text-xs); padding-top: var(--space-2); border-top: 1px solid var(--border-light); }
        .post-actions { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border-light); padding-top: var(--space-1); }
        .post-action-btn {
          display: flex; align-items: center; justify-content: center; gap: var(--space-2);
          padding: 10px; border-radius: var(--radius-md); font-weight: var(--weight-semibold);
          font-size: var(--text-sm); color: var(--text-secondary); transition: all var(--transition-fast);
        }
        .post-action-btn:hover { background: var(--primary-light); color: var(--primary); }
        .post-action-btn.liked { color: var(--primary); }

        /* Side Panels */
        .side-panel { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4); }
        .side-panel-header { display: flex; align-items: center; justify-content: space-between; }
        .side-panel-header h4 { font-size: var(--text-sm); }
        .side-panel-link { color: var(--primary); font-size: var(--text-xs); font-weight: var(--weight-bold); }
        .side-empty { color: var(--text-tertiary); font-size: var(--text-xs); }

        .notice-item, .message-preview, .suggestion-item {
          display: flex; gap: var(--space-2); padding: 8px;
          border-radius: var(--radius-md); background: var(--bg-secondary);
          transition: background var(--transition-fast);
        }
        .notice-item:hover, .message-preview:hover, .suggestion-item:hover { background: var(--border-light); }
        .notice-item { flex-direction: column; gap: 2px; }
        .notice-item strong { font-size: var(--text-xs); }
        .notice-item span, .message-preview span, .suggestion-item span { display: block; color: var(--text-secondary); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .notice-item.unread { border-left: 3px solid var(--primary); background: var(--primary-light); }

        .message-preview-info, .suggestion-info { flex: 1; min-width: 0; }
        .message-preview-info strong, .suggestion-info strong { display: block; font-size: var(--text-xs); }

        @media (max-width: 1100px) {
          .feed-page { grid-template-columns: 220px minmax(0, 1fr); }
          .feed-right { display: none; }
        }
        @media (max-width: 768px) {
          .feed-page { display: flex; flex-direction: column; }
          .feed-left { position: static; display: none; }
          .feed-right { display: none; }
          .composer-expanded { display: block; }
          .composer-input { min-height: 80px; }
          .post-header { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
