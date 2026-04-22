import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AiQuestionBox({ context, leagueKey, isPro, title = "Ask a Follow-up", icon = "🧠", placeholder = "Ask a specific question about these results..." }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || !isPro) return;

    setLoading(true);
    setAnswer('');
    try {
      const { data } = await axios.post('/api/claude/ask', {
        question: question.trim(),
        context,
        league_key: leagueKey
      });
      setAnswer(data.answer);
      setQuestion('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-question-box card" style={{ 
      marginTop: 24, 
      border: isPro ? '1px solid rgba(0, 168, 107, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', 
      background: isPro ? 'rgba(0, 168, 107, 0.03)' : 'rgba(255, 255, 255, 0.02)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {!isPro && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(12, 29, 53, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, textAlign: 'center', padding: 20
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
          <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Pro Feature</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Unlock interactive follow-up analysis with a Season Pass.</p>
          <a href="/upgrade" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Upgrade Now</a>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: 18 }}>{title}</h4>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, opacity: isPro ? 1 : 0.3 }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isPro ? placeholder : "Upgrade to ask follow-up questions..."}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(12, 29, 53, 0.5)', color: 'white' }}
          disabled={loading || !isPro}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !question.trim() || !isPro} style={{ padding: '0 24px' }}>
          {loading ? '...' : 'Send'}
        </button>
      </form>

      {answer && (
        <div style={{ marginTop: 20, padding: 20, borderRadius: 12, background: 'rgba(0, 0, 0, 0.3)', borderLeft: '4px solid #00a86b' }}>
          <div style={{ fontSize: 13, color: '#00a86b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scout's Follow-up:</div>
          <div className="ai-response" style={{ fontSize: 15, lineHeight: 1.6 }}>{answer}</div>
        </div>
      )}
    </div>
  );
}
