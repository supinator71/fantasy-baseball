import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AiQuestionBox({ context, leagueKey, title = "Ask a Follow-up", icon = "🧠", placeholder = "Ask a specific question about these results..." }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;

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
    <div className="ai-question-box card" style={{ marginTop: 24, border: '1px solid rgba(0, 168, 107, 0.2)', background: 'rgba(0, 168, 107, 0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: 18 }}>{title}</h4>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(12, 29, 53, 0.5)', color: 'white' }}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()} style={{ padding: '0 24px' }}>
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
