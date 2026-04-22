import React, { useState, useMemo } from 'react';
import { WEEKLY_SCHEDULE_TEMPLATE, PRODUCTION_LINES, PRODUCTION_STANDARDS } from '../data/realisticSampleData';
import '../styles/WeeklyProductionPlan.css';

const WeeklyProductionPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [showHelp, setShowHelp] = useState({});

  // Auto-calculate weekly production schedule based on realistic data
  const generateWeeklySchedule = () => {
    const weeks = [];
    const startDate = new Date('2026-04-21');
    const skus = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
    const lineCapacities = { 'Line 1': 30, 'Line 2': 25, 'Line 3': 20 };

    // Use realistic weekly SKU allocation (L/day from template)
    const skuDemandByWeek = {
      'Vanilla': WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Vanilla'],
      'Caramel': WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Caramel'],
      'Mint': WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Mint'],
      'Chocolate': WEEKLY_SCHEDULE_TEMPLATE.skuAllocation['Chocolate'],
    };

    // Pre-assigned production lines for each SKU (realistic scheduling)
    const skuToLines = {
      'Vanilla': ['Line 1', 'Line 3'],
      'Caramel': ['Line 1'],
      'Mint': ['Line 2'],
      'Chocolate': ['Line 2'],
    };

    for (let week = 0; week < 8; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + week * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 4); // Mon-Fri

      const schedule = [];

      // Calculate weekly demand: L/day × 5 working days
      const weeklyDemandBySku = {};
      skus.forEach(sku => {
        weeklyDemandBySku[sku] = (skuDemandByWeek[sku][week] || 0) * 5;
      });

      const totalDemandThisWeek = Object.values(weeklyDemandBySku).reduce((a, b) => a + b, 0);
      const totalCapacity = PRODUCTION_STANDARDS.totalDailyCapacity * 5; // 75 L/day × 5 days = 375L/week

      skus.forEach(sku => {
        const weeklyDemand = weeklyDemandBySku[sku];
        const assignedLines = skuToLines[sku];

        // Distribute demand across assigned lines
        let remainingDemand = weeklyDemand;
        let dayCounter = 0;

        assignedLines.forEach((line, lineIdx) => {
          const lineCapacity = lineCapacities[line];
          const lineWeeklyCapacity = lineCapacity * 5;
          const lineDemand = Math.min(remainingDemand, lineWeeklyCapacity);
          const daysNeeded = Math.ceil(lineDemand / lineCapacity);

          if (lineDemand > 0) {
            schedule.push({
              sku,
              line,
              demand: lineDemand,
              dailyProduction: Math.ceil(lineDemand / daysNeeded),
              daysNeeded: Math.min(daysNeeded, 5),
              startDay: 'Mon',
              endDay: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][Math.min(daysNeeded - 1, 4)],
              totalProduction: Math.ceil(lineDemand),
              remark: `${Math.round((lineDemand / lineWeeklyCapacity) * 100)}% of line capacity`,
            });
          }

          remainingDemand -= lineDemand;
        });
      });

      weeks.push({
        week,
        weekStart: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weekEnd: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        schedule,
        totalDemand: totalDemandThisWeek,
        totalProduction: schedule.reduce((sum, s) => sum + s.totalProduction, 0),
        capacityPercentage: Math.round((totalDemandThisWeek / totalCapacity) * 100),
        isFeasible: totalDemandThisWeek <= totalCapacity,
      });
    }

    return weeks;
  };

  const weeklySchedules = generateWeeklySchedule();
  const currentWeek = weeklySchedules[selectedWeek];

  const toggleHelp = (id) => {
    setShowHelp(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const Tooltip = ({ id, children, help }) => (
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

  // Get action items
  const getActionItems = () => {
    const items = [];
    
    if (!currentWeek.isFeasible) {
      items.push({
        priority: 'critical',
        emoji: '🚨',
        title: 'WARNING: Cannot Produce All Demand',
        description: `You need to produce ${currentWeek.totalDemand}L but can only make ${currentWeek.totalProduction}L this week. Talk to your manager!`,
      });
    }

    // Check inventory alerts (simulated)
    if (Math.random() > 0.5) {
      items.push({
        priority: 'high',
        emoji: '⚠️',
        title: 'Vanilla Stock Running Low',
        description: 'Only 150L left in storage. We scheduled 420L production - good timing!',
      });
    }

    if (Math.random() > 0.6) {
      items.push({
        priority: 'medium',
        emoji: '📦',
        title: 'Caramel Batch Expires Soon',
        description: 'One batch expires in 5 days. Start using it first (FIFO rule).',
      });
    }

    items.push({
      priority: 'info',
      emoji: '✓',
      title: 'All Lines Available',
      description: 'No maintenance scheduled. All 3 lines ready to go.',
    });

    return items;
  };

  return (
    <div className="weekly-production-container">
      {/* HEADER */}
      <header className="screen-header">
        <h1>📅 Weekly Production Plan</h1>
        <p>Simple schedule: What to make, when to make it, which line to use</p>
      </header>

      {/* WEEK SELECTOR */}
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

      {/* ACTION ITEMS */}
      <div className="action-items-section">
        <h2>🎯 Your Tasks This Week</h2>
        <div className="action-items-grid">
          {getActionItems().map((item, idx) => (
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

      {/* PRODUCTION CAPACITY */}
      <div className="capacity-section">
        <h2>🏭 Can We Make It?</h2>
        <div className="capacity-card">
          <div className="capacity-info">
            <div className="capacity-metric">
              <label>You Need to Make:</label>
              <div className="big-number">{currentWeek.totalDemand}L</div>
            </div>
            <div className="capacity-metric">
              <label>We Can Make:</label>
              <div className="big-number">{currentWeek.totalProduction}L</div>
            </div>
            <div className="capacity-metric">
              <label>Extra Capacity:</label>
              <div className={`big-number ${currentWeek.isFeasible ? 'ok' : 'warning'}`}>
                {currentWeek.totalProduction - currentWeek.totalDemand >= 0 ? '+' : ''}{currentWeek.totalProduction - currentWeek.totalDemand}L
              </div>
            </div>
          </div>

          <div className="progress-bar-section">
            <div className="progress-label">
              <span>Production Capacity Used</span>
              <span className="percentage">{currentWeek.capacityPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${currentWeek.capacityPercentage > 90 ? 'danger' : currentWeek.capacityPercentage > 70 ? 'warning' : 'ok'}`}
                style={{ width: `${Math.min(currentWeek.capacityPercentage, 100)}%` }}
              />
            </div>
            <div className="progress-legend">
              <span className="ok">✓ Normal (0-70%)</span>
              <span className="warning">⚠ Tight (70-90%)</span>
              <span className="danger">🚨 Overbooked (90%+)</span>
            </div>
          </div>

          {currentWeek.isFeasible ? (
            <div className="status-ok">✓ YES - We can produce everything this week!</div>
          ) : (
            <div className="status-warning">⚠ NO - We cannot make everything. Need help from manager.</div>
          )}
        </div>
      </div>

      {/* WHAT TO MAKE */}
      <div className="what-to-make-section">
        <h2>📋 Production Schedule: What, When, Where</h2>
        <div className="schedule-cards">
          {currentWeek.schedule.map((item, idx) => (
            <div key={idx} className="schedule-card">
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
                    <strong>{item.totalProduction}L total</strong>
                    <span className="daily">({item.dailyProduction}L per day)</span>
                  </div>
                </div>

                <div className="schedule-item">
                  <label>Why this much?</label>
                  <Tooltip
                    id={`demand-${idx}`}
                    help="This is how much customers ordered. We make what they need, plus a little extra as safety stock."
                  >
                    <span>Demand: {item.demand}L</span>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HELP SECTION */}
      <div className="help-section">
        <h2>❓ Common Questions</h2>
        <div className="help-grid">
          <div className="help-card">
            <h3>What is "Demand"?</h3>
            <p>The amount of ice cream customers ordered. We need to produce exactly this much (plus a safety buffer).</p>
          </div>

          <div className="help-card">
            <h3>What is "Safety Stock"?</h3>
            <p>Extra ice cream we keep in case demand is higher than expected or a line breaks down. Usually 10-15% extra.</p>
          </div>

          <div className="help-card">
            <h3>What does "Line" mean?</h3>
            <p>We have 3 production lines (Line 1, 2, 3). Each makes different flavors. We spread the work across all 3.</p>
          </div>

          <div className="help-card">
            <h3>What if we can't make it?</h3>
            <p>If the bar is red, we can't produce everything. You need to tell your manager so they can talk to sales.</p>
          </div>

          <div className="help-card">
            <h3>Why does it show "Abuse Hrs"?</h3>
            <p>Temperature abuse hours: How long a batch was too warm. Warm ice cream spoils faster. Use those batches first!</p>
          </div>

          <div className="help-card">
            <h3>What is FIFO?</h3>
            <p>First In, First Out - use the oldest stock first so nothing expires. Always make old batches first!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProductionPlan;
