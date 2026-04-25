import React, { useState, useMemo } from 'react';
import { WEEKLY_SCHEDULE_TEMPLATE, PRODUCTION_STANDARDS } from '../data/realisticSampleData';
import '../styles/WeeklyProductionPlan.css';

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */

const SKU_COLORS = {
  Vanilla:   { bg: '#FFFBEA', border: '#e6b800', text: '#7a5f00', pill: '#f7c948' },
  Caramel:   { bg: '#FFF5ED', border: '#b86b2a', text: '#7a3500', pill: '#c0702a' },
  Mint:      { bg: '#F0FFF4', border: '#3da85a', text: '#1a5c2a', pill: '#5bba6f' },
  Chocolate: { bg: '#F7F0EF', border: '#4a2c2a', text: '#2c1a19', pill: '#7a4a48' },
};

const BLOCK_STYLE = {
  startup:    { bg: '#F5F5F5', border: '#bdbdbd', text: '#757575' },
  break:      { bg: '#E3F2FD', border: '#64B5F6', text: '#1565C0' },
  changeover: { bg: '#FFF8E1', border: '#FFD54F', text: '#E65100' },
  cip:        { bg: '#ECEFF1', border: '#90A4AE', text: '#455A64' },
  downtime:   { bg: '#FFCDD2', border: '#E57373', text: '#B71C1C' },
};

const DAY_NAMES  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const LINES      = ['Line 1', 'Line 2', 'Line 3'];
const OPERATORS  = { 'Line 1': 'A. Kumar', 'Line 2': 'P. Reddy', 'Line 3': 'R. Singh' };

// Timeline coordinate system
// Each day spans 10 "work-hours" = 08:00–18:00
// Total: 5 days × 10h = 50 work-hours across the week
const TL_HPD   = 10;   // hours per day visible (08:00–18:00)
const TL_TOTAL = 50;   // 5 × 10
const tlPct    = pos => (pos / TL_TOTAL) * 100;

// Intraday reality: every day, Line 1 → Vanilla AM then Caramel PM;
// Line 2 → Mint AM then Chocolate PM; Line 3 → Vanilla all day
// pos = day * TL_HPD + (clockHour - 8)
const makeBlocks = (d, v1, c1, m2, ch, v3, isToday) => {
  const o = d * TL_HPD;
  return {
    'Line 1': [
      { s: o+0.00, e: o+0.25, type: 'startup',    label: 'Pre-op check (15 min)' },
      { s: o+0.25, e: o+4.50, type: 'production', sku: 'Vanilla',  qty: v1,              label: `Vanilla — ${v1.toFixed(1)} L` },
      { s: o+4.50, e: o+5.00, type: 'break',      label: 'Lunch break (30 min)' },
      { s: o+5.00, e: o+5.75, type: 'changeover', from: 'Vanilla', to: 'Caramel',        label: 'Changeover: Vanilla → Caramel (45 min)' },
      { s: o+5.75, e: o+9.00, type: 'production', sku: 'Caramel',  qty: c1,              label: `Caramel — ${c1.toFixed(1)} L` },
      { s: o+9.00, e: o+9.50, type: 'cip',        label: 'CIP sanitation (30 min)' },
    ],
    'Line 2': [
      { s: o+0.00, e: o+0.50, type: 'startup',    label: 'Pre-op check (30 min)' },
      { s: o+0.50, e: o+4.50, type: 'production', sku: 'Mint',       qty: m2,            label: `Mint — ${m2.toFixed(1)} L` },
      { s: o+4.50, e: o+5.00, type: 'break',      label: 'Lunch break (30 min)' },
      { s: o+5.00, e: o+6.00, type: 'changeover', from: 'Mint', to: 'Chocolate',         label: 'Changeover: Mint → Chocolate (60 min)' },
      { s: o+6.00, e: o+9.00, type: 'production', sku: 'Chocolate',  qty: ch,            label: `Chocolate — ${ch.toFixed(1)} L` },
      { s: o+9.00, e: o+9.50, type: 'cip',        label: 'CIP sanitation (30 min)' },
    ],
    'Line 3': isToday ? [
      { s: o+0.00, e: o+0.25, type: 'startup',    label: 'Pre-op check (15 min)' },
      { s: o+0.25, e: o+1.25, type: 'production', sku: 'Vanilla', qty: 2.5,              label: 'Vanilla — 2.5 L (early run)' },
      { s: o+1.25, e: o+4.50, type: 'downtime',   label: '🔴 Compressor fault (09:15 – 12:30, est. resume)' },
      { s: o+4.50, e: o+5.00, type: 'break',      label: 'Lunch break' },
      { s: o+5.00, e: o+9.00, type: 'production', sku: 'Vanilla', qty: +(v3*0.75).toFixed(1), label: `Vanilla — ${(v3*0.75).toFixed(1)} L (resumed)` },
      { s: o+9.00, e: o+9.50, type: 'cip',        label: 'CIP sanitation' },
    ] : [
      { s: o+0.00, e: o+0.25, type: 'startup',    label: 'Pre-op check (15 min)' },
      { s: o+0.25, e: o+4.50, type: 'production', sku: 'Vanilla', qty: +(v3*0.55).toFixed(1), label: `Vanilla — ${(v3*0.55).toFixed(1)} L` },
      { s: o+4.50, e: o+5.00, type: 'break',      label: 'Lunch break (30 min)' },
      { s: o+5.00, e: o+9.00, type: 'production', sku: 'Vanilla', qty: +(v3*0.45).toFixed(1), label: `Vanilla — ${(v3*0.45).toFixed(1)} L` },
      { s: o+9.00, e: o+9.50, type: 'cip',        label: 'CIP sanitation (30 min)' },
    ],
  };
};

// Full week timeline: 5 days, each with the intraday pattern
const buildWeekTimeline = (isWeek1, dq) => {
  const v1 = dq['Vanilla::Line 1']   || 3.2;
  const c1 = dq['Caramel::Line 1']   || 2.4;
  const m2 = dq['Mint::Line 2']      || 2.5;
  const ch = dq['Chocolate::Line 2'] || 1.8;
  const v3 = dq['Vanilla::Line 3']   || 4.0;
  const result = { 'Line 1': [], 'Line 2': [], 'Line 3': [] };
  for (let d = 0; d < 5; d++) {
    const isToday = isWeek1 && d === 3; // Thu Apr 23
    const day = makeBlocks(d, v1, c1, m2, ch, v3, isToday);
    LINES.forEach(ln => { result[ln].push(...day[ln]); });
  }
  return result;
};

// "Now" position — Thu Apr 23, 10:45
const NOW_PCT = tlPct(3 * TL_HPD + (10.75 - 8)); // day 3, 2.75h into shift = 65.5%

const hourLabel = h => h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;

/* ══════════════════════════════════════════════════════════
   WEEKLY SCHEDULE (unchanged logic, used for Cards/Kanban)
══════════════════════════════════════════════════════════ */
const generateWeeklySchedule = () => {
  const weeks = [];
  const startDate = new Date('2026-04-21');
  const skus = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
  const lineCapacities = { 'Line 1': 30, 'Line 2': 25, 'Line 3': 20 };
  const skuDemandByWeek = {
    Vanilla:   WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Vanilla'],
    Caramel:   WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Caramel'],
    Mint:      WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Mint'],
    Chocolate: WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Chocolate'],
  };
  const skuToLines = { Vanilla: ['Line 1', 'Line 3'], Caramel: ['Line 1'], Mint: ['Line 2'], Chocolate: ['Line 2'] };

  for (let week = 0; week < 8; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + week * 7);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 4);
    const schedule = [];
    const weeklyDemandBySku = {};
    skus.forEach(sku => { weeklyDemandBySku[sku] = (skuDemandByWeek[sku][week] || 0) * 5; });
    const totalDemandThisWeek = Object.values(weeklyDemandBySku).reduce((a, b) => a + b, 0);
    const totalCapacity = PRODUCTION_STANDARDS.totalDailyCapacity * 5;

    skus.forEach(sku => {
      let rem = weeklyDemandBySku[sku];
      skuToLines[sku].forEach(line => {
        const cap = lineCapacities[line];
        const lineDemand = Math.min(rem, cap * 5);
        const utilPct = Math.round((lineDemand / (cap * 5)) * 100);
        if (lineDemand > 0) {
          schedule.push({
            sku, line, demand: lineDemand,
            dailyProduction: Math.ceil(lineDemand / 5),
            daysNeeded: 5, startDay: 'Mon', endDay: 'Fri',
            totalProduction: Math.ceil(lineDemand),
            utilPct, remark: `${utilPct}% of line capacity`,
          });
        }
        rem -= lineDemand;
      });
    });

    weeks.push({
      week,
      weekStart: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekEnd:   weekEnd.toLocaleDateString('en-US',   { month: 'short', day: 'numeric' }),
      schedule,
      totalDemand:        totalDemandThisWeek,
      totalProduction:    schedule.reduce((s, i) => s + i.totalProduction, 0),
      capacityPercentage: Math.round((totalDemandThisWeek / totalCapacity) * 100),
      isFeasible:         totalDemandThisWeek <= totalCapacity,
    });
  }
  return weeks;
};

const weeklySchedules = generateWeeklySchedule();

const ACTION_ITEMS = [
  { priority: 'high',   emoji: '⚠️', title: 'Vanilla Stock Running Low',    description: 'Only 150 L left. Production scheduled Mon–Fri AM on Lines 1 & 3.' },
  { priority: 'medium', emoji: '📦', title: 'Caramel Batch Expires Soon',   description: 'One batch expires in 5 days. Use first today (FIFO rule).' },
  { priority: 'info',   emoji: '✓',  title: 'Lines 1 & 2 On Schedule',      description: 'No maintenance. Line 3: compressor fault today — monitor.' },
];

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const WeeklyProductionPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewMode,     setViewMode]     = useState('timeline'); // 'cards' | 'kanban' | 'timeline'
  const [showHelp,     setShowHelp]     = useState({});

  const currentWeek = weeklySchedules[selectedWeek];

  const toggleHelp = id => setShowHelp(prev => ({ ...prev, [id]: !prev[id] }));
  const HelpTooltip = ({ id, children, help }) => (
    <div className="tooltip-wrapper">
      <span className="tooltip-trigger" onClick={() => toggleHelp(id)}>
        {children} <span className="help-icon">?</span>
      </span>
      {showHelp[id] && (
        <div className="tooltip-content">{help}<button className="close-tooltip" onClick={() => toggleHelp(id)}>✕</button></div>
      )}
    </div>
  );

  /* ── Kanban columns ─────────────────────────────────────── */
  const kanbanCols = useMemo(() => LINES.map(line => ({
    line,
    items: currentWeek.schedule.filter(s => s.line === line),
  })), [currentWeek]);

  /* ── Daily qty from weekly schedule (÷5) ────────────────── */
  const dailyQty = useMemo(() => {
    const r = {};
    currentWeek.schedule.forEach(s => { r[`${s.sku}::${s.line}`] = +(s.totalProduction / 5).toFixed(1); });
    return r;
  }, [currentWeek]);

  /* ── Full-week timeline blocks ──────────────────────────── */
  const tlBlocks = useMemo(() =>
    buildWeekTimeline(selectedWeek === 0, dailyQty),
    [selectedWeek, dailyQty]
  );

  /* ── Per-line weekly summary for timeline ───────────────── */
  const lineSummary = useMemo(() => LINES.map(line => {
    const blocks = tlBlocks[line];
    const prodBlocks = blocks.filter(b => b.type === 'production');
    const totalL     = prodBlocks.reduce((s, b) => s + (b.qty || 0), 0);
    const skus       = [...new Set(prodBlocks.map(b => b.sku))];
    const downtimeH  = blocks.filter(b => b.type === 'downtime').reduce((s, b) => s + b.e - b.s, 0);
    return { line, totalL: +totalL.toFixed(0), skus, downtimeH: +downtimeH.toFixed(2), operator: OPERATORS[line] };
  }), [tlBlocks]);

  /* ── Week dates for day labels ──────────────────────────── */
  const weekDates = useMemo(() => {
    const base = new Date('2026-04-21');
    base.setDate(base.getDate() + selectedWeek * 7);
    return DAY_NAMES.map((name, i) => {
      const d = new Date(base); d.setDate(d.getDate() + i);
      return { name, date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
    });
  }, [selectedWeek]);

  const showNow = selectedWeek === 0; // only show NOW needle for week 1

  /* ═══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="weekly-production-container">

      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>📅 Weekly Production Plan</h1>
        <p>Every line runs two SKUs per day — Timeline shows the real hour-by-hour picture across the full week</p>
      </header>

      {/* ── WEEK SELECTOR ─────────────────────────────────── */}
      <div className="week-selector">
        <label>Select Week:</label>
        <div className="week-buttons">
          {weeklySchedules.map((week, idx) => (
            <button key={idx} className={`week-btn ${selectedWeek === idx ? 'active' : ''}`} onClick={() => setSelectedWeek(idx)}>
              Week {idx + 1}<br/><small>{week.weekStart}</small>
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW TOGGLE ───────────────────────────────────── */}
      <div className="view-toggle-bar">
        {[
          { key: 'timeline', label: '📅 Timeline', title: 'Hour-by-hour timeline, Mon–Fri' },
          { key: 'cards',    label: '📋 Cards',    title: 'Production cards per SKU' },
          { key: 'kanban',   label: '🗂️ Kanban',  title: 'Kanban board by line' },
        ].map(v => (
          <button key={v.key} className={`view-btn ${viewMode === v.key ? 'view-btn-active' : ''}`}
            onClick={() => setViewMode(v.key)} title={v.title}>{v.label}</button>
        ))}
      </div>

      {/* ── CAPACITY ──────────────────────────────────────── */}
      <div className="capacity-section">
        <h2>🏭 Weekly Capacity Check</h2>
        <div className="capacity-card">
          <div className="capacity-info">
            <div className="capacity-metric"><label>Weekly Demand</label><div className="big-number">{currentWeek.totalDemand} L</div></div>
            <div className="capacity-metric"><label>Weekly Capacity</label><div className="big-number">{currentWeek.totalProduction} L</div></div>
            <div className="capacity-metric">
              <label>Buffer</label>
              <div className={`big-number ${currentWeek.isFeasible ? 'ok' : 'warning'}`}>
                {currentWeek.totalProduction - currentWeek.totalDemand >= 0 ? '+' : ''}{currentWeek.totalProduction - currentWeek.totalDemand} L
              </div>
            </div>
          </div>
          <div className="progress-bar-section">
            <div className="progress-label"><span>Capacity Used</span><span className="percentage">{currentWeek.capacityPercentage}%</span></div>
            <div className="progress-bar">
              <div className={`progress-fill ${currentWeek.capacityPercentage > 90 ? 'danger' : currentWeek.capacityPercentage > 70 ? 'warning' : 'ok'}`}
                style={{ width: `${Math.min(currentWeek.capacityPercentage, 100)}%` }} />
            </div>
            <div className="progress-legend">
              <span className="ok">✓ Normal (0–70%)</span><span className="warning">⚠ Tight (70–90%)</span><span className="danger">🚨 Over (90%+)</span>
            </div>
          </div>
          {currentWeek.isFeasible
            ? <div className="status-ok">✓ YES — we can produce everything this week!</div>
            : <div className="status-warning">⚠ NO — cannot meet demand. Needs manager escalation.</div>}
        </div>
      </div>

      {/* ── ALERTS ────────────────────────────────────────── */}
      <div className="action-items-section">
        <h2>🎯 This Week's Alerts</h2>
        <div className="action-items-grid">
          {!currentWeek.isFeasible && (
            <div className="action-item priority-critical">
              <div className="action-header"><span className="emoji">🚨</span><span className="title">Cannot Produce All Demand</span></div>
              <p className="description">Need {currentWeek.totalDemand} L, capacity {currentWeek.totalProduction} L. Escalate to manager.</p>
            </div>
          )}
          {ACTION_ITEMS.map((item, idx) => (
            <div key={idx} className={`action-item priority-${item.priority}`}>
              <div className="action-header"><span className="emoji">{item.emoji}</span><span className="title">{item.title}</span></div>
              <p className="description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          TIMELINE VIEW  (Mon–Fri, hour-by-hour)
      ════════════════════════════════════════════════════ */}
      {viewMode === 'timeline' && (
        <div className="tl-section">
          <h2>📅 Production Timeline — {currentWeek.weekStart} to {currentWeek.weekEnd}</h2>
          <p className="tl-subtitle">
            Every line runs two SKUs per shift: AM run → changeover → PM run.
            {showNow && ' Red needle = current time (10:45 Thu Apr 23).'}
          </p>

          {/* Legend */}
          <div className="tl-legend">
            <div className="tl-legend-group">
              <span className="tl-legend-label">SKUs</span>
              {Object.entries(SKU_COLORS).map(([sku, c]) => (
                <div key={sku} className="tl-legend-item">
                  <div className="tl-legend-swatch" style={{ background: c.bg, border: `2px solid ${c.border}` }} />
                  <span>{sku}</span>
                </div>
              ))}
            </div>
            <div className="tl-legend-group">
              <span className="tl-legend-label">Events</span>
              {[['Startup','startup'],['Changeover','changeover'],['Lunch','break'],['CIP','cip'],['Downtime','downtime']].map(([label, key]) => (
                <div key={key} className="tl-legend-item">
                  <div className="tl-legend-swatch" style={{ background: BLOCK_STYLE[key].bg, border: `2px solid ${BLOCK_STYLE[key].border}` }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {showNow && (
              <div className="tl-legend-group">
                <div className="tl-legend-item"><div className="tl-now-swatch" /><span>Now (10:45)</span></div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="tl-chart">

            {/* Day label row */}
            <div className="tl-row tl-day-header-row">
              <div className="tl-linecol" />
              <div className="tl-area">
                {/* Day separators */}
                {[1,2,3,4].map(d => <div key={d} className="tl-day-sep" style={{ left: `${tlPct(d*TL_HPD)}%` }} />)}
                {/* Day labels */}
                {weekDates.map((day, d) => {
                  const isTod = selectedWeek === 0 && d === 3;
                  return (
                    <div key={d} className={`tl-day-label ${isTod ? 'tl-today-day' : ''}`}
                      style={{ left: `${tlPct(d*TL_HPD)}%`, width: `${tlPct(TL_HPD)}%` }}>
                      <span className="tl-day-name">{day.name}</span>
                      <span className="tl-day-date">{day.date}</span>
                      {isTod && <span className="tl-today-chip">TODAY</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hour tick row */}
            <div className="tl-row tl-hour-row">
              <div className="tl-linecol" />
              <div className="tl-area">
                {Array.from({ length: 5 }, (_, d) =>
                  [0, 2, 4, 6, 8].map(rh => (
                    <div key={`${d}-${rh}`} className="tl-hour-tick" style={{ left: `${tlPct(d*TL_HPD + rh)}%` }}>
                      {hourLabel(8 + rh)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Line rows */}
            {LINES.map(line => {
              const blocks  = tlBlocks[line];
              const isDown  = showNow && line === 'Line 3';

              return (
                <div key={line} className={`tl-row tl-line-row ${isDown ? 'tl-row-down' : ''}`}>

                  {/* Line meta */}
                  <div className="tl-linecol tl-meta">
                    <div className="tl-meta-name">{line}</div>
                    <div className="tl-meta-op">{OPERATORS[line]}</div>
                    <div className={`tl-meta-pill ${isDown ? 'tl-pill-down' : 'tl-pill-ok'}`}>
                      {isDown ? '🔴 Down' : '🟢 Running'}
                    </div>
                    <div className="tl-meta-pattern">
                      {line === 'Line 1' ? '🍦Vanilla · 🍮Caramel' :
                       line === 'Line 2' ? '🌿Mint · 🍫Chocolate' :
                                           '🍦Vanilla (all day)'}
                    </div>
                  </div>

                  {/* Timeline area */}
                  <div className="tl-area tl-timeline">
                    {/* Day separators */}
                    {[1,2,3,4].map(d => <div key={d} className="tl-day-sep-line" style={{ left: `${tlPct(d*TL_HPD)}%` }} />)}

                    {/* Hour grid lines (every 2h) */}
                    {Array.from({ length: 5 }, (_, d) =>
                      [2, 4, 6, 8].map(rh => (
                        <div key={`${d}-${rh}`} className="tl-hour-line" style={{ left: `${tlPct(d*TL_HPD + rh)}%` }} />
                      ))
                    )}

                    {/* Blocks */}
                    {blocks.map((blk, i) => {
                      const lp = tlPct(blk.s);
                      const wp = tlPct(blk.e) - lp;
                      const isProd = blk.type === 'production';
                      const c = isProd ? SKU_COLORS[blk.sku] : BLOCK_STYLE[blk.type];

                      return (
                        <div key={i}
                          className={`tl-block tl-blk-${blk.type}`}
                          style={{ left: `${lp}%`, width: `${wp}%`, background: c.bg, borderLeft: `3px solid ${c.border}` }}
                          title={blk.label + (blk.qty ? ` (${blk.qty} L)` : '')}>
                          <div className="tl-blk-inner">
                            {isProd && wp > 3.5 && (
                              <>
                                <div className="tl-blk-sku" style={{ color: c.text }}>{blk.sku}</div>
                                {wp > 6  && <div className="tl-blk-qty" style={{ color: c.text }}>{blk.qty} L</div>}
                                {wp > 10 && <div className="tl-blk-time" style={{ color: c.text }}>
                                  {blk.s % TL_HPD !== 0
                                    ? `${Math.floor(8 + (blk.s % TL_HPD))}:${String(Math.round(((blk.s % TL_HPD) % 1) * 60)).padStart(2,'0')}–${Math.floor(8 + (blk.e % TL_HPD))}:${String(Math.round(((blk.e % TL_HPD) % 1) * 60)).padStart(2,'0')}`
                                    : ''}
                                </div>}
                              </>
                            )}
                            {blk.type === 'changeover' && wp > 1.5 && (
                              <div className="tl-blk-sku" style={{ color: c.text }}>{wp > 3 ? `⇄ ${blk.from}→${blk.to}` : '⇄'}</div>
                            )}
                            {blk.type === 'downtime' && wp > 2 && (
                              <div className="tl-blk-sku" style={{ color: c.text }}>{wp > 5 ? '🔴 Down' : '🔴'}</div>
                            )}
                            {blk.type === 'break'   && wp > 1.5 && <div className="tl-blk-sku" style={{ color: c.text }}>🍽️</div>}
                            {blk.type === 'startup' && wp > 1   && <div className="tl-blk-sku" style={{ color: c.text }}>▶</div>}
                            {blk.type === 'cip'     && wp > 1.5 && <div className="tl-blk-sku" style={{ color: c.text }}>CIP</div>}
                          </div>
                        </div>
                      );
                    })}

                    {/* NOW needle */}
                    {showNow && (
                      <div className="tl-now-line" style={{ left: `${NOW_PCT}%` }}>
                        <div className="tl-now-badge">NOW</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bottom hour row */}
            <div className="tl-row tl-hour-row tl-hour-bottom">
              <div className="tl-linecol" />
              <div className="tl-area">
                {Array.from({ length: 5 }, (_, d) =>
                  [0, 2, 4, 6, 8].map(rh => (
                    <div key={`${d}-${rh}`} className="tl-hour-tick" style={{ left: `${tlPct(d*TL_HPD + rh)}%` }}>
                      {hourLabel(8 + rh)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Weekly totals per line */}
          <div className="tl-summary-row">
            {lineSummary.map(row => (
              <div key={row.line} className={`tl-sum-card ${row.downtimeH > 0 ? 'tl-sum-down' : ''}`}>
                <div className="tl-sum-header">
                  <span className="tl-sum-line">{row.line}</span>
                  <span className="tl-sum-op">{row.operator}</span>
                </div>
                <div className="tl-sum-metric"><span>Weekly output</span><strong>{row.totalL} L</strong></div>
                <div className="tl-sum-metric"><span>SKUs / day</span><strong>{row.skus.join(' + ')}</strong></div>
                {row.downtimeH > 0 && <div className="tl-sum-metric tl-sum-alert"><span>🔴 Downtime today</span><strong>{Math.round(row.downtimeH * 60)} min</strong></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CARDS VIEW
      ════════════════════════════════════════════════════ */}
      {viewMode === 'cards' && (
        <div className="what-to-make-section">
          <h2>📋 Weekly Production Cards — {currentWeek.weekStart} to {currentWeek.weekEnd}</h2>
          <p style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>Each SKU runs daily (AM or PM slot). Weekly totals shown. See Timeline view for exact hours.</p>
          <div className="schedule-cards">
            {currentWeek.schedule.map((item, idx) => (
              <div key={idx} className="schedule-card" style={{ borderTopColor: SKU_COLORS[item.sku].border }}>
                <div className="card-header"><h3>{item.sku}</h3><span className="line-badge">{item.line}</span></div>
                <div className="card-content">
                  <div className="schedule-item">
                    <label>Slot</label>
                    <div className="value">
                      <strong>{item.line === 'Line 2' && item.sku === 'Chocolate' ? 'PM (14:00–17:00)'
                        : item.line === 'Line 1' && item.sku === 'Caramel' ? 'PM (13:45–17:00)'
                        : item.line === 'Line 3' ? 'AM + PM (all day)' : 'AM (08:15–12:30)'}</strong>
                      <span className="days">Mon–Fri, every day</span>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <label>Weekly total</label>
                    <div className="value"><strong>{item.totalProduction} L</strong><span className="daily">({item.dailyProduction} L/day)</span></div>
                  </div>
                  <div className="schedule-item">
                    <label>Line load</label>
                    <div className="value">
                      <span>{item.remark}</span>
                      <div className="card-util-bar-bg"><div className="card-util-bar" style={{ width: `${Math.min(item.utilPct, 100)}%`, background: SKU_COLORS[item.sku].pill }} /></div>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <label>Weekly demand</label>
                    <HelpTooltip id={`d-${idx}`} help="Total demand for this SKU this week across all channels.">
                      <span>{item.demand} L</span>
                    </HelpTooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          KANBAN VIEW
      ════════════════════════════════════════════════════ */}
      {viewMode === 'kanban' && (
        <div className="kanban-section">
          <h2>🗂️ Kanban Board — {currentWeek.weekStart} to {currentWeek.weekEnd}</h2>
          <p style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>Columns = production lines. Each card = one SKU run per day (AM or PM). Switch to Timeline to see exact hours.</p>
          <div className="kanban-board">
            {kanbanCols.map(col => (
              <div key={col.line} className="kanban-column">
                <div className="kanban-col-header">
                  <span className="kanban-col-title">{col.line}</span>
                  <span className="kanban-col-badge">{col.items.length} SKU{col.items.length !== 1 ? 's' : ''}/day</span>
                </div>
                {col.items.length === 0 ? (
                  <div className="kanban-empty">No production assigned</div>
                ) : col.items.map((item, i) => (
                  <div key={i} className="kanban-card" style={{ borderTop: `5px solid ${SKU_COLORS[item.sku].border}` }}>
                    <div className="kanban-card-header">
                      <span className="kanban-card-sku" style={{ color: SKU_COLORS[item.sku].text }}>🍦 {item.sku}</span>
                      <span className="kanban-card-qty">{item.totalProduction} L/wk</span>
                    </div>
                    <div className="kanban-row">
                      <span className="kanban-key">🕐 Slot</span>
                      <span className="kanban-val">{
                        item.line === 'Line 2' && item.sku === 'Chocolate' ? 'PM 14:00–17:00'
                        : item.line === 'Line 1' && item.sku === 'Caramel' ? 'PM 13:45–17:00'
                        : item.line === 'Line 3' ? 'AM+PM all day' : 'AM 08:15–12:30'
                      }</span>
                    </div>
                    <div className="kanban-row"><span className="kanban-key">📅 Days</span><span className="kanban-val">Mon–Fri (5 days)</span></div>
                    <div className="kanban-row"><span className="kanban-key">⚡ Rate</span><span className="kanban-val">{item.dailyProduction} L/day</span></div>
                    <div className="kanban-util">
                      <div className="kanban-util-bar-bg"><div className="kanban-util-bar" style={{ width: `${Math.min(item.utilPct, 100)}%`, background: SKU_COLORS[item.sku].pill }} /></div>
                      <span className="kanban-util-label" style={{ color: item.utilPct > 90 ? '#c62828' : item.utilPct > 70 ? '#e65100' : '#2e7d32' }}>{item.utilPct}% line load</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HELP ──────────────────────────────────────────── */}
      <div className="help-section">
        <h2>❓ How to Read This</h2>
        <div className="help-grid">
          {[
            ['Why do lines run 2 SKUs/day?', 'Each 9-hour shift is split: ~4h AM run + 45–60 min changeover + ~3h PM run. This doubles throughput vs running one SKU all week.'],
            ['What is Changeover?', 'Time to clean and reconfigure the line between SKUs. Line 1: 45 min (Vanilla→Caramel). Line 2: 60 min (Mint→Chocolate, longer due to colour change).'],
            ['What is CIP?', 'Clean-In-Place sanitation at end of every shift — mandatory food-safety step. 30 min, happens daily at 17:00.'],
            ['Why is Line 3 down today?', 'An unplanned compressor fault at 09:15 halted Line 3. It ran 2.5 L of Vanilla before the fault. Expected resume 13:00 after repair.'],
            ['What is FIFO?', 'First In First Out — oldest stock is used first. Caramel batch expiring in 5 days should be dispatched before newer batches.'],
            ['Timeline vs Cards view?', 'Timeline = exact hours (most accurate). Cards = quick weekly summary. Kanban = view by production line.'],
          ].map(([q, a]) => (
            <div key={q} className="help-card"><h3>{q}</h3><p>{a}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyProductionPlan;
