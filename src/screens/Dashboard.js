import React from 'react';
import { Link } from 'react-router-dom';
import {
  DECISION_ALERTS,
  MONTHLY_DEMAND,
  MONTH_LABELS,
  PRODUCTION_STANDARDS,
} from '../data/realisticSampleData';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const CURRENT_MONTH_IDX = 6; // Apr 2026
  const capacity = PRODUCTION_STANDARDS.monthlyCapacity;
  const currentMonth = MONTH_LABELS[CURRENT_MONTH_IDX];
  const currentDemand = MONTHLY_DEMAND[CURRENT_MONTH_IDX];

  const next3 = [1, 2, 3].map(offset => ({
    label: MONTH_LABELS[CURRENT_MONTH_IDX + offset],
    demand: MONTHLY_DEMAND[CURRENT_MONTH_IDX + offset],
  }));

  const alerts = DECISION_ALERTS;

  const tiles = [
    // PLAN
    { to: '/forecast-12month',               emoji: '📈', title: '12-Month Demand Forecast',    desc: 'Demand by month with SKU × Channel breakdown.' },
    { to: '/fg-inventory',                   emoji: '📦', title: 'FG Inventory',                desc: 'Current finished-goods stock and days of cover by SKU.' },
    { to: '/raw-materials',                  emoji: '🧪', title: 'Raw Materials',               desc: 'BOM-driven RM requirements and order checklist by month.' },
    { to: '/manufacturing-execution-planning',emoji: '🏭', title: 'Manufacturing Execution',     desc: '12-month capacity vs demand — when to pre-build.' },
    { to: '/production-decision',            emoji: '🎯', title: 'Production Decision',         desc: 'Decide: deficit / buffer / full capacity this month.' },
    { to: '/weekly-production-plan',         emoji: '📅', title: 'Weekly Production Plan',      desc: "This week's Mon–Fri schedule per line and SKU." },
    // EXECUTE & TUNE
    { to: '/shop-floor',                     emoji: '⚡', title: 'Shop Floor (Live)',            desc: 'Live line status, changeover countdown, downtime log.' },
    { to: '/line-simulator',                 emoji: '🔧', title: 'Line Simulator',              desc: 'What-if: adjust downtime, shift hours, SKU swap.' },
    { to: '/lines-config',                   emoji: '⚙️', title: 'Lines Configuration',         desc: 'Add, edit or retire production lines.' },
  ];

  const fmtL = v => `${Math.round(v).toLocaleString('en-IN')} L`;
  const gap = currentDemand - capacity;
  const gapPct = ((gap / capacity) * 100).toFixed(0);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>🍦 Supply Intelligence — Dashboard</h1>
        <p>Today: 23 Apr 2026 &nbsp;|&nbsp; Planner view &nbsp;|&nbsp; Decisions to take this week</p>
      </div>

      {/* Decision alerts */}
      <div className="container">
        <h2>What Needs Attention</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`alert alert-${
                alert.priority === 'critical' ? 'warning' :
                alert.priority === 'warning' ? 'info' : 'success'
              }`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{alert.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>{alert.title}</div>
                  <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>{alert.description}</div>
                  <div style={{ fontSize: '12px', color: '#777', fontStyle: 'italic' }}>→ {alert.action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current month demand vs capacity */}
      <div className="grid-2">
        <div className="container">
          <h2>This Month — {currentMonth}</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180, background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Forecast Demand</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a' }}>{fmtL(currentDemand)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 180, background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Monthly Capacity</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a' }}>{fmtL(capacity)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 180, background: gap > 0 ? '#fff5f5' : '#f0fff5', padding: '14px', borderRadius: '8px', border: '1px solid ' + (gap > 0 ? '#EE1C25' : '#7AC943') }}>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Demand − Capacity</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: gap > 0 ? '#EE1C25' : '#2F6F13' }}>
                {gap > 0 ? '+' : ''}{fmtL(gap)}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                {gap > 0 ? `Over capacity by ${gapPct}% — must build inventory` : 'Within capacity'}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <h2>Next 3 Months</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Forecast</th>
                <th style={{ textAlign: 'right' }}>vs Capacity</th>
              </tr>
            </thead>
            <tbody>
              {next3.map(m => {
                const over = m.demand - capacity;
                return (
                  <tr key={m.label}>
                    <td>{m.label}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtL(m.demand)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: over > 0 ? '#EE1C25' : '#2F6F13', fontWeight: 600 }}>
                      {over > 0 ? '+' : ''}{fmtL(over)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
            Summer peak — build inventory now to cover Jun/Jul/Aug.
          </p>
        </div>
      </div>

      {/* Jump to tiles */}
      <div className="container">
        <h2>Jump To</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {tiles.map(t => (
            <Link
              key={t.to}
              to={t.to}
              style={{
                textDecoration: 'none',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '16px',
                color: '#1a1a1a',
                display: 'block',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{t.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{t.title}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
