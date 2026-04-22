import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FeedbackBox() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/feedback', { text: text.trim() });
      setSubmitted(true);
      setText('');
      toast.success('Feedback received! Our scouts are on it.');
    } catch (err) {
      toast.error('Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
        <h4 style={{ margin: 0 }}>Thanks for the feedback!</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Your input helps us build a better assistant. Keep goin' yard!</p>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setSubmitted(false)}>Send another note</button>
      </div>
    );
  }

  return (
    <div className="card feedback-box" style={{ padding: 12, marginBottom: 12, background: 'rgba(255,255,255,0.05)' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>📬 Suggestion Box</h4>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Found a bug or have an idea?</p>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?..."
          style={{ width: '100%', marginBottom: 12 }}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px', fontSize: 12 }} disabled={loading || !text.trim()}>
          {loading ? '...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
