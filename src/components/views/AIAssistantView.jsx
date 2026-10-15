import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUrbanData } from '../../services/UrbanDataContext';
import { streamGLMResponse, GLM_MODEL_INFO } from '../../services/glmService';
import { DETECTION_CATEGORIES } from '../../services/detectionService';
import { Bot, Send, User, RefreshCcw, LoaderCircle, CheckCircle2, Cpu, MessageSquare, X } from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '🕳️ Pothole hotspots',         text: 'Which routes have the most potholes right now? List the top 3 with locations.' },
  { label: "📊 Today's incident summary",  text: "Summarize today's incident load across all city departments with priority breakdown." },
  { label: '🌊 Waterlogging alerts',       text: 'Where are the active waterlogging and storm drain overflow alerts? What action is recommended?' },
  { label: '🚦 Traffic congestion',        text: 'Identify current traffic congestion hotspots and suggest diversion routes for the bus fleet.' },
  { label: '🚌 Fleet efficiency',          text: 'How is the fleet performing today? Which buses have the most detections?' },
  { label: '⚡ SLA at risk',               text: 'Which open incidents are at risk of breaching their SLA deadline?' },
  { label: '🗑️ Sanitation analysis',      text: 'Analyze the sanitation and garbage collection status. Where does SMC need to prioritize deployment?' },
  { label: '🏆 Next best action',          text: 'Based on current detections and incidents, what is the single most important action right now?' },
];

function buildSystemPrompt({ buses, detections, incidents, stats }) {
  const catCounts = {};
  detections.forEach(d => {
    const k = (d.type ?? d.category ?? 'unknown').toLowerCase().replace(/[^a-z_]/g, '_');
    catCounts[k] = (catCounts[k] ?? 0) + 1;
  });
  const catSummary = Object.entries(catCounts).sort(([,a],[,b])=>b-a).slice(0,7)
    .map(([k,v])=>`${k}:${v}`).join(', ');

  return `You are FleetVision-AI, the urban operations analyst for Srinagar Municipal Corporation's smart bus sensing fleet (SIH 2026).

LIVE DATA (${new Date().toLocaleTimeString()}):
- Active buses: ${buses.filter(b=>b.status==='Active Sensing').length}/${buses.length}
- YOLO11 detections today: ${detections.length} | Open incidents: ${incidents.filter(i=>i.status!=='Resolved').length}
- Avg confidence: ${stats.avgConfidence??92}% | Road Quality Index: ${stats.roadConditionIndex??81}/100
- Detection breakdown: ${catSummary}

YOLO11 CATEGORIES (13): ${Object.values(DETECTION_CATEGORIES).map(c=>`${c.key}→${c.dept}`).join(', ')}

GUIDELINES: Be concise and actionable. Always mention responsible dept (SMC/RNB/TRAFFIC/UEED/PDD) and SLA urgency.`;
}

export const AIAssistantView = () => {
  const { buses, detections, incidents, stats } = useUrbanData();
  const [messages, setMessages] = useState([{
    id: 1, sender: 'ai', isStreaming: false,
    text: `Hello! I am FleetVision-AI powered by ${GLM_MODEL_INFO.name}.\n\nI have live access to your YOLO11 detection feed, fleet telemetry and incident tickets. Ask me anything about road conditions, fleet status or what action to take next.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput]       = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = useCallback(async (queryText) => {
    const q = (queryText ?? input).trim();
    if (!q || isThinking) return;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
    setIsThinking(true);
    const streamId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: streamId, sender: 'ai', text: '', isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    try {
      await streamGLMResponse(
        { prompt: q, systemPrompt: buildSystemPrompt({ buses, detections, incidents, stats }) },
        (partial) => setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: partial } : m)),
        () => { setMessages(prev => prev.map(m => m.id === streamId ? { ...m, isStreaming: false } : m)); setIsThinking(false); }
      );
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === streamId ? {
        ...m, isStreaming: false,
        text: `⚠️ GLM-4.5V unavailable.\n\n${err.message}\n\nAdd GLM_API_KEY to server/.env and restart with: npm run server`,
      } : m));
      setIsThinking(false);
    }
  }, [input, isThinking, buses, detections, incidents, stats]);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-4 p-5 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="card p-4 flex items-center justify-between gap-4 shrink-0 theme-transition">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ background: 'linear-gradient(135deg,#16a34a,#0f766e)' }}>
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>FleetVision AI Assistant</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }}>
                {GLM_MODEL_INFO.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }}>
                Vision + Text
              </span>
            </div>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {GLM_MODEL_INFO.provider} · {GLM_MODEL_INFO.contextWindow.toLocaleString()} token context · JSON mode
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[11px] font-bold"
            style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {detections.length} detections · {incidents.filter(i=>i.status!=='Resolved').length} open
          </span>
          <button onClick={() => setMessages(prev => [prev[0]])}
            className="p-2 rounded-xl theme-transition"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card-alt)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 card overflow-hidden theme-transition">
        <div className="h-full overflow-y-auto p-4 md:p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender==='user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-1 shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#0f766e)' }}>
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className="max-w-2xl rounded-2xl p-4 shadow-xs"
                style={msg.sender === 'user'
                  ? { background: 'linear-gradient(135deg,var(--accent-green),#15803d)', color: '#fff', border: '1px solid var(--accent-green-border)' }
                  : { background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
                }>
                <div className="flex items-center justify-between gap-4 pb-2 mb-2 text-[10px] font-mono uppercase tracking-wide opacity-70"
                  style={{ borderBottom: msg.sender==='user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)' }}>
                  <span className="flex items-center gap-1.5">
                    {msg.sender==='ai' ? <><Cpu className="w-3 h-3"/>{GLM_MODEL_INFO.name}</> : <><User className="w-3 h-3"/>Operator</>}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-sm font-sans">
                  {msg.text || (msg.isStreaming && (
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-green)' }}/>
                      GLM-4.5V generating…
                    </span>
                  ))}
                  {msg.isStreaming && msg.text && (
                    <span className="inline-block w-1 h-4 ml-0.5 rounded-sm animate-pulse"
                      style={{ backgroundColor: 'var(--accent-green)' }} />
                  )}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
                  style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }}>
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {QUICK_PROMPTS.map((qp, i) => (
          <button key={i} onClick={() => handleSend(qp.text)} disabled={isThinking}
            className="px-3 py-1.5 rounded-full text-xs theme-transition disabled:opacity-40"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-green-border)'; e.currentTarget.style.color='var(--accent-green)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }}
        className="card p-2 flex items-center gap-2 shrink-0 theme-transition">
        <MessageSquare className="w-4 h-4 ml-2 shrink-0" style={{ color: 'var(--text-muted)' }} />
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder={`Ask ${GLM_MODEL_INFO.name} about incidents, detections, fleet status…`}
          disabled={isThinking}
          className="flex-1 px-3 py-3 bg-transparent text-sm outline-none disabled:opacity-50"
          style={{ color: 'var(--text-primary)' }} />
        {isThinking && (
          <span className="text-[11px] font-mono flex items-center gap-1.5 shrink-0" style={{ color: 'var(--accent-green)' }}>
            <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> Thinking…
          </span>
        )}
        <button type="submit" disabled={isThinking || !input.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm disabled:opacity-40 theme-transition"
          style={{ background: 'linear-gradient(135deg,var(--accent-green),#15803d)' }}>
          <Send className="w-4 h-4" /> Ask AI
        </button>
      </form>
    </div>
  );
};
