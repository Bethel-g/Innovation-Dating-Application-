import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatAPI, matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket = null;

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [icebreaker, setIcebreaker] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

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

    socket = io('http://localhost:5000', {
      auth: { token },
    });

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

    try {
      await chatAPI.sendMessage({
        matchId,
        content: messageContent,
      });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (isTyping) => {
    socket?.emit('typing', { matchId, isTyping });
  };

  const getOtherUser = (match) => {
    if (!match?.users) return null;
    return match.users.find(u => u.id !== user?.id);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (!matchId) {
    return (
      <div className="chat-page">
        <div className="conversations-panel">
          <h2 className="chat-heading">Messages</h2>
          {conversations.length > 0 ? (
            conversations.map(conv => {
              const other = conv.otherUser;
              return (
                <Link to={`/chat/${conv.match.id}`} key={conv.match.id} className="conversation-item">
                  <div className="avatar">
                    {other?.photos?.[0]?.url ? (
                      <img src={other.photos[0].url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : other?.name?.[0]}
                  </div>
                  <div className="conversation-info">
                    <strong>{other?.name || 'Unknown'}</strong>
                    {other?.headline && <p className="conversation-meta">{other.headline}</p>}
                    <p className="conversation-last">
                      {conv.lastMessage
                        ? conv.lastMessage.content.substring(0, 40)
                        : 'Start chatting!'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </Link>
              );
            })
          ) : (
            <div className="empty-state">
              <h3>No conversations</h3>
              <p>Connect with someone to start collaborating!</p>
              <Link to="/matches" className="btn btn-primary">Find Connections</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentConv = conversations.find(c => c.match.id === matchId);
  const otherUser = currentConv?.otherUser;

  return (
    <div className="chat-page chat-active">
      <div className="conversations-panel">
        <h2 className="chat-heading">Messages</h2>
        {conversations.map(conv => {
          const other = conv.otherUser;
          return (
            <Link to={`/chat/${conv.match.id}`} key={conv.match.id}
              className={`conversation-item ${conv.match.id === matchId ? 'active' : ''}`}>
              <div className="avatar">
                {other?.photos?.[0]?.url ? (
                  <img src={other.photos[0].url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : other?.name?.[0]}
              </div>
              <div className="conversation-info">
                <strong>{other?.name}</strong>
                <p className="conversation-last">{conv.lastMessage?.content?.substring(0, 30) || ''}</p>
              </div>
              {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
            </Link>
          );
        })}
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <Link to="/chat" className="back-btn">←</Link>
          <div className="avatar avatar-sm">
            {otherUser?.photos?.[0]?.url ? (
              <img src={otherUser.photos[0].url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : otherUser?.name?.[0]}
          </div>
          <div className="chat-header-info">
            <strong>{otherUser?.name}</strong>
            {otherUser?.headline && <p className="chat-header-headline">{otherUser.headline}</p>}
            <p className="online-status">{otherUser?.isOnline ? 'Online' : 'Offline'}</p>
          </div>
          {otherUser?.skills?.length > 0 && (
            <div className="chat-header-skills">
              {otherUser.skills.slice(0, 3).map(s => <span key={s} className="tag-skill">{s}</span>)}
            </div>
          )}
        </div>

        <div className="chat-messages">
          {icebreaker && messages.length === 0 && (
            <div className="icebreaker-box">
              <p className="icebreaker-label">💡 Conversation starter based on shared skills:</p>
              <p className="icebreaker-text">{icebreaker.prompt}</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender.id === user?.id ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender.id === user?.id && (
                    <span className="read-status">{msg.isRead ? ' ✓✓' : ' ✓'}</span>
                  )}
                </span>
              </div>
            </div>
          ))}

          {Object.values(typingUsers).some(Boolean) && (
            <div className="typing-indicator">Someone is typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
            placeholder="Type a message..."
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!newMessage.trim()}>Send</button>
        </form>
      </div>

      <style>{`
        .chat-page { display: flex; gap: 0; height: calc(100vh - 110px); margin: -20px; max-width: none; }
        .chat-active .conversations-panel { width: 320px; border-right: 1px solid var(--border); overflow-y: auto; }
        .chat-heading { padding: 20px; font-size: 20px; border-bottom: 1px solid var(--border); }
        .conversation-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; transition: background 0.2s; }
        .conversation-item:hover, .conversation-item.active { background: rgba(74,108,247,0.05); }
        .conversation-info { flex: 1; min-width: 0; }
        .conversation-meta { font-size: 12px; color: var(--primary); }
        .conversation-last { color: var(--text-light); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .unread-badge { background: var(--primary); color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 10px; }
        .chat-main { flex: 1; display: flex; flex-direction: column; }
        .chat-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--card); }
        .chat-header-info { flex-shrink: 0; }
        .chat-header-headline { font-size: 12px; color: var(--primary); }
        .chat-header-skills { display: flex; gap: 4px; margin-left: auto; }
        .back-btn { display: none; font-size: 20px; color: var(--primary); }
        .online-status { font-size: 12px; color: var(--success); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .icebreaker-box { background: rgba(74,108,247,0.05); padding: 16px; border-radius: var(--radius); margin-bottom: 16px; text-align: center; }
        .icebreaker-label { font-size: 13px; color: var(--text-light); margin-bottom: 4px; }
        .icebreaker-text { font-weight: 500; }
        .message { max-width: 70%; }
        .message.sent { align-self: flex-end; }
        .message.received { align-self: flex-start; }
        .message-bubble { padding: 10px 16px; border-radius: 18px; position: relative; }
        .message.sent .message-bubble { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-bottom-right-radius: 4px; }
        .message.received .message-bubble { background: var(--card); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
        .message-time { font-size: 11px; opacity: 0.7; display: block; text-align: right; margin-top: 4px; }
        .read-status { font-size: 12px; }
        .typing-indicator { font-size: 13px; color: var(--text-light); padding: 8px 0; }
        .chat-input { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--border); background: var(--card); }
        .chat-input input { flex: 1; padding: 12px 16px; border: 2px solid var(--border); border-radius: 24px; outline: none; }
        .chat-input input:focus { border-color: var(--primary); }
        @media (max-width: 768px) {
          .chat-page { flex-direction: column; }
          .chat-active .conversations-panel { width: 100%; height: auto; max-height: 200px; }
          .back-btn { display: block; }
        }
      `}</style>
    </div>
  );
}
