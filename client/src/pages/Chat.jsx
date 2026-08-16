import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatAPI, matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket = null;

const QUICK_EMOJIS = ['👋', '👍', '❤️', '🔥', '💯', '🎉', '🚀', '💡', '✅', '😂', '🤝', '⭐'];

function formatMessageTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [icebreaker, setIcebreaker] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    connectSocket();
    loadConversations();
    return () => { socket?.disconnect(); };
  }, []);

  useEffect(() => {
    if (matchId) {
      loadMessages(matchId);
      loadIcebreaker(matchId);
      socket?.emit('join_match', matchId);
      return () => socket?.emit('leave_match', matchId);
    }
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    socket = io('http://localhost:5000', { auth: { token } });

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_typing', ({ userId, matchId: mId, isTyping }) => {
      if (mId === matchId) {
        setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
      }
    });

    socket.on('message_read', ({ messageId }) => {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isRead: true, readAt: new Date() } : m
      ));
    });
  };

  const loadConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id) => {
    try {
      const res = await chatAPI.getMessages(id);
      setMessages(res.data.messages);
      await chatAPI.markAsRead(id);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const loadIcebreaker = async (id) => {
    try {
      const res = await chatAPI.getIcebreaker(id);
      setIcebreaker(res.data);
    } catch (err) { /* ignore */ }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId) return;
    const messageContent = newMessage.trim();
    setNewMessage('');
    setShowEmoji(false);
    try {
      await chatAPI.sendMessage({ matchId, content: messageContent });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (isTyping) => {
    socket?.emit('typing', { matchId, isTyping });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => handleTyping(false), 2000);
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const getOtherUser = (match) => {
    if (!match?.users) return null;
    return match.users.find(u => u.id !== user?.id);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const other = conv.otherUser;
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  // Conversation List (no match selected)
  if (!matchId) {
    return (
      <div className="chat-page page-transition">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>Messages</h3>
            <button className="btn btn-ghost btn-sm btn-icon" title="New message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <div className="chat-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="conversation-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const other = conv.otherUser;
                return (
                  <Link to={`/chat/${conv.match.id}`} key={conv.match.id} className="conversation-item">
                    <div className="avatar avatar-sm" style={{ position: 'relative' }}>
                      {other?.photos?.[0]?.url ? <img src={other.photos[0].url} alt="" /> : other?.name?.[0]}
                      {other?.isOnline && <span className="online-dot" />}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-top">
                        <strong>{other?.name || 'Unknown'}</strong>
                        <span className="conversation-time">{conv.lastMessage ? formatMessageTime(conv.lastMessage.createdAt) : ''}</span>
                      </div>
                      <p className="conversation-last">{conv.lastMessage?.content?.substring(0, 50) || 'Start chatting!'}</p>
                    </div>
                    {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                  </Link>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">💬</div>
                <h3>{searchQuery ? 'No matches found' : 'No conversations'}</h3>
                <p>{searchQuery ? 'Try a different search' : 'Connect with someone to start collaborating!'}</p>
                {!searchQuery && <Link to="/matches" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Find Connections</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Chat
  const currentConv = conversations.find(c => c.match.id === matchId);
  const otherUser = currentConv?.otherUser;

  return (
    <div className="chat-page chat-active page-transition">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Messages</h3>
        </div>
        <div className="chat-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="conversation-list">
          {filteredConversations.map(conv => {
            const other = conv.otherUser;
            return (
              <Link to={`/chat/${conv.match.id}`} key={conv.match.id}
                className={`conversation-item ${conv.match.id === matchId ? 'active' : ''}`}>
                <div className="avatar avatar-sm" style={{ position: 'relative' }}>
                  {other?.photos?.[0]?.url ? <img src={other.photos[0].url} alt="" /> : other?.name?.[0]}
                  {other?.isOnline && <span className="online-dot" />}
                </div>
                <div className="conversation-info">
                  <div className="conversation-top">
                    <strong>{other?.name}</strong>
                    <span className="conversation-time">{conv.lastMessage ? formatMessageTime(conv.lastMessage.createdAt) : ''}</span>
                  </div>
                  <p className="conversation-last">{conv.lastMessage?.content?.substring(0, 40) || ''}</p>
                </div>
                {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <Link to="/chat" className="chat-back-btn hide-desktop">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </Link>
          <div className="avatar avatar-sm" style={{ position: 'relative' }}>
            {otherUser?.photos?.[0]?.url ? <img src={otherUser.photos[0].url} alt="" /> : otherUser?.name?.[0]}
            {otherUser?.isOnline && <span className="online-dot" />}
          </div>
          <div className="chat-header-info">
            <strong>{otherUser?.name}</strong>
            <span className={`chat-status ${otherUser?.isOnline ? 'online' : 'offline'}`}>
              {otherUser?.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {otherUser?.skills?.length > 0 && (
            <div className="chat-header-skills hide-mobile">
              {otherUser.skills.slice(0, 3).map(s => <span key={s} className="tag-skill">{s}</span>)}
            </div>
          )}
          <div className="chat-header-actions">
            <button className="btn-icon" title="Voice call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            </button>
            <button className="btn-icon" title="Video call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </button>
            <button className="btn-icon" title="More">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {icebreaker && messages.length === 0 && (
            <div className="icebreaker-box">
              <span className="icebreaker-icon">💡</span>
              <p className="icebreaker-label">Conversation starter based on shared skills:</p>
              <p className="icebreaker-text">{icebreaker.prompt}</p>
            </div>
          )}

          {messages.length === 0 && !icebreaker && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h4>Start a conversation</h4>
              <p>Send a message to {otherUser?.name} to get started!</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMine = msg.sender.id === user?.id;
            const showAvatar = idx === 0 || messages[idx - 1]?.sender.id !== msg.sender.id;
            return (
              <div key={msg.id} className={`message ${isMine ? 'sent' : 'received'}`}>
                {!isMine && showAvatar && (
                  <div className="message-avatar avatar avatar-xs">
                    {msg.sender.name?.[0]}
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                  </div>
                  <div className="message-meta">
                    <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
                    {isMine && (
                      <span className="read-status">{msg.isRead ? '✓✓' : '✓'}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {Object.values(typingUsers).some(Boolean) && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
              <span>{otherUser?.name} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="emoji-picker">
            <div className="emoji-grid">
              {QUICK_EMOJIS.map(emoji => (
                <button key={emoji} className="emoji-btn" onClick={() => insertEmoji(emoji)}>{emoji}</button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <form className="chat-input" onSubmit={handleSend}>
          <button type="button" className="btn-icon" title="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <button type="button" className="btn-icon" title="Emoji" onClick={() => setShowEmoji(!showEmoji)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onFocus={() => handleTyping(true)}
            onBlur={() => setTimeout(() => handleTyping(false), 1000)}
            placeholder="Type a message..."
            className="chat-input-field"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!newMessage.trim()} title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>

      <style>{`
        .chat-page { display: flex; height: calc(100vh - var(--space-6) * 2); margin: calc(-1 * var(--space-6)); }
        .chat-sidebar { width: 340px; border-right: 1px solid var(--border-light); display: flex; flex-direction: column; background: var(--card); }
        .chat-sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-5); }
        .chat-sidebar-header h3 { font-size: var(--text-xl); }

        .chat-search { padding: 0 var(--space-4) var(--space-3); display: flex; align-items: center; gap: var(--space-2); background: var(--card); }
        .chat-search svg { flex-shrink: 0; color: var(--text-tertiary); }
        .chat-search input { flex: 1; border: none; background: var(--bg-secondary); padding: 10px 14px; border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--text); }
        .chat-search input:focus { outline: none; background: var(--bg); }

        .conversation-list { flex: 1; overflow-y: auto; }
        .conversation-item {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          transition: background var(--transition-fast);
          border-bottom: 1px solid var(--border-light);
        }
        .conversation-item:hover { background: var(--bg-secondary); }
        .conversation-item.active { background: var(--primary-light); border-right: 3px solid var(--primary); }
        .online-dot {
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px; background: var(--success);
          border-radius: 50%; border: 2px solid var(--card);
        }
        .conversation-info { flex: 1; min-width: 0; }
        .conversation-top { display: flex; justify-content: space-between; align-items: baseline; }
        .conversation-top strong { font-size: var(--text-sm); }
        .conversation-time { font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; }
        .conversation-last { color: var(--text-secondary); font-size: var(--text-xs); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
        .unread-badge { background: var(--primary); color: white; font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); font-weight: var(--weight-bold); flex-shrink: 0; }

        /* Chat Main */
        .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .chat-header {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3) var(--space-5);
          border-bottom: 1px solid var(--border-light);
          background: var(--card);
        }
        .chat-back-btn { display: none; color: var(--primary); }
        .chat-header-info { flex: 1; }
        .chat-header-info strong { display: block; font-size: var(--text-base); }
        .chat-status { font-size: 12px; }
        .chat-status.online { color: var(--success); }
        .chat-status.offline { color: var(--text-tertiary); }
        .chat-header-skills { display: flex; gap: var(--space-1); }
        .chat-header-actions { display: flex; gap: var(--space-1); }

        /* Messages */
        .chat-messages {
          flex: 1; overflow-y: auto; padding: var(--space-5);
          display: flex; flex-direction: column; gap: var(--space-3);
          background: var(--bg-secondary);
        }
        .icebreaker-box {
          background: var(--card); padding: var(--space-4);
          border-radius: var(--radius-lg); text-align: center;
          border: 1px dashed var(--primary-border);
          margin-bottom: var(--space-3);
        }
        .icebreaker-icon { font-size: 24px; display: block; margin-bottom: var(--space-2); }
        .icebreaker-label { font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-1); }
        .icebreaker-text { font-weight: var(--weight-medium); font-size: var(--text-sm); }

        .chat-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; color: var(--text-secondary);
        }
        .chat-empty-icon { font-size: 48px; opacity: 0.5; margin-bottom: var(--space-3); }
        .chat-empty h4 { color: var(--text); margin-bottom: var(--space-1); }

        .message { display: flex; gap: var(--space-2); max-width: 70%; }
        .message.sent { align-self: flex-end; flex-direction: row-reverse; }
        .message.received { align-self: flex-start; }
        .message-avatar { flex-shrink: 0; margin-top: 4px; }
        .message-content { display: flex; flex-direction: column; }
        .message-bubble {
          padding: 10px 16px; border-radius: var(--radius-lg);
          font-size: var(--text-base); line-height: var(--leading-relaxed);
        }
        .message.sent .message-bubble {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; border-bottom-right-radius: 4px;
        }
        .message.received .message-bubble {
          background: var(--card); border: 1px solid var(--border-light);
          border-bottom-left-radius: 4px;
        }
        .message-meta { display: flex; align-items: center; gap: var(--space-1); margin-top: 2px; padding: 0 4px; }
        .message-time { font-size: 11px; color: var(--text-tertiary); }
        .read-status { font-size: 12px; color: var(--primary); }

        .typing-indicator {
          display: flex; align-items: center; gap: var(--space-2);
          font-size: var(--text-xs); color: var(--text-tertiary);
          padding: var(--space-2) 0;
        }
        .typing-dots { display: flex; gap: 3px; }
        .typing-dots span {
          width: 6px; height: 6px; background: var(--text-tertiary);
          border-radius: 50%; animation: typingBounce 1.4s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

        /* Emoji Picker */
        .emoji-picker {
          padding: var(--space-3) var(--space-5);
          border-top: 1px solid var(--border-light);
          background: var(--card);
        }
        .emoji-grid { display: flex; gap: var(--space-1); flex-wrap: wrap; }
        .emoji-btn {
          width: 36px; height: 36px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; transition: all var(--transition-fast);
        }
        .emoji-btn:hover { background: var(--bg-secondary); transform: scale(1.15); }

        /* Chat Input */
        .chat-input {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          border-top: 1px solid var(--border-light);
          background: var(--card);
        }
        .chat-input-field {
          flex: 1; padding: 10px 16px;
          border: 2px solid var(--border); border-radius: var(--radius-full);
          font-size: var(--text-base); color: var(--text); background: var(--bg-secondary);
          transition: all var(--transition-fast);
        }
        .chat-input-field:focus { outline: none; border-color: var(--primary); background: var(--card); }
        .chat-input-field::placeholder { color: var(--text-tertiary); }

        @media (max-width: 768px) {
          .chat-page { flex-direction: column; }
          .chat-sidebar { width: 100%; height: auto; max-height: 200px; border-right: none; border-bottom: 1px solid var(--border-light); }
          .chat-back-btn { display: flex; }
          .chat-sidebar-header, .chat-search { display: none; }
          .conversation-list { max-height: 140px; }
          .message { max-width: 85%; }
        }
      `}</style>
    </div>
  );
}
