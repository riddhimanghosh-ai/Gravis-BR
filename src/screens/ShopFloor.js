import React from 'react';
import {
  LIVE_LINE_STATUS, DOWNTIME_EVENTS, SIMULATED_TODAY,
} from '../data/realisticSampleData';
import '../styles/ShopFloor.css';

// Pretty-format an ISO time stamp to "10:45 AM" or "10:45 AM, 23 Apr 2026"
const fmtTime = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
};

const fmtDateTime = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${fmtTime(iso)}, ${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
};

const statusBadge = s => {
  if (s === 'running')    return { label: '🟢 Running',    cls: 'sb-running' };
  if (s === 'down')       return { label: '🔴 Down',       cls: 'sb-down' };
  if (s === 'changeover') return { label: '🟡 Changeover', cls: 'sb-changeover' };
  return { label: s, cls: 'sb-default' };
};

const ShopFloor = () => {
  const runningCount = LIVE_LINE_STATUS.filter(l => l.status === 'running').length;
  const downCount    = LIVE_LINE_STATUS.filter(l => l.status === 'down').length;
  const producedToday = LIVE_LINE_STATUS.reduce((s, l) => s + (l.producedSoFarL || 0), 0);

  const upcomingChangeovers = LIVE_LINE_STATUS
    .filter(l => l.changeoverStartTime && l.nextSku)
    .map(l => ({
      line: l.lineId,
      from: l.currentSku || '—',
      to: l.nextSku,
      time: l.changeoverStartTime,
      duration: l.changeoverDuration,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const nextChangeover = upcomingChangeovers[0];

  const downtimeSorted = [...DOWNTIME_EVENTS].sort(
    (a, b) => b.startedAt.localeCompare(a.startedAt)
  );

  return (
    <div className="shop-floor-container">
      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="screen-header">
        <div className="header-left">
          <h1>⚡ Shop Floor — Live Status</h1>
          <p>Real-time view of every production line &nbsp;|&nbsp; Auto-refresh every 60s</p>
        </div>
        <div className="clock-chip">
          <div className="clock-time">{fmtTime(SIMULATED_TODAY)}</div>
          <div className="clock-date">23 Apr 2026</div>
        </div>
      </header>

      {/* ── KPI STRIP ─────────────────────────────────────── */}
      <div className="kpi-strip">
        <div className="kpi kpi-ok">
          <div className="kpi-label">Lines Running</div>
          <div className="kpi-value">{runningCount}<span className="kpi-of"> / {LIVE_LINE_STATUS.length}</span></div>
        </div>
        <div className={`kpi ${downCount > 0 ? 'kpi-bad' : ''}`}>
          <div className="kpi-label">Lines Down</div>
          <div className="kpi-value">{downCount}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Produced Today</div>
          <div className="kpi-value">{producedToday.toFixed(1)}<span className="kpi-of"> L</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Next Changeover</div>
          <div className="kpi-value">{nextChangeover ? nextChangeover.time : '—'}</div>
          <div className="kpi-sub">{nextChangeover ? `${nextChangeover.line} • ${nextChangeover.from} → ${nextChangeover.to}` : 'No changeovers pending'}</div>
        </div>
      </div>

      {/* ── LIVE LINE CARDS ───────────────────────────────── */}
      <div className="line-cards">
        {LIVE_LINE_STATUS.map(line => {
          const badge = statusBadge(line.status);
          const isDown = line.status === 'down';
          return (
            <div key={line.lineId} className={`line-card ${isDown ? 'line-card-down' : ''}`}>
              <div className="line-card-top">
                <div className="line-name">{line.lineId}</div>
                <span className={`status-badge ${badge.cls}`}>
                  {line.status === 'running' && <span className="pulse-dot" />}
                  {badge.label}
                </span>
              </div>

              <div className="line-operator">Operator: <strong>{line.operator}</strong></div>

              <div className="current-sku">
                <div className="current-sku-label">Current SKU</div>
                <div className="current-sku-value">{line.currentSku || '— idle —'}</div>
              </div>

              <div className="line-times">
                <div>
                  <span className="lt-label">Started</span>
                  <span className="lt-value">{fmtTime(line.startedAt)}</span>
                </div>
                <div>
                  <span className="lt-label">Expected End</span>
                  <span className="lt-value">{fmtTime(line.expectedEndAt)}</span>
                </div>
              </div>

              <div className="progress-block">
                <div className="progress-header">
                  <span>Progress</span>
                  <span><strong>{line.producedSoFarL}</strong> / {line.targetTotalL} L</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${isDown ? 'fill-red' : 'fill-green'}`}
                    style={{ width: `${Math.min(100, line.progressPct)}%` }}
                  />
                </div>
                <div className="progress-pct">{line.progressPct}%</div>
              </div>

              {line.status === 'running' && line.nextSku && (
                <div className="next-run">
                  <span className="nr-label">Next:</span> <strong>{line.nextSku}</strong> at {line.changeoverStartTime}
                  <span className="nr-sub"> • CO: {line.changeoverDuration} min</span>
                </div>
              )}

              {isDown && (
                <div className="down-banner">
                  <div className="down-title">⚠ {line.downtimeReason}</div>
                  <div className="down-detail">
                    Since {fmtTime(line.downtimeSince)} · Expected resume {fmtTime(line.expectedResumeAt)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CHANGEOVER TIMELINE ───────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <h2>🔄 Upcoming Changeovers</h2>
          <p>Chronological strip across all lines.</p>
        </div>
        <div className="timeline">
          {upcomingChangeovers.length === 0 && (
            <div className="timeline-empty">No changeovers in the remaining shift.</div>
          )}
          {upcomingChangeovers.map((co, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-time">{co.time}</div>
              <div className="timeline-body">
                <strong>{co.line}</strong> &nbsp;{co.from} → {co.to}
                <div className="timeline-sub">Changeover: {co.duration} min</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DOWNTIME LOG ──────────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <h2>📋 Downtime Log — Last 48h</h2>
          <p>Active events in red. Scheduled (planned) changeovers and CIPs included.</p>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>Reason</th>
                <th>Type</th>
                <th>Status</th>
                <th>Started</th>
                <th>Expected Resume</th>
                <th className="number">Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {downtimeSorted.map(dt => (
                <tr key={dt.id} className={dt.status === 'active' ? 'row-active' : ''}>
                  <td className="highlight">{dt.line}</td>
                  <td>{dt.reason}</td>
                  <td>
                    <span className={`type-pill ${dt.type === 'planned' ? 'tp-planned' : 'tp-unplanned'}`}>
                      {dt.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill st-${dt.status}`}>{dt.status}</span>
                  </td>
                  <td>{fmtDateTime(dt.startedAt)}</td>
                  <td>{fmtDateTime(dt.expectedResumeAt)}</td>
                  <td className="number bold">{dt.durationMin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopFloor;
