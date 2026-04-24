import React from 'react';
import { Link } from 'react-router-dom';
import {
  MONTHLY_DEMAND,
  MONTH_LABELS,
  PRODUCTION_STANDARDS,
  FG_INVENTORY,
  LIVE_LINE_STATUS,
  RAW_MATERIAL_INVENTORY,
  RAW_MATERIAL_BOM,
  SKU_WEIGHTS,
} from '../data/realisticSampleData';
import '../styles/Dashboard.css';

// ─── derived constants ──────────────────────────────────────────
const TODAY_LABEL   = '23 Apr 2026';
const CURRENT_IDX   = 6; // Apr 2026
const CAPACITY      = PRODUCTION_STANDARDS.monthlyCapacity; // 1500 L

// FG days-of-cover
const FG_DAILY = sku => Math.round(MONTHLY_DEMAND[CURRENT_IDX] * SKU_WEIGHTS[sku] / 30);
const fgCover  = sku => {
  const inv = FG_INVENTORY[sku];
  const d   = FG_DAILY(sku);
  return d > 0 ? Math.round(inv.qty / d) : 99;
};

// Raw material gap at Apr 2026 (same logic as RawMaterials screen)
const RM_GAP = (() => {
  const demand       = MONTHLY_DEMAND[CURRENT_IDX];
  const toProduce    = Math.min(demand - Math.round(demand * 0.4), CAPACITY);
  const skus         = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
  return RAW_MATERIAL_INVENTORY.map(rm => {
    let req = 0;
    skus.forEach(sku => {
      const entry = RAW_MATERIAL_BOM[sku]?.[rm.name];
      if (entry) req += (Math.round(toProduce * SKU_WEIGHTS[sku]) / 100) * entry.qty;
    });
    req = Math.round(req * 10) / 10;
    const gap = Math.round((req - rm.currentStock) * 10) / 10;
    return { ...rm, required: req, gap };
  }).filter(r => r.gap > 0);
})();

const Dashboard = () => {
  const demand    = MONTHLY_DEMAND[CURRENT_IDX];
  const gap       = demand - CAPACITY;
  const utilPct   = Math.round((demand / CAPACITY) * 100);
  const linesDown = LIVE_LINE_STATUS.filter(l => l.status === 'down');
  const linesUp   = LIVE_LINE_STATUS.filter(l => l.status === 'running');
  const chocolateCover = fgCover('Chocolate');
  const mintCover      = fgCover('Mint');
  const lowCoverSku    = chocolateCover < mintCover ? 'Chocolate' : 'Mint';
  const lowCoverDays   = Math.min(chocolateCover, mintCover);

  // Prebuilt required across Jun+Jul+Aug
  const peakShortfall = [8, 9, 10]
    .map(i => Math.max(0, MONTHLY_DEMAND[i] - CAPACITY))
    .reduce((a, b) => a + b, 0);

  return (
    <div className="dashboard-v2">

      {/* ════════ PAGE HEADER ════════ */}
      <div className="dash-header">
        <div>
          <h1>🍦 Supply Intelligence</h1>
          <p className="dash-date">📅 {TODAY_LABEL} &nbsp;·&nbsp; Production Planner View &nbsp;·&nbsp; Graviss Foods</p>
        </div>
        <div className="dash-header-status">
          <span className={`hstatus ${linesDown.length > 0 ? 'hstatus-red' : 'hstatus-green'}`}>
            {linesDown.length > 0 ? `⚠ ${linesDown.length} Line Down` : '✅ All Lines Running'}
          </span>
          <span className="hstatus hstatus-orange">
            {RM_GAP.length > 0 ? `🛒 ${RM_GAP.length} RM Orders Needed` : '✅ RM Sufficient'}
          </span>
        </div>
      </div>

      {/* ════════ KPI STRIP ════════ */}
      <div className="kpi-strip">
        <div className="kpi-card kpi-red">
          <div className="kpi-icon">🏭</div>
          <div className="kpi-body">
            <div className="kpi-val">{linesUp.length}/{LIVE_LINE_STATUS.length}</div>
            <div className="kpi-label">Lines Running</div>
            <div className="kpi-sub">{linesDown.length > 0 ? `Line 3 down — compressor` : 'All operational'}</div>
          </div>
        </div>

        <div className="kpi-card kpi-orange">
          <div className="kpi-icon">📊</div>
          <div className="kpi-body">
            <div className="kpi-val">{utilPct}%</div>
            <div className="kpi-label">Apr Utilization</div>
            <div className="kpi-sub">+{gap.toLocaleString()} L above capacity</div>
          </div>
        </div>

        <div className="kpi-card kpi-yellow">
          <div className="kpi-icon">📦</div>
          <div className="kpi-body">
            <div className="kpi-val">{lowCoverDays}d</div>
            <div className="kpi-label">Lowest FG Cover</div>
            <div className="kpi-sub">{lowCoverSku} — {FG_INVENTORY[lowCoverSku].qty} L in stock</div>
          </div>
        </div>

        <div className={`kpi-card ${RM_GAP.length > 0 ? 'kpi-red' : 'kpi-green'}`}>
          <div className="kpi-icon">🧪</div>
          <div className="kpi-body">
            <div className="kpi-val">{RM_GAP.length}</div>
            <div className="kpi-label">RM Shortfalls</div>
            <div className="kpi-sub">{RM_GAP.length > 0 ? RM_GAP.map(r => r.name).join(', ') : 'All sufficient'}</div>
          </div>
        </div>
      </div>

      {/* ════════ ACTION CARDS — WHAT TO DO TODAY ════════ */}
      <div className="dash-section-title">🎯 What To Do Today</div>

      <div className="action-grid">

        {/* CARD 1 — Line 3 Down */}
        <div className="action-card ac-critical">
          <div className="ac-priority-bar" />
          <div className="ac-content">
            <div className="ac-eyebrow">🔴 Shop Floor · Right Now</div>
            <div className="ac-title">Line 3 is DOWN — Compressor Failure</div>
            <div className="ac-body">
              Unplanned breakdown since <strong>09:15 AM</strong>. Est. resume <strong>12:30 PM</strong> (3h 15m lost).
              Line 3 target was <strong>20 L Vanilla</strong> today — only 6 L produced before breakdown.
              Line 1 &amp; 2 running normally. No immediate line recovery needed.
            </div>
            <div className="ac-numbers">
              <span className="ac-num red">14 L lost</span>
              <span className="ac-num grey">Line 3 · R. Singh</span>
              <span className="ac-num grey">Est. back 12:30</span>
            </div>
            <Link to="/shop-floor" className="ac-btn ac-btn-red">→ View Shop Floor</Link>
          </div>
        </div>

        {/* CARD 2 — Apr capacity gap */}
        <div className="action-card ac-critical">
          <div className="ac-priority-bar" />
          <div className="ac-content">
            <div className="ac-eyebrow">🔴 Production Decision · This Month</div>
            <div className="ac-title">Apr Demand Exceeds Capacity by {gap.toLocaleString()} L</div>
            <div className="ac-body">
              Forecast: <strong>1,850 L</strong> demand vs <strong>1,500 L</strong> monthly capacity.
              You need to either run an extra shift, arrange 3PL top-up, or draw down pre-built stock.
              Choose your production option and lock the plan before end of week.
            </div>
            <div className="ac-numbers">
              <span className="ac-num red">+{gap.toLocaleString()} L gap</span>
              <span className="ac-num orange">{utilPct}% util</span>
              <span className="ac-num grey">Decision due: today</span>
            </div>
            <Link to="/production-decision" className="ac-btn ac-btn-red">→ Open Production Decision</Link>
          </div>
        </div>

        {/* CARD 3 — Raw material orders */}
        {RM_GAP.length > 0 && (
          <div className="action-card ac-warning">
            <div className="ac-priority-bar ac-bar-orange" />
            <div className="ac-content">
              <div className="ac-eyebrow">🟠 Raw Materials · Order Now</div>
              <div className="ac-title">Place {RM_GAP.length} Purchase Orders Before Stock Runs Out</div>
              <div className="ac-body">
                {RM_GAP.map(r => (
                  <div key={r.name} className="rm-gap-row">
                    <span className="rm-gap-name">{r.name}</span>
                    <span className="rm-gap-detail">
                      Stock: {r.currentStock} {r.unit} · Need: {r.required} {r.unit} · Short: <strong className="red-text">+{r.gap} {r.unit}</strong>
                      &nbsp;· Lead: <strong>{r.leadTimeDays}d</strong> · {r.supplier}
                    </span>
                  </div>
                ))}
              </div>
              <div className="ac-numbers">
                {RM_GAP.filter(r => r.leadTimeDays > 7).length > 0 &&
                  <span className="ac-num red">🔴 {RM_GAP.filter(r => r.leadTimeDays > 7).length} urgent (lead &gt;7d)</span>
                }
                {RM_GAP.filter(r => r.leadTimeDays <= 7).length > 0 &&
                  <span className="ac-num orange">🟠 {RM_GAP.filter(r => r.leadTimeDays <= 7).length} order soon</span>
                }
              </div>
              <Link to="/raw-materials" className="ac-btn ac-btn-orange">→ View Order Checklist</Link>
            </div>
          </div>
        )}

        {/* CARD 4 — Summer pre-build */}
        <div className="action-card ac-warning">
          <div className="ac-priority-bar ac-bar-orange" />
          <div className="ac-content">
            <div className="ac-eyebrow">🟠 Manufacturing Plan · Next 3 Months</div>
            <div className="ac-title">Summer Peak Starts in 6 Weeks — {peakShortfall.toLocaleString()} L Pre-build Needed</div>
            <div className="ac-body">
              Jun–Aug are all over-capacity: Jun <strong>2,120 L</strong> (141%), Jul <strong>2,050 L</strong> (137%),
              Aug <strong>1,930 L</strong> (129%). You cannot meet demand from in-month production alone.
              Start using Apr &amp; May spare capacity to build buffer stock this week.
            </div>
            <div className="ac-numbers">
              <span className="ac-num red">{peakShortfall.toLocaleString()} L total shortfall</span>
              <span className="ac-num grey">Jun–Aug 2026</span>
              <span className="ac-num grey">Pre-build starts: now</span>
            </div>
            <Link to="/manufacturing-execution-planning" className="ac-btn ac-btn-orange">→ Open Manufacturing Plan</Link>
          </div>
        </div>

        {/* CARD 5 — Low FG */}
        <div className="action-card ac-info">
          <div className="ac-priority-bar ac-bar-yellow" />
          <div className="ac-content">
            <div className="ac-eyebrow">🟡 FG Inventory · Monitor</div>
            <div className="ac-title">Chocolate &amp; Mint Stock Running Low</div>
            <div className="ac-body">
              <strong>Chocolate:</strong> {FG_INVENTORY['Chocolate'].qty} L stock · {chocolateCover}d cover · {FG_INVENTORY['Chocolate'].batches} batch.
              Line 2 switches to Chocolate after Mint changeover at <strong>13:30 today</strong> — next batch incoming.<br /><br />
              <strong>Mint:</strong> {FG_INVENTORY['Mint'].qty} L stock · {mintCover}d cover · {FG_INVENTORY['Mint'].batches} batches.
              Both SKUs need monitoring — confirm FIFO dispatch from cold store.
            </div>
            <div className="ac-numbers">
              <span className="ac-num yellow">Chocolate: {chocolateCover}d</span>
              <span className="ac-num yellow">Mint: {mintCover}d</span>
              <span className="ac-num grey">Restock today via Line 2</span>
            </div>
            <Link to="/fg-inventory" className="ac-btn ac-btn-yellow">→ View FG Inventory</Link>
          </div>
        </div>

        {/* CARD 6 — Today's schedule */}
        <div className="action-card ac-info">
          <div className="ac-priority-bar ac-bar-yellow" />
          <div className="ac-content">
            <div className="ac-eyebrow">🟡 Weekly Plan · Today</div>
            <div className="ac-title">Approve Today's Production Schedule</div>
            <div className="ac-body">
              Week of 21 Apr 2026. Two lines producing, Line 3 on recovery.
              <div className="schedule-mini">
                {LIVE_LINE_STATUS.map(l => (
                  <div key={l.lineId} className={`schedule-line ${l.status === 'down' ? 'sched-down' : 'sched-up'}`}>
                    <span className="sched-name">{l.lineId}</span>
                    <span className="sched-sku">{l.status === 'running' ? `${l.currentSku} → ${l.nextSku}` : '🔴 DOWN — Compressor'}</span>
                    <span className="sched-target">{l.status === 'running' ? `${l.targetTotalL} L target` : `Est. back ${l.expectedResumeAt?.slice(11,16) || '12:30'}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/weekly-production-plan" className="ac-btn ac-btn-yellow">→ View Weekly Plan</Link>
          </div>
        </div>

      </div>

      {/* ════════ THIS MONTH + NEXT 3 MONTHS ════════ */}
      <div className="dash-section-title">📅 Monthly Demand vs Capacity</div>
      <div className="month-strip">
        {[CURRENT_IDX, CURRENT_IDX+1, CURRENT_IDX+2, CURRENT_IDX+3].map(i => {
          const d    = MONTHLY_DEMAND[i];
          const over = d - CAPACITY;
          const pct  = Math.round((d / CAPACITY) * 100);
          const isNow = i === CURRENT_IDX;
          return (
            <div key={i} className={`month-card ${over > 0 ? 'mc-over' : 'mc-ok'} ${isNow ? 'mc-current' : ''}`}>
              <div className="mc-label">{isNow ? '👉 ' : ''}{MONTH_LABELS[i]}</div>
              <div className="mc-demand">{d.toLocaleString()} L</div>
              <div className="mc-util">{pct}% util</div>
              <div className={`mc-gap ${over > 0 ? 'mc-gap-red' : 'mc-gap-green'}`}>
                {over > 0 ? `▲ +${over.toLocaleString()} L` : `✓ Within capacity`}
              </div>
              <div className="mc-bar-bg">
                <div
                  className={`mc-bar-fill ${over > 0 ? 'bar-red' : 'bar-green'}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════ QUICK NAV TILES ════════ */}
      <div className="dash-section-title">⚡ Quick Navigation</div>
      <div className="nav-tiles">
        {[
          { to: '/forecast-12month',               emoji: '📈', title: '12-Month Forecast',     label: 'PLAN' },
          { to: '/fg-inventory',                   emoji: '📦', title: 'FG Inventory',           label: 'PLAN' },
          { to: '/raw-materials',                  emoji: '🧪', title: 'Raw Materials',          label: 'PLAN' },
          { to: '/manufacturing-execution-planning',emoji:'🏭',  title: 'Manufacturing',          label: 'PLAN' },
          { to: '/production-decision',            emoji: '🎯', title: 'Production Decision',    label: 'PLAN' },
          { to: '/weekly-production-plan',         emoji: '📅', title: 'Weekly Plan',            label: 'PLAN' },
          { to: '/shop-floor',                     emoji: '⚡', title: 'Shop Floor',             label: 'LIVE' },
          { to: '/line-simulator',                 emoji: '🔧', title: 'Line Simulator',         label: 'TUNE' },
          { to: '/lines-config',                   emoji: '⚙️', title: 'Lines Config',            label: 'TUNE' },
        ].map(t => (
          <Link key={t.to} to={t.to} className="nav-tile">
            <span className={`nav-tile-label ntl-${t.label.toLowerCase()}`}>{t.label}</span>
            <span className="nav-tile-emoji">{t.emoji}</span>
            <span className="nav-tile-title">{t.title}</span>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
