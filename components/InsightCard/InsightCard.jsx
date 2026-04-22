/**
 * InsightCard — Shared rich renderer for structured Claude AI analysis.
 * Handles both new object shape AND legacy string shape so no module breaks.
 *
 * Usage:
 *   <InsightCard data={aiAnalysis.waiver} type="waiver" loading={aiLoading} />
 *   <InsightCard data={aiAnalysis.pitching} type="pitching" loading={aiLoading} />
 */

import React from 'react';
import styles from './InsightCard.module.css';

const TYPE_CONFIG = {
  waiver:   { icon: '⚡', label: 'Waiver Wire Intel',    accent: '#4aafdb' },
  startSit: { icon: '📋', label: 'Start / Sit',          accent: '#22c55e' },
  pitching: { icon: '⚾', label: 'Pitching Intel',        accent: '#a855f7' },
  audit:    { icon: '🔍', label: 'Team Audit',            accent: '#f59e0b' },
  gameplan: { icon: '🎯', label: 'Weekly Game Plan',      accent: '#ef4444' },
  matchup:  { icon: '⚔️', label: 'Matchup Outlook',       accent: '#06b6d4' },
};

const PRIORITY_STYLES = {
  critical: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444', label: '🔴 CRITICAL' },
  high:     { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#f59e0b', label: '🟡 HIGH' },
  medium:   { bg: 'rgba(74,175,219,0.1)',  border: '#4aafdb', text: '#4aafdb', label: '🔵 MEDIUM' },
};

function PlayerBadge({ action, player, position, team, reason, accentColor }) {
  const isAdd  = action === 'ADD'   || action === 'add';
  const isDrop = action === 'DROP'  || action === 'drop';
  const isStart= action === 'START' || action === 'start';
  const isSit  = action === 'SIT'   || action === 'sit';
  const isStream = action === 'STREAM' || action === 'stream';
  const isAvoid  = action === 'AVOID'  || action === 'avoid';

  const color = isAdd || isStart || isStream
    ? '#22c55e'
    : isDrop || isSit || isAvoid
    ? '#ef4444'
    : accentColor;

  const label = isAdd ? '+ ADD' : isDrop ? '− DROP' : isStart ? '▶ START' : isSit ? '⏸ SIT'
    : isStream ? '🌊 STREAM' : isAvoid ? '⛔ AVOID' : action?.toUpperCase() || '';

  return (
    <div className={styles.playerBadge} style={{ borderColor: color }}>
      <span className={styles.actionTag} style={{ background: color }}>{label}</span>
      <div className={styles.playerInfo}>
        <span className={styles.playerName}>{player}</span>
        {(position || team) && (
          <span className={styles.playerMeta}>{[position, team].filter(Boolean).join(' · ')}</span>
        )}
      </div>
      {reason && <p className={styles.playerReason}>{reason}</p>}
    </div>
  );
}

function renderWaiver(data, accent) {
  return (
    <>
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      {data.adds?.length > 0 && (
        <div className={styles.actionGroup}>
          {data.adds.map((a, i) => (
            <PlayerBadge key={i} action="ADD" player={a.player} position={a.position} team={a.team} reason={a.reason} accentColor={accent} />
          ))}
        </div>
      )}
      {data.drops?.length > 0 && (
        <div className={styles.actionGroup}>
          {data.drops.map((d, i) => (
            <PlayerBadge key={i} action="DROP" player={d.player} position={d.position} reason={d.reason} accentColor={accent} />
          ))}
        </div>
      )}
    </>
  );
}

function renderStartSit(data, accent) {
  return (
    <>
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      <div className={styles.twoCol}>
        {data.starts?.length > 0 && (
          <div>
            {data.starts.map((s, i) => (
              <PlayerBadge key={i} action="START" player={s.player} position={s.position} reason={s.reason} accentColor={accent} />
            ))}
          </div>
        )}
        {data.sits?.length > 0 && (
          <div>
            {data.sits.map((s, i) => (
              <PlayerBadge key={i} action="SIT" player={s.player} position={s.position} reason={s.reason} accentColor={accent} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function renderPitching(data, accent) {
  return (
    <>
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      {data.twoStarters?.length > 0 && (
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>🏆 2-Start Lock</span>
          {data.twoStarters.map((name, i) => (
            <span key={i} className={styles.chip} style={{ borderColor: accent, color: accent }}>{name}</span>
          ))}
        </div>
      )}
      {data.stream?.player && (
        <PlayerBadge action="STREAM" player={data.stream.player} reason={data.stream.reason} accentColor={accent} />
      )}
      {data.avoid?.player && (
        <PlayerBadge action="AVOID" player={data.avoid.player} reason={data.avoid.reason} accentColor={accent} />
      )}
    </>
  );
}

function renderAudit(data, accent) {
  return (
    <>
      <div className={styles.gradeRow}>
        <div className={styles.gradeBadge} style={{ borderColor: accent, color: accent }}>{data.grade || '?'}</div>
        {data.topPlayer && (
          <div className={styles.topPlayerPill}>
            <span className={styles.topPlayerName}>⭐ {data.topPlayer.name}</span>
            <span className={styles.topPlayerStat}>{data.topPlayer.statLine}</span>
          </div>
        )}
      </div>
      {data.strength && (
        <div className={styles.auditLine} style={{ borderColor: '#22c55e' }}>
          <span className={styles.auditIcon}>💪</span>
          <span>{data.strength}</span>
        </div>
      )}
      {data.weakness && (
        <div className={styles.auditLine} style={{ borderColor: '#ef4444' }}>
          <span className={styles.auditIcon}>⚠️</span>
          <span>{data.weakness}</span>
        </div>
      )}
    </>
  );
}

function renderGameplan(data, accent) {
  const pri = PRIORITY_STYLES[data.priority] || PRIORITY_STYLES.medium;
  return (
    <>
      {data.priority && (
        <span className={styles.priorityTag} style={{ background: pri.bg, color: pri.text, border: `1px solid ${pri.border}` }}>
          {pri.label}
        </span>
      )}
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
      {data.steps?.length > 0 && (
        <ol className={styles.stepList}>
          {data.steps.map((step, i) => (
            <li key={i} className={styles.stepItem}>
              <span className={styles.stepNum} style={{ background: accent }}>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function renderMatchup(data, accent) {
  return (
    <>
      {data.edge && (
        <div className={styles.edgeBadge} style={{ borderColor: accent, color: accent }}>
          ⚔️ Edge: {data.edge}
        </div>
      )}
      {data.summary && <p className={styles.summary}>{data.summary}</p>}
    </>
  );
}

const RENDERERS = { waiver: renderWaiver, startSit: renderStartSit, pitching: renderPitching, audit: renderAudit, gameplan: renderGameplan, matchup: renderMatchup };

export default function InsightCard({ data, type = 'waiver', loading = false, onRefresh }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.waiver;
  const accent = config.accent;

  // Backward-compat: if data is a plain string, render it as a paragraph
  const isLegacyString = typeof data === 'string';
  const headline = isLegacyString ? null : data?.headline;
  const bodyData = isLegacyString ? null : data;

  const renderBody = RENDERERS[type];

  return (
    <div className={styles.card} style={{ borderLeftColor: accent }}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>{config.icon}</span>
          <h4 className={styles.title} style={{ color: accent }}>{config.label}</h4>
        </div>
        {onRefresh && !loading && (
          <button onClick={onRefresh} className={styles.refreshBtn} style={{ borderColor: accent, color: accent }}>
            ↻ Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingRow}>
          <div className={styles.shimmer} />
          <div className={styles.shimmer} style={{ width: '70%' }} />
        </div>
      ) : !data ? null : (
        <div className={styles.body}>
          {headline && <p className={styles.headline}>{headline}</p>}
          {isLegacyString
            ? <p className={styles.summary}>{data}</p>
            : renderBody ? renderBody(bodyData, accent) : <p className={styles.summary}>{JSON.stringify(data)}</p>
          }
        </div>
      )}
    </div>
  );
}
