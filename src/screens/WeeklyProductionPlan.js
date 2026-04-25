import React, { useState, useMemo, useEffect } from 'react';
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

// Non-production block styles
const BLOCK_STYLE = {
  startup:    { bg: '#F5F5F5', border: '#bdbdbd', text: '#757575' },
  break:      { bg: '#E3F2FD', border: '#64B5F6', text: '#1565C0' },
  changeover: { bg: '#FFF8E1', border: '#FFD54F', text: '#E65100' },
  cip:        { bg: '#ECEFF1', border: '#90A4AE', text: '#455A64' },
  downtime:   { bg: '#FFCDD2', border: '#E57373', text: '#B71C1C' },
};

const DAY_NAMES    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const LINES        = ['Line 1', 'Line 2', 'Line 3'];

// Intraday timeline — 08:00 to 18:00
const TL_START = 8;
const TL_END   = 18;
const TL_SPAN  = TL_END - TL_START;
const HOUR_MARKS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const SIMULATED_NOW_H = 10 + 45 / 60; // 10:45 — Apr 23 snapshot

const toPct = h => ((h - TL_START) / TL_SPAN) * 100;

const INTRADAY_OPERATORS = { 'Line 1': 'A. Kumar', 'Line 2': 'P. Reddy', 'Line 3': 'R. Singh' };

const fmtH = h => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
};
const hourLabel = h => h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`;

/* ══════════════════════════════════════════════════════════
   INTRADAY BLOCK GENERATOR
   Returns an array of blocks: { startH, endH, type, sku?,
   qty?, label, from?, to? }
   isToday only applies to Line 3 (compressor fault today)
══════════════════════════════════════════════════════════ */
const getIntradayBlocks = (line, isToday, vanillaL = 3, caramelL = 2.4, mintL = 2.5, chocL = 1.8, vanillaL3 = 4) => {
  if (line === 'Line 1') {
    return [
      { startH:  8.00, endH:  8.25, type: 'startup',    label: 'Pre-op check — 15 min' },
      { startH:  8.25, endH: 12.50, type: 'production', sku: 'Vanilla',  qty: vanillaL,  label: `Vanilla — ${vanillaL.toFixed(1)} L` },
      { startH: 12.50, endH: 13.00, type: 'break',      label: 'Lunch break — 30 min' },
      { startH: 13.00, endH: 13.75, type: 'changeover', from: 'Vanilla', to: 'Caramel',      label: 'Changeover: Vanilla → Caramel — 45 min' },
      { startH: 13.75, endH: 17.00, type: 'production', sku: 'Caramel',  qty: caramelL,  label: `Caramel — ${caramelL.toFixed(1)} L` },
      { startH: 17.00, endH: 17.50, type: 'cip',        label: 'CIP sanitation — 30 min' },
    ];
  }
  if (line === 'Line 2') {
    return [
      { startH:  8.00, endH:  8.50, type: 'startup',    label: 'Pre-op check — 30 min' },
      { startH:  8.50, endH: 12.50, type: 'production', sku: 'Mint',       qty: mintL,   label: `Mint — ${mintL.toFixed(1)} L` },
      { startH: 12.50, endH: 13.00, type: 'break',      label: 'Lunch break — 30 min' },
      { startH: 13.00, endH: 14.00, type: 'changeover', from: 'Mint', to: 'Chocolate',   label: 'Changeover: Mint → Chocolate — 60 min' },
      { startH: 14.00, endH: 17.00, type: 'production', sku: 'Chocolate',  qty: chocL,   label: `Chocolate — ${chocL.toFixed(1)} L` },
      { startH: 17.00, endH: 17.50, type: 'cip',        label: 'CIP sanitation — 30 min' },
    ];
  }
  if (line === 'Line 3') {
    if (isToday) {
      return [
        { startH:  8.00, endH:  8.25, type: 'startup',    label: 'Pre-op check — 15 min' },
        { startH:  8.25, endH:  9.25, type: 'production', sku: 'Vanilla', qty: 2.5,               label: 'Vanilla — 2.5 L (early run)' },
        { startH:  9.25, endH: 12.50, type: 'downtime',   label: '🔴 Unplanned: compressor fault (expected resume 12:30)' },
        { startH: 12.50, endH: 13.00, type: 'break',      label: 'Lunch break — 30 min' },
        { startH: 13.00, endH: 17.00, type: 'production', sku: 'Vanilla', qty: vanillaL3 * 0.75,  label: `Vanilla — ${(vanillaL3 * 0.75).toFixed(1)} L (resumed)` },
        { startH: 17.00, endH: 17.50, type: 'cip',        label: 'CIP sanitation — 30 min' },
      ];
    }
    return [
      { startH:  8.00, endH:  8.25, type: 'startup',    label: 'Pre-op check — 15 min' },
      { startH:  8.25, endH: 12.50, type: 'production', sku: 'Vanilla', qty: vanillaL3 * 0.55, label: `Vanilla — ${(vanillaL3 * 0.55).toFixed(1)} L` },
      { startH: 12.50, endH: 13.00, type: 'break',      label: 'Lunch break — 30 min' },
      { startH: 13.00, endH: 17.00, type: 'production', sku: 'Vanilla', qty: vanillaL3 * 0.45, label: `Vanilla — ${(vanillaL3 * 0.45).toFixed(1)} L` },
      { startH: 17.00, endH: 17.50, type: 'cip',        label: 'CIP sanitation — 30 min' },
    ];
  }
  return [];
};

/* ══════════════════════════════════════════════════════════
   WEEKLY SCHEDULE GENERATOR (unchanged logic)
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
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);
    const schedule = [];
    const weeklyDemandBySku = {};
    skus.forEach(sku => { weeklyDemandBySku[sku] = (skuDemandByWeek[sku][week] || 0) * 5; });
    const totalDemandThisWeek = Object.values(weeklyDemandBySku).reduce((a, b) => a + b, 0);
    const totalCapacity = PRODUCTION_STANDARDS.totalDailyCapacity * 5;

    skus.forEach(sku => {
      let remainingDemand = weeklyDemandBySku[sku];
      skuToLines[sku].forEach(line => {
        const lineCapacity = lineCapacities[line];
        const lineWeekCap  = lineCapacity * 5;
        const lineDemand   = Math.min(remainingDemand, lineWeekCap);
        const daysNeeded   = Math.ceil(lineDemand / lineCapacity);
        const utilPct      = Math.round((lineDemand / lineWeekCap) * 100);
        if (lineDemand > 0) {
          schedule.push({
            sku, line, demand: lineDemand,
            dailyProduction: Math.ceil(lineDemand / daysNeeded),
            daysNeeded: Math.min(daysNeeded, 5),
            startDay: 'Mon', endDay: DAY_NAMES[Math.min(daysNeeded - 1, 4)],
            totalProduction: Math.ceil(lineDemand),
            utilPct, remark: `${utilPct}% of line capacity`,
          });
        }
        remainingDemand -= lineDemand;
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
  { priority: 'high',   emoji: '⚠️', title: 'Vanilla Stock Running Low',    description: 'Only 150 L left. 420 L production scheduled — good timing!' },
  { priority: 'medium', emoji: '📦', title: 'Caramel Batch Expires Soon',   description: 'One batch expires in 5 days. Use first (FIFO rule).' },
  { priority: 'info',   emoji: '✓',  title: 'Lines 1 & 2 Available',         description: 'No maintenance scheduled. Line 3 — monitor compressor.' },
];

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const WeeklyProductionPlan = () => {
  const [selectedWeek,   setSelectedWeek]   = useState(0);
  const [viewMode,       setViewMode]       = useState('cards');   // 'cards'|'gantt'|'kanban'|'intraday'
  const [showHelp,       setShowHelp]       = useState({});
  const [selectedDayIdx, setSelectedDayIdx] = useState(3);         // default Thu (today) for wk 1

  // Reset day selection when week changes
  useEffect(() => {
    setSelectedDayIdx(selectedWeek === 0 ? 3 : 0);
  }, [selectedWeek]);

  const currentWeek = weeklySchedules[selectedWeek];

  const toggleHelp = id => setShowHelp(prev => ({ ...prev, [id]: !prev[id] }));

  const HelpTooltip = ({ id, children, help }) => (
    <div className="tooltip-wrapper">
      <span className="tooltip-trigger" onClick={() => toggleHelp(id)}>
        {children} <span className="help-icon">?</span>
      </span>
      {showHelp[id] && (
        <div className="tooltip-content">
          {help}
          <button className="close-tooltip" onClick={() => toggleHelp(id)}>✕</button>
        </div>
      )}
    </div>
  );

  /* ── Gantt rows ─────────────────────────────────────────── */
  const ganttRows = useMemo(() => LINES.map(line => {
    const lineItems = currentWeek.schedule.filter(s => s.line === line);
    let dayOffset = 0;
    const bars = lineItems.map(item => {
      const startCol = dayOffset;
      const span     = Math.min(item.daysNeeded, 5 - dayOffset);
      dayOffset += span;
      return { ...item, startCol, span };
    });
    return { line, bars, idleDays: Math.max(0, 5 - dayOffset) };
  }), [currentWeek]);

  /* ── Kanban columns ─────────────────────────────────────── */
  const kanbanCols = useMemo(() => LINES.map(line => ({
    line,
    items: currentWeek.schedule.filter(s => s.line === line),
  })), [currentWeek]);

  /* ── Intraday: days of the selected week ────────────────── */
  const daysOfWeek = useMemo(() => {
    const base = new Date('2026-04-21');
    base.setDate(base.getDate() + selectedWeek * 7);
    return DAY_NAMES.map((name, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return {
        name,
        date:    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        dateObj: d,
        isToday: selectedWeek === 0 && i === 3, // Thu Apr 23
      };
    });
  }, [selectedWeek]);

  /* ── Intraday: daily qty per line from weekly schedule ──── */
  const dailyQty = useMemo(() => {
    const r = {};
    currentWeek.schedule.forEach(s => {
      r[`${s.sku}::${s.line}`] = +(s.totalProduction / 5).toFixed(1);
    });
    return r;
  }, [currentWeek]);

  /* ── Intraday: blocks per line ──────────────────────────── */
  const intradayBlocks = useMemo(() => {
    const isToday = selectedWeek === 0 && selectedDayIdx === 3;
    const v1 = dailyQty['Vanilla::Line 1']   || 3.2;
    const c1 = dailyQty['Caramel::Line 1']   || 2.4;
    const m2 = dailyQty['Mint::Line 2']      || 2.5;
    const ch = dailyQty['Chocolate::Line 2'] || 1.8;
    const v3 = dailyQty['Vanilla::Line 3']   || 4.0;
    return {
      'Line 1': getIntradayBlocks('Line 1', false,    v1, c1, m2, ch, v3),
      'Line 2': getIntradayBlocks('Line 2', false,    v1, c1, m2, ch, v3),
      'Line 3': getIntradayBlocks('Line 3', isToday,  v1, c1, m2, ch, v3),
    };
  }, [selectedWeek, selectedDayIdx, dailyQty]);

  /* ── Intraday: shift summary per line ───────────────────── */
  const shiftSummary = useMemo(() => {
    const isToday = selectedWeek === 0 && selectedDayIdx === 3;
    return LINES.map(line => {
      const blocks  = intradayBlocks[line];
      const prodBlocks = blocks.filter(b => b.type === 'production');
      const totalL  = prodBlocks.reduce((s, b) => s + (b.qty || 0), 0);
      const downtimeB = blocks.filter(b => b.type === 'downtime');
      const downtimeH = downtimeB.reduce((s, b) => s + (b.endH - b.startH), 0);
      const changeoverH = blocks.filter(b => b.type === 'changeover').reduce((s, b) => s + (b.endH - b.startH), 0);
      const skusProduced = [...new Set(prodBlocks.map(b => b.sku))];
      const isDown = isToday && line === 'Line 3';
      return { line, totalL: +totalL.toFixed(1), downtimeH: +downtimeH.toFixed(2), changeoverH: +changeoverH.toFixed(2), skusProduced, isDown, operator: INTRADAY_OPERATORS[line] };
    });
  }, [intradayBlocks, selectedWeek, selectedDayIdx]);

  /* ── Intraday: shift event log ──────────────────────────── */
  const eventLog = useMemo(() => {
    const isToday = selectedWeek === 0 && selectedDayIdx === 3;
    const events = [
      { time: '08:00', line: 'All Lines', label: 'Shift starts — pre-op checks begin', type: 'info' },
      { time: '08:15', line: 'Line 1',    label: 'Vanilla production starts (A. Kumar)', type: 'production' },
      { time: '08:25', line: 'Line 3',    label: 'Vanilla production starts (R. Singh)', type: 'production' },
      { time: '08:30', line: 'Line 2',    label: 'Mint production starts (P. Reddy)', type: 'production' },
    ];
    if (isToday) {
      events.push(
        { time: '09:15', line: 'Line 3', label: '🔴 Unplanned downtime — compressor fault detected', type: 'downtime' },
        { time: '09:20', line: 'Line 3', label: 'Maintenance team called — estimated 3 h repair time', type: 'alert' },
        { time: '10:45', line: 'All',    label: '📸 Current snapshot — Lines 1 & 2 running; Line 3 down', type: 'alert' },
      );
    }
    events.push(
      { time: '12:30', line: 'All Lines', label: 'Lunch break begins — lines pause', type: 'break' },
      { time: '13:00', line: 'Line 1',    label: 'Changeover begins: Vanilla → Caramel (45 min)', type: 'changeover' },
      { time: '13:00', line: 'Line 2',    label: 'Changeover begins: Mint → Chocolate (60 min)', type: 'changeover' },
    );
    if (isToday) {
      events.push({ time: '13:00', line: 'Line 3', label: 'Line 3 resumes — Vanilla production restarts (post-repair)', type: 'production' });
    } else {
      events.push({ time: '13:00', line: 'Line 3', label: 'Vanilla production second half begins', type: 'production' });
    }
    events.push(
      { time: '13:45', line: 'Line 1',    label: 'Caramel production starts', type: 'production' },
      { time: '14:00', line: 'Line 2',    label: 'Chocolate production starts', type: 'production' },
      { time: '17:00', line: 'All Lines', label: 'Shift ends — CIP sanitation begins (30 min)', type: 'cip' },
      { time: '17:30', line: 'All Lines', label: 'Lines secured — end-of-day handoff complete', type: 'info' },
    );
    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedWeek, selectedDayIdx]);

  const isShowNow = selectedWeek === 0 && selectedDayIdx === 3;

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div className="weekly-production-container">

      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>📅 Weekly Production Plan</h1>
        <p>Cards · Gantt · Kanban · Intraday — pick the view that suits your workflow</p>
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
          { key: 'cards',    label: '📋 Cards',    title: 'Production Cards' },
          { key: 'gantt',    label: '📊 Gantt',    title: 'Gantt Timeline (day view)' },
          { key: 'kanban',   label: '🗂️ Kanban',  title: 'Kanban Board (by line)' },
          { key: 'intraday', label: '🕐 Intraday', title: 'Intraday Hour-by-Hour Schedule' },
        ].map(v => (
          <button key={v.key} className={`view-btn ${viewMode === v.key ? 'view-btn-active' : ''}`} onClick={() => setViewMode(v.key)} title={v.title}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ── ACTION ITEMS ──────────────────────────────────── */}
      <div className="action-items-section">
        <h2>🎯 Your Tasks This Week</h2>
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

      {/* ── CAPACITY ──────────────────────────────────────── */}
      <div className="capacity-section">
        <h2>🏭 Can We Make It?</h2>
        <div className="capacity-card">
          <div className="capacity-info">
            <div className="capacity-metric"><label>Need to Make</label><div className="big-number">{currentWeek.totalDemand} L</div></div>
            <div className="capacity-metric"><label>Can Make</label><div className="big-number">{currentWeek.totalProduction} L</div></div>
            <div className="capacity-metric">
              <label>Buffer</label>
              <div className={`big-number ${currentWeek.isFeasible ? 'ok' : 'warning'}`}>
                {currentWeek.totalProduction - currentWeek.totalDemand >= 0 ? '+' : ''}
                {currentWeek.totalProduction - currentWeek.totalDemand} L
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
              <span className="ok">✓ Normal (0–70%)</span>
              <span className="warning">⚠ Tight (70–90%)</span>
              <span className="danger">🚨 Over (90%+)</span>
            </div>
          </div>
          {currentWeek.isFeasible
            ? <div className="status-ok">✓ YES — we can produce everything this week!</div>
            : <div className="status-warning">⚠ NO — cannot meet demand. Needs manager escalation.</div>}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          CARDS VIEW
      ════════════════════════════════════════════════════ */}
      {viewMode === 'cards' && (
        <div className="what-to-make-section">
          <h2>📋 Production Schedule — Week {selectedWeek + 1} ({currentWeek.weekStart}–{currentWeek.weekEnd})</h2>
          <div className="schedule-cards">
            {currentWeek.schedule.map((item, idx) => (
              <div key={idx} className="schedule-card" style={{ borderTopColor: SKU_COLORS[item.sku].border }}>
                <div className="card-header"><h3>{item.sku}</h3><span className="line-badge">{item.line}</span></div>
                <div className="card-content">
                  <div className="schedule-item">
                    <label>When?</label>
                    <div className="value"><strong>{item.startDay}</strong> to <strong>{item.endDay}</strong><span className="days">({item.daysNeeded} days)</span></div>
                  </div>
                  <div className="schedule-item">
                    <label>How much?</label>
                    <div className="value"><strong>{item.totalProduction} L total</strong><span className="daily">({item.dailyProduction} L/day)</span></div>
                  </div>
                  <div className="schedule-item">
                    <label>Line load</label>
                    <div className="value">
                      <span>{item.remark}</span>
                      <div className="card-util-bar-bg">
                        <div className="card-util-bar" style={{ width: `${Math.min(item.utilPct, 100)}%`, background: SKU_COLORS[item.sku].pill }} />
                      </div>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <label>Why?</label>
                    <HelpTooltip id={`demand-${idx}`} help="This is how much customers ordered. We produce to meet demand plus a safety buffer.">
                      <span>Demand: {item.demand} L</span>
                    </HelpTooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          GANTT VIEW
      ════════════════════════════════════════════════════ */}
      {viewMode === 'gantt' && (
        <div className="gantt-section">
          <h2>📊 Gantt Timeline — Week {selectedWeek + 1} ({currentWeek.weekStart}–{currentWeek.weekEnd})</h2>
          <div className="gantt-wrapper">
            <table className="gantt-table">
              <thead>
                <tr>
                  <th className="gantt-line-th">Line</th>
                  {DAY_NAMES.map(d => <th key={d} className="gantt-day-th">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {ganttRows.map(row => (
                  <tr key={row.line}>
                    <td className="gantt-line-label">{row.line}</td>
                    {row.bars.length === 0 ? (
                      <td colSpan={5} className="gantt-idle-cell"><div className="gantt-idle-bar">Idle this week</div></td>
                    ) : (
                      <>
                        {row.bars.map((bar, i) => (
                          <td key={i} colSpan={bar.span} className="gantt-bar-cell">
                            <div className="gantt-bar" style={{ background: SKU_COLORS[bar.sku].bg, borderLeft: `5px solid ${SKU_COLORS[bar.sku].border}`, color: SKU_COLORS[bar.sku].text }}>
                              <div className="gantt-bar-sku">{bar.sku}</div>
                              <div className="gantt-bar-qty">{bar.totalProduction} L</div>
                              <div className="gantt-bar-meta">{bar.span}d · {bar.dailyProduction} L/d</div>
                            </div>
                          </td>
                        ))}
                        {row.idleDays > 0 && (
                          <td colSpan={row.idleDays} className="gantt-idle-cell"><div className="gantt-idle-bar">—</div></td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gantt-legend">
            {Object.entries(SKU_COLORS).map(([sku, c]) => (
              <div key={sku} className="gantt-legend-item">
                <div className="gantt-legend-dot" style={{ background: c.pill }} /><span>{sku}</span>
              </div>
            ))}
            <div className="gantt-legend-item"><div className="gantt-legend-dot" style={{ background: '#e0e0e0' }} /><span>Idle</span></div>
          </div>
          <div className="gantt-detail-table">
            <table className="data-table">
              <thead>
                <tr><th>Line</th><th>SKU</th><th>Days</th><th className="num">Total (L)</th><th className="num">L/day</th><th>Load</th></tr>
              </thead>
              <tbody>
                {ganttRows.map(row =>
                  row.bars.map((bar, i) => (
                    <tr key={`${row.line}-${i}`}>
                      {i === 0 && <td rowSpan={row.bars.length} className="gantt-line-name-cell">{row.line}</td>}
                      <td><span className="gantt-sku-dot" style={{ background: SKU_COLORS[bar.sku].pill }} />{bar.sku}</td>
                      <td>{DAY_NAMES[bar.startCol]} – {DAY_NAMES[bar.startCol + bar.span - 1]} ({bar.span}d)</td>
                      <td className="num bold">{bar.totalProduction}</td>
                      <td className="num">{bar.dailyProduction}</td>
                      <td>
                        <div className="gantt-load-bar-bg"><div className="gantt-load-bar" style={{ width: `${Math.min(bar.utilPct, 100)}%`, background: SKU_COLORS[bar.sku].pill }} /></div>
                        <span className="gantt-load-label">{bar.utilPct}%</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          KANBAN VIEW
      ════════════════════════════════════════════════════ */}
      {viewMode === 'kanban' && (
        <div className="kanban-section">
          <h2>🗂️ Kanban Board — Week {selectedWeek + 1} ({currentWeek.weekStart}–{currentWeek.weekEnd})</h2>
          <div className="kanban-board">
            {kanbanCols.map(col => (
              <div key={col.line} className="kanban-column">
                <div className="kanban-col-header">
                  <span className="kanban-col-title">{col.line}</span>
                  <span className="kanban-col-badge">{col.items.length} task{col.items.length !== 1 ? 's' : ''}</span>
                </div>
                {col.items.length === 0 ? (
                  <div className="kanban-empty">No production assigned this week</div>
                ) : col.items.map((item, i) => (
                  <div key={i} className="kanban-card" style={{ borderTop: `5px solid ${SKU_COLORS[item.sku].border}` }}>
                    <div className="kanban-card-header">
                      <span className="kanban-card-sku" style={{ color: SKU_COLORS[item.sku].text }}>🍦 {item.sku}</span>
                      <span className="kanban-card-qty">{item.totalProduction} L</span>
                    </div>
                    <div className="kanban-row"><span className="kanban-key">📅 Days</span><span className="kanban-val">{item.startDay} → {item.endDay} ({item.daysNeeded}d)</span></div>
                    <div className="kanban-row"><span className="kanban-key">⚡ Rate</span><span className="kanban-val">{item.dailyProduction} L/day</span></div>
                    <div className="kanban-row"><span className="kanban-key">📦 Demand</span><span className="kanban-val">{item.demand} L</span></div>
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

      {/* ════════════════════════════════════════════════════
          INTRADAY VIEW
      ════════════════════════════════════════════════════ */}
      {viewMode === 'intraday' && (
        <div className="intraday-section">
          <h2>🕐 Intraday Schedule — {daysOfWeek[selectedDayIdx].name} {daysOfWeek[selectedDayIdx].date}</h2>

          {/* Day selector */}
          <div className="id-day-selector">
            {daysOfWeek.map((day, idx) => (
              <button key={idx}
                className={`id-day-btn ${selectedDayIdx === idx ? 'id-day-btn-active' : ''} ${day.isToday ? 'id-day-btn-today' : ''}`}
                onClick={() => setSelectedDayIdx(idx)}>
                {day.isToday && <span className="id-today-pill">TODAY</span>}
                <span className="id-day-name">{day.name}</span>
                <span className="id-day-date">{day.date}</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="id-legend">
            <div className="id-legend-group">
              <span className="id-legend-label">SKUs</span>
              {Object.entries(SKU_COLORS).map(([sku, c]) => (
                <div key={sku} className="id-legend-item">
                  <div className="id-legend-swatch" style={{ background: c.bg, border: `2px solid ${c.border}` }} />
                  <span>{sku}</span>
                </div>
              ))}
            </div>
            <div className="id-legend-group">
              <span className="id-legend-label">Events</span>
              {[
                ['Startup',    BLOCK_STYLE.startup.bg,    BLOCK_STYLE.startup.border],
                ['Changeover', BLOCK_STYLE.changeover.bg, BLOCK_STYLE.changeover.border],
                ['Break',      BLOCK_STYLE.break.bg,      BLOCK_STYLE.break.border],
                ['CIP',        BLOCK_STYLE.cip.bg,        BLOCK_STYLE.cip.border],
                ['Downtime',   BLOCK_STYLE.downtime.bg,   BLOCK_STYLE.downtime.border],
              ].map(([label, bg, border]) => (
                <div key={label} className="id-legend-item">
                  <div className="id-legend-swatch" style={{ background: bg, border: `2px solid ${border}` }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {isShowNow && (
              <div className="id-legend-group">
                <div className="id-legend-item">
                  <div className="id-now-swatch" /><span>Now (10:45)</span>
                </div>
              </div>
            )}
          </div>

          {/* Timeline chart */}
          <div className="id-chart">
            {/* Top ruler */}
            <div className="id-ruler-row">
              <div className="id-linecol" />
              <div className="id-tl-area id-ruler">
                {HOUR_MARKS.map(h => (
                  <div key={h} className="id-hour-label" style={{ left: `${toPct(h)}%` }}>{hourLabel(h)}</div>
                ))}
              </div>
            </div>

            {/* Line rows */}
            {LINES.map(line => {
              const blocks  = intradayBlocks[line];
              const isDown  = isShowNow && line === 'Line 3';
              return (
                <div key={line} className={`id-line-row ${isDown ? 'id-row-alert' : ''}`}>
                  {/* Label column */}
                  <div className="id-linecol id-line-meta">
                    <div className="id-lm-name">{line}</div>
                    <div className="id-lm-op">{INTRADAY_OPERATORS[line]}</div>
                    <div className={`id-lm-pill ${isDown ? 'id-pill-down' : 'id-pill-ok'}`}>
                      {isDown ? '🔴 Down' : '🟢 Running'}
                    </div>
                  </div>

                  {/* Timeline area */}
                  <div className="id-tl-area id-tl">
                    {/* Hour grid lines */}
                    {HOUR_MARKS.map(h => (
                      <div key={h} className="id-grid-line" style={{ left: `${toPct(h)}%` }} />
                    ))}

                    {/* Blocks */}
                    {blocks.map((block, i) => {
                      const leftPct = toPct(block.startH);
                      const widPct  = toPct(block.endH) - leftPct;
                      const isProduction = block.type === 'production';
                      const colors = isProduction ? SKU_COLORS[block.sku] : BLOCK_STYLE[block.type];

                      return (
                        <div key={i}
                          className={`id-block id-block-${block.type}`}
                          style={{
                            left:        `${leftPct}%`,
                            width:       `${widPct}%`,
                            background:  colors.bg,
                            borderLeft:  `4px solid ${colors.border}`,
                          }}
                          title={block.label + (block.qty ? ` (${block.qty.toFixed(1)} L)` : '')}>
                          <div className="id-block-inner">
                            {isProduction && widPct > 6 && (
                              <>
                                <div className="id-blk-name" style={{ color: colors.text }}>{block.sku}</div>
                                {widPct > 11 && <div className="id-blk-qty" style={{ color: colors.text }}>{block.qty.toFixed(1)} L</div>}
                                {widPct > 18 && <div className="id-blk-time" style={{ color: colors.text }}>{fmtH(block.startH)} – {fmtH(block.endH)}</div>}
                              </>
                            )}
                            {block.type === 'changeover' && widPct > 4 && (
                              <div className="id-blk-name" style={{ color: colors.text }}>
                                {widPct > 9 ? `⇄ ${block.from}→${block.to}` : '⇄'}
                              </div>
                            )}
                            {block.type === 'downtime' && widPct > 4 && (
                              <div className="id-blk-name" style={{ color: colors.text }}>
                                {widPct > 12 ? '🔴 Downtime' : '🔴'}
                              </div>
                            )}
                            {block.type === 'break' && widPct > 3 && (
                              <div className="id-blk-name" style={{ color: colors.text }}>🍽️</div>
                            )}
                            {block.type === 'startup' && widPct > 3 && (
                              <div className="id-blk-name" style={{ color: colors.text }}>▶</div>
                            )}
                            {block.type === 'cip' && widPct > 3 && (
                              <div className="id-blk-name" style={{ color: colors.text }}>CIP</div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Now indicator */}
                    {isShowNow && (
                      <div className="id-now-line" style={{ left: `${toPct(SIMULATED_NOW_H)}%` }}>
                        <div className="id-now-badge">NOW</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bottom ruler */}
            <div className="id-ruler-row id-ruler-bottom">
              <div className="id-linecol" />
              <div className="id-tl-area id-ruler">
                {HOUR_MARKS.map(h => (
                  <div key={h} className="id-hour-label" style={{ left: `${toPct(h)}%` }}>{hourLabel(h)}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift summary cards */}
          <div className="id-summary-grid">
            {shiftSummary.map(row => (
              <div key={row.line} className={`id-summary-card ${row.isDown ? 'id-summary-down' : ''}`}>
                <div className="id-sc-header">
                  <span className="id-sc-line">{row.line}</span>
                  <span className="id-sc-op">{row.operator}</span>
                </div>
                <div className="id-sc-metric"><span className="id-sc-label">Total produced</span><span className="id-sc-val">{row.totalL} L</span></div>
                <div className="id-sc-metric"><span className="id-sc-label">SKUs run</span><span className="id-sc-val">{row.skusProduced.join(', ') || '—'}</span></div>
                {row.changeoverH > 0 && <div className="id-sc-metric"><span className="id-sc-label">Changeover</span><span className="id-sc-val">{Math.round(row.changeoverH * 60)} min</span></div>}
                {row.downtimeH > 0 && <div className="id-sc-metric id-sc-alert"><span className="id-sc-label">🔴 Downtime</span><span className="id-sc-val">{Math.round(row.downtimeH * 60)} min</span></div>}
              </div>
            ))}
          </div>

          {/* Shift event log */}
          <div className="id-event-log">
            <h3>📋 Shift Event Log</h3>
            <div className="id-events">
              {eventLog.map((ev, i) => (
                <div key={i} className={`id-event id-ev-${ev.type}`}>
                  <span className="id-ev-time">{ev.time}</span>
                  <span className="id-ev-line">{ev.line}</span>
                  <span className="id-ev-desc">{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HELP ──────────────────────────────────────────── */}
      <div className="help-section">
        <h2>❓ Common Questions</h2>
        <div className="help-grid">
          {[
            ['What is Gantt view?',    'Shows a Mon–Fri timeline per production line — see which days each SKU is being produced.'],
            ['What is Kanban view?',   'Groups tasks by production line (3 columns). Each card is one SKU run for the week.'],
            ['What is Intraday view?', 'Hour-by-hour timeline from 08:00–18:00. Shows startup, production runs, changeovers, lunch, CIP and any downtime.'],
            ['What is a Changeover?',  'Time taken to clean and reconfigure a line to switch from one SKU to another (45–60 min).'],
            ['What is CIP?',           'Clean-In-Place sanitation at end of shift — mandatory food-safety step, typically 30 min.'],
            ['What is FIFO?',          'First In First Out — always use the oldest stock first so nothing expires.'],
          ].map(([q, a]) => (
            <div key={q} className="help-card"><h3>{q}</h3><p>{a}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyProductionPlan;
