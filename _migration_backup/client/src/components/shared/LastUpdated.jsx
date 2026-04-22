import React, { useState, useEffect } from 'react'

function timeAgo(isoString) {
  if (!isoString) return null
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

// TTL labels shown to user
const TTL_LABELS = {
  5:  '5 min cache',
  15: '15 min cache',
  30: '30 min cache',
}

export default function LastUpdated({ cachedAt, fromCache, ttlLabel, onRefresh, loading }) {
  const [, tick] = useState(0)

  // Re-render every 30s so the "X ago" label stays fresh
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const ago = timeAgo(cachedAt)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {ago && (
        <span style={{ fontSize: 11, color: fromCache ? '#4a7a94' : '#00a86b' }}>
          {fromCache ? `⚡ Cached · ${ago}` : `✓ Live · ${ago}`}
          {ttlLabel && <span style={{ color: '#2d5a6e', marginLeft: 4 }}>({ttlLabel})</span>}
        </span>
      )}
      <button
        className="btn btn-ghost"
        style={{ fontSize: 11, padding: '3px 10px', minHeight: 'unset', lineHeight: 1.4 }}
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? '...' : '↻ Refresh'}
      </button>
    </div>
  )
}
