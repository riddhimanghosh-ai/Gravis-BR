import React, { useState, useMemo } from 'react';
import { WEEKLY_SCHEDULE_TEMPLATE, PRODUCTION_STANDARDS } from '../data/realisticSampleData';
import '../styles/WeeklyProductionPlan.css';

/* ── SKU colour palette ─────────────────────────────────── */
const SKU_COLORS = {
  Vanilla:   { bg: '#FFFBEA', border: '#e6b800', text: '#7a5f00', pill: '#f7c948' },
  Caramel:   { bg: '#FFF5ED', border: '#b86b2a', text: '#7a3500', pill: '#c0702a' },
  Mint:      { bg: '#F0FFF4', border: '#3da85a', text: '#1a5c2a', pill: '#5bba6f' },
  Chocolate: { bg: '#F7F0EF', border: '#4a2c2a', text: '#2c1a19', pill: '#7a4a48' },
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const LINES     = ['Line 1', 'Line 2', 'Line 3'];

/* ── Production schedule generator ─────────────────────── */
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

  const skuToLines = {
    Vanilla:   ['Line 1', 'Line 3'],
    Caramel:   ['Line 1'],
    Mint:      ['Line 2'],
    Chocolate: ['Line 2'],
  };

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
      const weeklyDemand = weeklyDemandBySku[sku];
      let remainingDemand = weeklyDemand;

      skuToLines[sku].forEach(line => {
        const lineCapacity  = lineCapacities[line];
        const lineWeekCap   = lineCapacity * 5;
        const lineDemand    = Math.min(remainingDemand, lineWeekCap);
        const daysNeeded    = Math.ceil(lineDemand / lineCapacity);
        const utilPct       = Math.round((lineDemand / lineWeekCap) * 100);

        if (lineDemand > 0) {
          schedule.push({
            sku, line,
            demand:          lineDemand,
            dailyProduction: Math.ceil(lineDemand / daysNeeded),
            daysNeeded:      Math.min(daysNeeded, 5),
            startDay:        'Mon',
            endDay:          DAY_NAMES[Math.min(daysNeeded - 1, 4)],
            totalProduction: Math.ceil(lineDemand),
            utilPct,
            remark:          `${utilPct}% of line capacity`,
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

/* ── Action items (deterministic) ─────────────────────── */
const ACTION_ITEMS = [
  { priority: 'high',   emoji: '⚠️', title: 'Vanilla Stock Running Low', description: 'Only 150 L left in storage. 420 L production scheduled — good timing!' },
  { priority: 'medium', emoji: '📦', title: 'Caramel Batch Expires Soon', description: 'One batch expires in 5 days. Start using it first (FIFO rule).' },
  { priority: 'info',   emoji: '✓',  title: 'All Lines Available',         description: 'No maintenance scheduled. All 3 lines ready to run.' },
];

/* ═══════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════ */
const WeeklyProductionPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewMode,     setViewMode]     = useState('cards'); // 'cards' | 'gantt' | 'kanban'
  const [showHelp,     setShowHelp]     = useState({});

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

  /* ── Gantt rows: sequential day assignment per line ─── */
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

  /* ── Kanban columns: per-line cards ─────────────────── */
  const kanbanCols = useMemo(() => LINES.map(line => ({
    line,
    items: currentWeek.schedule.filter(s => s.line === line),
  })), [currentWeek]);

  return (
    <div className="weekly-production-container">

      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>📅 Weekly Production Plan</h1>
        <p>What to make, when to make it, which line to use — three views to suit your workflow</p>
      </header>

      {/* ── WEEK SELECTOR ─────────────────────────────────── */}
      <div className="week-selector">
        <label>Select Week:</label>
        <div className="week-buttons">
          {weeklySchedules.map((week, idx) => (
            <button
              key={idx}
              className={`week-btn ${selectedWeek === idx ? 'active' : ''}`}
              onClick={() => setSelectedWeek(idx)}
            >
              Week {idx + 1}<br/>
              <small>{week.weekStart}</small>
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW TOGGLE ───────────────────────────────────── */}
      <div className="view-toggle-bar">
        {[
          { key: 'cards',  label: '📋 Cards',  title: 'Production Cards (default)' },
          { key: 'gantt',  label: '📊 Gantt',  title: 'Gantt Timeline (Mon–Fri)' },
          { key: 'kanban', label: '🗂️ Kanban', title: 'Kanban Board (by line)' },
        ].map(v => (
          <button
            key={v.key}
            className={`view-btn ${viewMode === v.key ? 'view-btn-active' : ''}`}
            onClick={() => setViewMode(v.key)}
            title={v.title}
          >
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
              <div className="action-header">
                <span className="emoji">🚨</span>
                <span className="title">WARNING: Cannot Produce All Demand</span>
              </div>
              <p className="description">
                Need {currentWeek.totalDemand} L but capacity is only {currentWeek.totalProduction} L. Escalate to manager.
              </p>
            </div>
          )}
          {ACTION_ITEMS.map((item, idx) => (
            <div key={idx} className={`action-item priority-${item.priority}`}>
              <div className="action-header">
                <span className="emoji">{item.emoji}</span>
                <span className="title">{item.title}</span>
              </div>
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
            <div className="capacity-metric">
              <label>Need to Make</label>
              <div className="big-number">{currentWeek.totalDemand} L</div>
            </div>
            <div className="capacity-metric">
              <label>Can Make</label>
              <div className="big-number">{currentWeek.totalProduction} L</div>
            </div>
            <div className="capacity-metric">
              <label>Buffer</label>
              <div className={`big-number ${currentWeek.isFeasible ? 'ok' : 'warning'}`}>
                {currentWeek.totalProduction - currentWeek.totalDemand >= 0 ? '+' : ''}
                {currentWeek.totalProduction - currentWeek.totalDemand} L
              </div>
            </div>
          </div>

          <div className="progress-bar-section">
            <div className="progress-label">
              <span>Capacity Used</span>
              <span className="percentage">{currentWeek.capacityPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${currentWeek.capacityPercentage > 90 ? 'danger' : currentWeek.capacityPercentage > 70 ? 'warning' : 'ok'}`}
                style={{ width: `${Math.min(currentWeek.capacityPercentage, 100)}%` }}
              />
            </div>
            <div className="progress-legend">
              <span className="ok">✓ Normal (0–70%)</span>
              <span className="warning">⚠ Tight (70–90%)</span>
              <span className="danger">🚨 Over (90%+)</span>
            </div>
          </div>

          {currentWeek.isFeasible
            ? <div className="status-ok">✓ YES — we can produce everything this week!</div>
            : <div className="status-warning">⚠ NO — cannot meet demand. Needs manager escalation.</div>
          }
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          CARDS VIEW (default)
      ════════════════════════════════════════════════════ */}
      {viewMode === 'cards' && (
        <div className="what-to-make-section">
          <h2>📋 Production Schedule — Week {selectedWeek + 1} ({currentWeek.weekStart} – {currentWeek.weekEnd})</h2>
          <div className="schedule-cards">
            {currentWeek.schedule.map((item, idx) => (
              <div key={idx} className="schedule-card" style={{ borderTopColor: SKU_COLORS[item.sku].border }}>
                <div className="card-header">
                  <h3>{item.sku}</h3>
                  <span className="line-badge">{item.line}</span>
                </div>
                <div className="card-content">
                  <div className="schedule-item">
                    <label>When?</label>
                    <div className="value">
                      <strong>{item.startDay}</strong> to <strong>{item.endDay}</strong>
                      <span className="days">({item.daysNeeded} days)</span>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <label>How much?</label>
                    <div className="value">
                      <strong>{item.totalProduction} L total</strong>
                      <span className="daily">({item.dailyProduction} L/day)</span>
                    </div>
                  </div>
                  <div className="schedule-item">
                    <label>Line load</label>
                    <div className="value">
                      <span>{item.remark}</span>
                      <div className="card-util-bar-bg">
                        <div className="card-util-bar"
                          style={{ width: `${Math.min(item.utilPct, 100)}%`, background: SKU_COLORS[item.sku].pill }} />
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
          <h2>📊 Gantt Timeline — Week {selectedWeek + 1} ({currentWeek.weekStart} – {currentWeek.weekEnd})</h2>

          <div className="gantt-wrapper">
            <table className="gantt-table">
              <thead>
                <tr>
                  <th className="gantt-line-th">Line</th>
                  {DAY_NAMES.map(d => (
                    <th key={d} className="gantt-day-th">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ganttRows.map(row => (
                  <tr key={row.line}>
                    <td className="gantt-line-label">{row.line}</td>

                    {row.bars.length === 0 ? (
                      <td colSpan={5} className="gantt-idle-cell">
                        <div className="gantt-idle-bar">Idle this week</div>
                      </td>
                    ) : (
                      <>
                        {row.bars.map((bar, i) => (
                          <td key={i} colSpan={bar.span} className="gantt-bar-cell">
                            <div
                              className="gantt-bar"
                              style={{
                                background:  SKU_COLORS[bar.sku].bg,
                                borderLeft:  `5px solid ${SKU_COLORS[bar.sku].border}`,
                                color:       SKU_COLORS[bar.sku].text,
                              }}
                            >
                              <div className="gantt-bar-sku">{bar.sku}</div>
                              <div className="gantt-bar-qty">{bar.totalProduction} L</div>
                              <div className="gantt-bar-meta">{bar.span}d · {bar.dailyProduction} L/d</div>
                            </div>
                          </td>
                        ))}
                        {row.idleDays > 0 && (
                          <td colSpan={row.idleDays} className="gantt-idle-cell">
                            <div className="gantt-idle-bar">—</div>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="gantt-legend">
            {Object.entries(SKU_COLORS).map(([sku, c]) => (
              <div key={sku} className="gantt-legend-item">
                <div className="gantt-legend-dot" style={{ background: c.pill }} />
                <span>{sku}</span>
              </div>
            ))}
            <div className="gantt-legend-item">
              <div className="gantt-legend-dot" style={{ background: '#e0e0e0' }} />
              <span>Idle / Unscheduled</span>
            </div>
          </div>

          {/* Gantt detail table */}
          <div className="gantt-detail-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>SKU</th>
                  <th>Days (Mon–Fri)</th>
                  <th className="num">Total (L)</th>
                  <th className="num">L/day</th>
                  <th>Line Load</th>
                </tr>
              </thead>
              <tbody>
                {ganttRows.map(row =>
                  row.bars.map((bar, i) => (
                    <tr key={`${row.line}-${i}`}>
                      {i === 0 && <td rowSpan={row.bars.length} className="gantt-line-name-cell">{row.line}</td>}
                      <td>
                        <span className="gantt-sku-dot" style={{ background: SKU_COLORS[bar.sku].pill }} />
                        {bar.sku}
                      </td>
                      <td>{DAY_NAMES[bar.startCol]} – {DAY_NAMES[bar.startCol + bar.span - 1]} ({bar.span}d)</td>
                      <td className="num bold">{bar.totalProduction}</td>
                      <td className="num">{bar.dailyProduction}</td>
                      <td>
                        <div className="gantt-load-bar-bg">
                          <div className="gantt-load-bar"
                            style={{ width: `${Math.min(bar.utilPct, 100)}%`, background: SKU_COLORS[bar.sku].pill }} />
                        </div>
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
          <h2>🗂️ Kanban Board — Week {selectedWeek + 1} ({currentWeek.weekStart} – {currentWeek.weekEnd})</h2>

          <div className="kanban-board">
            {kanbanCols.map(col => (
              <div key={col.line} className="kanban-column">
                {/* Column header */}
                <div className="kanban-col-header">
                  <span className="kanban-col-title">{col.line}</span>
                  <span className="kanban-col-badge">{col.items.length} task{col.items.length !== 1 ? 's' : ''}</span>
                </div>

                {col.items.length === 0 ? (
                  <div className="kanban-empty">No production assigned this week</div>
                ) : (
                  col.items.map((item, i) => (
                    <div key={i} className="kanban-card" style={{ borderTop: `5px solid ${SKU_COLORS[item.sku].border}` }}>
                      {/* Card header */}
                      <div className="kanban-card-header">
                        <span className="kanban-card-sku" style={{ color: SKU_COLORS[item.sku].text }}>
                          🍦 {item.sku}
                        </span>
                        <span className="kanban-card-qty">{item.totalProduction} L</span>
                      </div>

                      {/* Timeline */}
                      <div className="kanban-row">
                        <span className="kanban-key">📅 Days</span>
                        <span className="kanban-val">{item.startDay} → {item.endDay} ({item.daysNeeded}d)</span>
                      </div>

                      {/* Rate */}
                      <div className="kanban-row">
                        <span className="kanban-key">⚡ Rate</span>
                        <span className="kanban-val">{item.dailyProduction} L/day</span>
                      </div>

                      {/* Demand */}
                      <div className="kanban-row">
                        <span className="kanban-key">📦 Demand</span>
                        <span className="kanban-val">{item.demand} L</span>
                      </div>

                      {/* Utilisation bar */}
                      <div className="kanban-util">
                        <div className="kanban-util-bar-bg">
                          <div
                            className="kanban-util-bar"
                            style={{
                              width: `${Math.min(item.utilPct, 100)}%`,
                              background: SKU_COLORS[item.sku].pill,
                            }}
                          />
                        </div>
                        <span className="kanban-util-label"
                          style={{ color: item.utilPct > 90 ? '#c62828' : item.utilPct > 70 ? '#e65100' : '#2e7d32' }}>
                          {item.utilPct}% line load
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HELP SECTION ──────────────────────────────────── */}
      <div className="help-section">
        <h2>❓ Common Questions</h2>
        <div className="help-grid">
          {[
            ['What is "Demand"?',       'The amount of ice cream customers ordered. We produce exactly this (plus a safety buffer).'],
            ['What is "Safety Stock"?', 'Extra ice cream we keep in case demand spikes or a line breaks down — usually 10–15% extra.'],
            ['What does "Line" mean?',  'We have 3 production lines (Line 1, 2, 3). Each makes different flavours; we spread the work.'],
            ['What is Gantt view?',     'Gantt shows a Mon–Fri timeline per line — see exactly which days each SKU is being produced.'],
            ['What is Kanban view?',    'Kanban groups tasks by production line (column). Each card is one SKU run for the week.'],
            ['What is FIFO?',           'First In, First Out — always use the oldest stock first so nothing expires. Make old batches first!'],
          ].map(([q, a]) => (
            <div key={q} className="help-card">
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyProductionPlan;
