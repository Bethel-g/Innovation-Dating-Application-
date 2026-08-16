import { useState, useRef, useEffect } from 'react';

const QUICK_ACTIONS = [
  { id: 'cofounder', label: 'Find a co-founder', icon: '🚀', prompt: 'I want to find a co-founder for my startup' },
  { id: 'profile', label: 'Improve my profile', icon: '✨', prompt: 'Help me improve my professional profile' },
  { id: 'mentor', label: 'Find a mentor', icon: '🎓', prompt: 'I need a mentor in my field' },
  { id: 'collaborators', label: 'Find collaborators', icon: '🤝', prompt: 'I want to find collaborators for a project' },
  { id: 'projects', label: 'Find projects', icon: '📂', prompt: 'Show me interesting projects to join' },
  { id: 'post', label: 'Write a post', icon: '📝', prompt: 'Help me write a professional post' },
  { id: 'cv', label: 'Improve my CV', icon: '📄', prompt: 'Analyze and improve my CV/resume' },
  { id: 'jobs', label: 'Find jobs', icon: '💼', prompt: 'Find job opportunities matching my skills' },
];

const AI_RESPONSES = {
  default: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('co-founder') || lower.includes('cofounder')) {
      return {
        text: "I'd be happy to help you find a co-founder! To give you the best matches, tell me more about your startup idea.",
        followUp: "What industry or problem space are you focused on?",
      };
    }
    if (lower.includes('healthcare') || lower.includes('ai') || lower.includes('startup')) {
      return {
        text: "Great choice! I found 12 potential collaborators for your AI healthcare startup.\n\n🎯 **3 Highly Compatible:**\n• **94%** — Healthcare + ML + Startup experience\n• **91%** — Backend Engineering + Healthcare domain\n• **87%** — Product Management + UX Design\n\n📊 **9 More Matches** with complementary skills.\n\nWould you like me to connect you with any of these professionals?",
        collaborators: [
          { name: 'Dr. Aisha Mohammed', role: 'ML Engineer', score: 94, skills: ['Healthcare AI', 'Python', 'TensorFlow'] },
          { name: 'James Okafor', role: 'Backend Developer', score: 91, skills: ['Node.js', 'Healthcare APIs', 'PostgreSQL'] },
          { name: 'Sara Chen', role: 'Product Designer', score: 87, skills: ['UX Research', 'Healthcare UX', 'Figma'] },
        ],
      };
    }
    if (lower.includes('profile') || lower.includes('improve')) {
      return {
        text: "I've analyzed your profile. Here's my assessment:\n\n📊 **Profile Score: 78%**\n\n✅ **Strengths:**\n• Strong technical skills listed\n• Active in community\n\n⚠️ **Areas to Improve:**\n• Add a professional headline\n• Include portfolio links\n• Add 2-3 more skills\n• Write a compelling bio\n\nWould you like me to help you draft a bio or suggest skills to add?",
      };
    }
    if (lower.includes('mentor')) {
      return {
        text: "I can help you find the perfect mentor! Based on your profile, here are my top recommendations:\n\n🎓 **Top Mentor Matches:**\n• **Dr. Fatima Al-Rashid** — 15 years in AI/ML, available for mentoring\n• **Michael Chen** — Startup founder, 3 exits, mentors weekly\n• **Priya Sharma** — Engineering leader at FAANG, specializes in career growth\n\nAll three have excellent reviews and are actively mentoring. Shall I book an intro session?",
      };
    }
    if (lower.includes('collaborat')) {
      return {
        text: "Let me find collaborators for you! What kind of project are you working on?",
        followUp: "Describe your project and I'll find the best matches.",
      };
    }
    if (lower.includes('job') || lower.includes('hire')) {
      return {
        text: "I found job opportunities that match your profile:\n\n💼 **Recommended Jobs:**\n• **Senior AI Engineer** — TechCorp (Remote, $120-150k)\n• **ML Engineer** — HealthAI (Addis Ababa, Competitive)\n• **Full-Stack Developer** — StartupX (Remote, Equity)\n\nAll match 85%+ of your skills. Want me to help you apply?",
      };
    }
    if (lower.includes('post') || lower.includes('write')) {
      return {
        text: "I'd love to help you write a post! What topic would you like to cover?\n\nHere are some trending topics:\n• AI in African tech\n• Startup lessons learned\n• Remote work tips\n• Tech career advice\n\nPick one or tell me your own topic!",
      };
    }
    if (lower.includes('cv') || lower.includes('resume')) {
      return {
        text: "Upload your CV and I'll analyze it!\n\nI'll check:\n• Skills alignment\n• Experience presentation\n• Project descriptions\n• Keywords for ATS\n• Overall impact score\n\nYou can also paste your resume text here.",
      };
    }
    if (lower.includes('project')) {
      return {
        text: "Here are trending projects looking for collaborators:\n\n🔥 **Trending Projects:**\n• **AI-Powered Diagnosis** — Healthcare, needs ML engineer\n• **GreenTech App** — Sustainability, needs React developer\n• **EdTech Platform** — Education, needs full-stack dev\n\nWant me to show more details on any of these?",
      };
    }
    return {
      text: `I understand you're asking about "${input}". Let me help you with that!\n\nI can assist with:\n• Finding co-founders, mentors, or collaborators\n• Improving your profile\n• Job recommendations\n• Writing posts\n• Project matching\n\nWhat would you like to explore?`,
    };
  },
};

export default function AIAssistant({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your Innovation Assistant 🤖\n\nI can help you find co-founders, mentors, collaborators, improve your profile, and more. What would you like to do?" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (text) => {
    const message = text || input;
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = AI_RESPONSES.default(message);
      setMessages(prev => [...prev, { role: 'assistant', ...response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleQuickAction = (action) => {
    handleSend(action.prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div className="ai-assistant" onClick={e => e.stopPropagation()}>
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">
              <span>🤖</span>
            </div>
            <div>
              <h3>Innovation Assistant</h3>
              <span className="ai-status">Online</span>
            </div>
          </div>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ${msg.role}`}>
              {msg.role === 'assistant' && <div className="ai-msg-avatar">🤖</div>}
              <div className="ai-msg-content">
                <div className="ai-msg-text" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                {msg.collaborators && (
                  <div className="ai-collaborators">
                    {msg.collaborators.map((c, j) => (
                      <div key={j} className="ai-collab-card">
                        <div className="ai-collab-info">
                          <strong>{c.name}</strong>
                          <span className="ai-collab-role">{c.role}</span>
                        </div>
                        <span className="ai-collab-score">{c.score}%</span>
                        <div className="ai-collab-skills">
                          {c.skills.map(s => <span key={s} className="tag-skill tag-xs">{s}</span>)}
                        </div>
                        <button className="btn btn-primary btn-xs">Connect</button>
                      </div>
                    ))}
                  </div>
                )}
                {msg.followUp && (
                  <div className="ai-follow-up">{msg.followUp}</div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="ai-message assistant">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-msg-content">
                <div className="ai-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="ai-quick-actions">
            {QUICK_ACTIONS.map(action => (
              <button key={action.id} className="ai-quick-btn" onClick={() => handleQuickAction(action)}>
                <span className="ai-quick-icon">{action.icon}</span>
                <span className="ai-quick-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="ai-input-area">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
          />
          <button className="ai-send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        .ai-assistant-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
        .ai-assistant { width: 100%; max-width: 480px; height: 700px; max-height: 90vh; background: var(--card); border-radius: var(--radius-xl); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }

        .ai-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .ai-header-left { display: flex; align-items: center; gap: 12px; }
        .ai-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .ai-header h3 { font-size: 16px; margin: 0; color: #fff; }
        .ai-status { font-size: 12px; opacity: 0.8; }
        .ai-close { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; transition: background 0.2s; }
        .ai-close:hover { background: rgba(255,255,255,0.3); }

        .ai-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ai-message { display: flex; gap: 8px; max-width: 85%; }
        .ai-message.user { align-self: flex-end; flex-direction: row-reverse; }
        .ai-msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .ai-msg-content { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .ai-message.assistant .ai-msg-content { background: var(--bg-secondary); border-bottom-left-radius: 4px; }
        .ai-message.user .ai-msg-content { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-bottom-right-radius: 4px; }

        .ai-collaborators { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .ai-collab-card { padding: 10px; background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); }
        .ai-collab-info { display: flex; justify-content: space-between; align-items: center; }
        .ai-collab-info strong { font-size: 13px; }
        .ai-collab-role { font-size: 12px; color: var(--text-light); }
        .ai-collab-score { font-size: 16px; font-weight: 700; color: var(--primary); }
        .ai-collab-skills { display: flex; gap: 4px; flex-wrap: wrap; margin: 6px 0; }
        .ai-follow-up { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text-light); font-style: italic; }

        .ai-typing { display: flex; gap: 4px; padding: 4px 0; }
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-light); animation: typing 1.4s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

        .ai-quick-actions { padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px solid var(--border); }
        .ai-quick-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; cursor: pointer; font-size: 12px; transition: all 0.2s; white-space: nowrap; }
        .ai-quick-btn:hover { border-color: var(--primary); background: rgba(74,108,247,0.05); }
        .ai-quick-icon { font-size: 14px; }

        .ai-input-area { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); align-items: flex-end; }
        .ai-input-area textarea { flex: 1; resize: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-size: 14px; font-family: inherit; outline: none; max-height: 100px; background: var(--bg-secondary); }
        .ai-input-area textarea:focus { border-color: var(--primary); }
        .ai-send-btn { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; flex-shrink: 0; }
        .ai-send-btn:hover { transform: scale(1.05); }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .tag-xs { font-size: 10px; padding: 2px 6px; }
        .btn-xs { padding: 4px 10px; font-size: 11px; }

        @media (max-width: 520px) {
          .ai-assistant-overlay { padding: 0; }
          .ai-assistant { max-width: 100%; height: 100%; max-height: 100%; border-radius: 0; }
        }
      `}</style>
    </div>
  );
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}
