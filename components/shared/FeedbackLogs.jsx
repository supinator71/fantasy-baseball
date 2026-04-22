import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FeedbackLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/feedback')
      .then(res => {
        setLogs(res.data.reverse()); // Show newest first
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>📬 Scout Logs</h1>
      <p style={{ color: '#7aafc4', marginBottom: 24 }}>Community thoughts, feature ideas, and bug reports.</p>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#7aafc4' }}>No feedback logs yet. The suggestion box is open!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {logs.map((log, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <span className="badge badge-util" style={{ fontSize: 10 }}>
                  User: {log.yahoo_guid?.slice(0, 8) || 'Anonymous'}
                </span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-main)' }}>
                {log.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
