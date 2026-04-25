import React, { useState, useRef, useEffect } from 'react';
import '../styles/ScoopBot.css';

/* ── Demo Q&A pairs ─────────────────────────────────────────── */
const DEMO_QA = [
  {
    q: 'Why is Caramel Syrup flagged as urgent?',
    a: 'Caramel Syrup has only 10 L in stock, but April 2026 production requires ~12.2 L. With a 10-day lead time from Sethness, you need to order immediately to avoid a 2.2 L shortage that would halt Caramel production mid-month. 🔴 Order today.',
  },
  {
    q: 'Which months have over-capacity risk?',
    a: 'May, June, and July 2026 are all over-capacity:\n• May 2026 — 132% utilisation (1,980 L demand vs 1,500 L capacity)\n• June 2026 — 141% (worst peak month)\n• July 2026 — 137%\n\nRecommendation: Pre-build inventory in March–April to buffer the summer peak.',
  },
  {
    q: 'What should I order this week?',
    a: 'Based on April 2026 raw-material gaps:\n🔴 Caramel Syrup — order 2.2 L from Sethness (10-day lead, urgent)\n🟠 Sugar — order 16 kg from EID Parry (7-day lead, soon)\n\nAll other ingredients (Milk Powder, Fresh Cream, Stabilizer, Vanilla Essence, Mint Flavor, Cocoa Powder) have sufficient stock for the month.',
  },
  {
    q: 'How many days of cover does Vanilla have?',
    a: 'Vanilla currently holds 420 L in stock. At April\'s daily burn rate of ~18.5 L/day, that\'s approximately 22.7 days of cover — classified 🔵 Surplus. Line 1 and Line 3 are assigned to Vanilla production this week. No immediate action needed.',
  },
  {
    q: 'What is the demand forecast for May 2026?',
    a: 'May 2026 forecast: ~1,960 L total demand (132% of 1,500 L capacity).\n\nChannel split:\n• Parlor: 35%\n• Retail: 28%\n• HoReCa: 22%\n• E-Commerce: 15%\n\nRecommend pre-building ≈ 460 L of inventory in April to avoid stockouts.',
  },
  {
    q: 'Are there any cold-chain incidents?',
    a: 'Yes — 1 temperature incident flagged:\n\nChennai cold store: recorded −16.2 °C (above −18 °C threshold) for 5 hours on Mint batch #CHN-2026-004 (420 L). This batch is marked for accelerated FIFO rotation. No other abuse incidents in the current period. ✅ All other cold stores within spec.',
  },
];

const SUGGESTED = DEMO_QA.slice(0, 3);

/* ── Component ───────────────────────────────────────────────── */
const ScoopBot = () => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);

    const match = DEMO_QA.find(qa => qa.q === trimmed);
    const answer = match
      ? match.a
      : "I can help with demand forecasting, inventory levels, raw-material procurement, cold-chain monitoring, and production planning. Try one of the suggested questions below, or ask me anything about your Graviss Foods supply chain!";

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    }, 700 + Math.random() * 500);
  };

  return (
    <>
      {/* ── Floating Action Button ──────────────────────────── */}
      <button
        className={`sb-fab ${open ? 'sb-fab-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open ScoopBot AI assistant"
      >
        <span className="sb-fab-icon">💬</span>
        <span className="sb-fab-label">ScoopBot</span>
      </button>

      {/* ── Chat Panel ─────────────────────────────────────── */}
      <div className={`sb-panel ${open ? 'sb-panel-open' : ''}`} role="dialog" aria-label="ScoopBot chat">
        {/* Header */}
        <div className="sb-header">
          <div className="sb-header-text">
            <div className="sb-copilot-label">AI COPILOT</div>
            <div className="sb-title">ScoopBot</div>
          </div>
          <button className="sb-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>

        {/* Messages */}
        <div className="sb-messages">
          {messages.length === 0 && (
            <div className="sb-intro-bubble">
              Ask about forecast drivers, stock risk, procurement gaps, cold-chain incidents, or over-capacity months.
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`sb-msg-row ${msg.role === 'user' ? 'sb-msg-user' : 'sb-msg-bot'}`}>
              {msg.role === 'bot' && <div className="sb-bot-avatar">🍦</div>}
              <div className="sb-bubble">
                {msg.text.split('\n').map((line, j) => (
                  <React.Fragment key={j}>
                    {line}
                    {j < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {typing && (
            <div className="sb-msg-row sb-msg-bot">
              <div className="sb-bot-avatar">🍦</div>
              <div className="sb-bubble sb-typing-bubble">
                <span className="sb-dot" /><span className="sb-dot" /><span className="sb-dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested questions */}
        <div className="sb-suggestions">
          <div className="sb-suggestions-label">Try asking:</div>
          <div className="sb-suggestions-list">
            {SUGGESTED.map((qa, i) => (
              <button key={i} className="sb-suggest-btn" onClick={() => sendMessage(qa.q)}>
                {qa.q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="sb-input-row">
          <input
            ref={inputRef}
            className="sb-input"
            placeholder="Ask about procurement, stockouts, forecast drivers, cold-chain..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          />
          <button
            className="sb-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
};

export default ScoopBot;
