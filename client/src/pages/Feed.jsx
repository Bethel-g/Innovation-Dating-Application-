import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { chatAPI, feedAPI, matchAPI, notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const POST_TYPES = [
  { value: 'post', label: 'Post' },
  { value: 'idea', label: 'Idea' },
  { value: 'question', label: 'Question' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'project_update', label: 'Project Update' },
  { value: 'article', label: 'Article' },
];

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

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    if (searchParams.get('compose')) {
      setTimeout(() => document.getElementById('post-composer')?.focus(), 100);
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
      const hashtags = composer.hashtags
        .split(',')
        .map(tag => tag.trim().replace(/^#/, ''))
        .filter(Boolean);
      const res = await feedAPI.createPost({
        content: composer.content.trim(),
        type: composer.type,
        hashtags,
      });
      setPosts(prev => [{ ...res.data, author: user, isLikedByMe: false }, ...prev]);
      setComposer({ content: '', type: 'post', hashtags: '' });
      toast.success('Post shared');
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

  const formatTime = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="feed-page page-transition">
      <aside className="feed-left">
        <div className="card profile-card-mini">
          <div className="profile-cover" />
          <div className="profile-mini-body">
            <div className="profile-mini-avatar" style={{ backgroundImage: `url(${user?.photos?.[0]?.url || ''})` }}>
              {!user?.photos?.length && user?.name?.[0]}
            </div>
            <h2>{user?.name}</h2>
            <p>{user?.headline || 'Build your professional network'}</p>
            <div className="profile-mini-stats">
              <span><strong>{followCounts.followers}</strong> Followers</span>
              <span><strong>{followCounts.following}</strong> Following</span>
            </div>
            <Link to="/profile" className="btn btn-secondary btn-sm">View Profile</Link>
          </div>
        </div>

        <div className="card shortcuts-card">
          <h3>Quick Access</h3>
          <Link to="/matches">Discover people</Link>
          <Link to="/chat">Message box</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/settings">Mode, language, settings</Link>
        </div>
      </aside>

      <main className="feed-main">
        <form className="card composer-card" onSubmit={createPost}>
          <div className="composer-top">
            <div className="avatar composer-avatar">{user?.name?.[0]}</div>
            <textarea
              id="post-composer"
              value={composer.content}
              onChange={e => setComposer({ ...composer, content: e.target.value })}
              placeholder="Share an update, question, idea, or project milestone..."
              rows={3}
            />
          </div>
          <div className="composer-actions">
            <select value={composer.type} onChange={e => setComposer({ ...composer, type: e.target.value })}>
              {POST_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <input
              value={composer.hashtags}
              onChange={e => setComposer({ ...composer, hashtags: e.target.value })}
              placeholder="hashtags, comma separated"
            />
            <button className="btn btn-primary btn-sm" disabled={posting || !composer.content.trim()}>
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {posts.length === 0 ? (
          <div className="empty-state card">
            <h3>No posts yet</h3>
            <p>Follow professionals or create the first post in your network.</p>
          </div>
        ) : posts.map(post => (
          <article key={post.id} className="card feed-post">
            <div className="post-header">
              <Link to={`/profile/${post.author?.id}`} className="post-author-avatar">
                {post.author?.photos?.[0]?.url ? <img src={post.author.photos[0].url} alt="" /> : post.author?.name?.[0] || 'U'}
              </Link>
              <div className="post-author-info">
                <Link to={`/profile/${post.author?.id}`}><strong>{post.author?.name || 'Professional'}</strong></Link>
                <p>{post.author?.headline || post.type?.replace('_', ' ') || 'Network update'} · {formatTime(post.createdAt)}</p>
              </div>
              <span className="badge badge-primary">{post.type?.replace('_', ' ') || 'post'}</span>
            </div>
            <p className="post-content">{post.content}</p>
            {post.hashtags?.length > 0 && (
              <div className="post-tags">
                {post.hashtags.map(tag => <span key={tag}>#{tag}</span>)}
              </div>
            )}
            <div className="post-stats">
              <span>{post.likeCount || 0} likes</span>
              <span>{post.commentCount || 0} comments</span>
              <span>{post.shareCount || 0} shares</span>
            </div>
            <div className="post-actions">
              <button onClick={() => toggleLike(post.id)} className={post.isLikedByMe ? 'active' : ''}>Like</button>
              <button>Comment</button>
              <button>Share</button>
            </div>
          </article>
        ))}
      </main>

      <aside className="feed-right">
        <div className="card side-panel">
          <div className="side-panel-header">
            <h3>Notifications</h3>
            <Link to="/notifications">See all</Link>
          </div>
          {notifications.length === 0 ? <p className="side-empty">No new alerts</p> : notifications.map(item => (
            <Link to="/notifications" key={item.id} className={`notice-item ${item.isRead ? '' : 'unread'}`}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </Link>
          ))}
        </div>

        <div className="card side-panel">
          <div className="side-panel-header">
            <h3>Messages</h3>
            <Link to="/chat">Open inbox</Link>
          </div>
          {conversations.slice(0, 4).length === 0 ? <p className="side-empty">No conversations yet</p> : conversations.slice(0, 4).map(conv => (
            <Link to={`/chat/${conv.match.id}`} key={conv.match.id} className="message-preview">
              <div className="avatar tiny-avatar">{conv.otherUser?.name?.[0]}</div>
              <div>
                <strong>{conv.otherUser?.name || 'Connection'}</strong>
                <span>{conv.lastMessage?.content || 'Start chatting'}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="card side-panel">
          <h3>People to Know</h3>
          {suggestions.length === 0 ? <p className="side-empty">Suggestions will appear here</p> : suggestions.map(item => (
            <Link to={`/profile/${item.user.id}`} key={item.user.id} className="suggestion-item">
              <div className="avatar tiny-avatar">{item.user.name?.[0]}</div>
              <div>
                <strong>{item.user.name}</strong>
                <span>{item.compatibilityScore}% compatible</span>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <style>{`
        .feed-page { display: grid; grid-template-columns: 260px minmax(0, 1fr) 300px; gap: 20px; align-items: start; }
        .feed-left, .feed-right { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 90px; }
        .feed-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .profile-card-mini { padding: 0; overflow: hidden; }
        .profile-cover { height: 72px; background: linear-gradient(135deg, var(--primary), var(--secondary)); }
        .profile-mini-body { padding: 0 18px 18px; text-align: center; }
        .profile-mini-avatar { width: 76px; height: 76px; margin: -38px auto 10px; border-radius: 50%; border: 4px solid var(--card); background: linear-gradient(135deg, var(--primary), var(--secondary)); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 700; }
        .profile-mini-body h2 { font-size: 18px; }
        .profile-mini-body p, .side-empty { color: var(--text-light); font-size: 13px; }
        .profile-mini-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0; font-size: 13px; }
        .profile-mini-stats strong { display: block; color: var(--text); font-size: 16px; }
        .shortcuts-card { display: flex; flex-direction: column; gap: 10px; }
        .shortcuts-card a { color: var(--text-light); font-weight: 600; font-size: 14px; }
        .shortcuts-card a:hover { color: var(--primary); }
        .composer-top { display: flex; gap: 12px; }
        .composer-avatar { flex-shrink: 0; }
        .composer-top textarea { flex: 1; border: 0; resize: vertical; outline: none; background: var(--bg); border-radius: var(--radius); padding: 14px; color: var(--text); }
        .composer-actions { display: grid; grid-template-columns: 160px 1fr auto; gap: 10px; margin-top: 12px; }
        .composer-actions select, .composer-actions input { border: 2px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; background: var(--card); color: var(--text); }
        .feed-post { display: flex; flex-direction: column; gap: 12px; }
        .post-header { display: flex; align-items: center; gap: 12px; }
        .post-author-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; overflow: hidden; flex-shrink: 0; }
        .post-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .post-author-info { flex: 1; min-width: 0; }
        .post-author-info p { color: var(--text-light); font-size: 13px; text-transform: capitalize; }
        .post-content { white-space: pre-wrap; line-height: 1.7; }
        .post-tags { display: flex; flex-wrap: wrap; gap: 8px; color: var(--primary); font-weight: 600; font-size: 14px; }
        .post-stats { display: flex; gap: 16px; color: var(--text-light); font-size: 13px; border-top: 1px solid var(--border); padding-top: 10px; }
        .post-actions { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border); padding-top: 8px; }
        .post-actions button { background: transparent; color: var(--text-light); padding: 8px; border-radius: var(--radius-sm); font-weight: 700; }
        .post-actions button:hover, .post-actions button.active { background: rgba(74,108,247,0.1); color: var(--primary); }
        .side-panel { display: flex; flex-direction: column; gap: 12px; }
        .side-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .side-panel-header a { color: var(--primary); font-size: 13px; font-weight: 700; }
        .notice-item, .message-preview, .suggestion-item { display: flex; gap: 10px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg); }
        .notice-item { flex-direction: column; gap: 2px; }
        .notice-item span, .message-preview span, .suggestion-item span { display: block; color: var(--text-light); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .notice-item.unread { border-left: 3px solid var(--primary); }
        .tiny-avatar { width: 36px; height: 36px; font-size: 13px; flex-shrink: 0; }
        @media (max-width: 1100px) { .feed-page { grid-template-columns: 220px minmax(0, 1fr); } .feed-right { display: none; } }
        @media (max-width: 768px) {
          .feed-page { display: block; padding-bottom: 78px; }
          .feed-left { position: static; margin-bottom: 16px; }
          .feed-left .shortcuts-card { display: none; }
          .composer-actions { grid-template-columns: 1fr; }
          .post-header { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
