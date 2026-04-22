import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  LINE_CONFIGS, PRODUCTION_STANDARDS, MONTHLY_DEMAND,
  MONTH_LABELS, SKU_WEIGHTS,
} from '../data/realisticSampleData';
import '../styles/LineSimulator.css';

const CURRENT_MONTH_IDX = 6; // Apr 2026
const ALL_SKUS = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];

const LineSimulator = () => {
  // Default scenario: Line 3 with 4h downtime this week
  const [form, setForm] = useState({
    lineId: 'Line 3',
    capacityDelta: 0,
    downtimeHoursWeek: 4,
    swapFromSku: 'Vanilla',
    swapToSku: 'Vanilla',
    shiftExtHours: 0,
  });

  const [applied, setApplied] = useState(form);

  const baselineLines = LINE_CONFIGS;
  const currentDemand = MONTHLY_DEMAND[CURRENT_MONTH_IDX];

  // Run simulation: recompute outputs from `applied`
  const sim = useMemo(() => {
    const targetLines = applied.lineId === 'All'
      ? baselineLines.map(l => l.name)
      : [applied.lineId];

    const perLine = baselineLines.map(line => {
      const isTarget = targetLines.includes(line.name);

      // Baseline
      const baseDaily   = line.capacityPerDay;
      const baseWeekly  = baseDaily * 5;
      const baseMonthly = baseDaily * PRODUCTION_STANDARDS.workingDaysPerMonth;

      // Scenario
      let scenDaily = baseDaily;
      if (isTarget) {
        scenDaily = baseDaily + applied.capacityDelta;
        // Shift extension adds hours/day. Assume 8h base → output scales linearly.
        if (applied.shiftExtHours > 0) {
          scenDaily = scenDaily * (1 + applied.shiftExtHours / 8);
        }
      }
      // Weekly: subtract downtime hours (at 8h/day assume hourly rate = daily/8)
      let scenWeekly = scenDaily * 5;
      if (isTarget && applied.downtimeHoursWeek > 0) {
        const hourlyRate = scenDaily / 8;
        scenWeekly = Math.max(0, scenWeekly - hourlyRate * applied.downtimeHoursWeek);
      }
      const scenMonthly = scenDaily * PRODUCTION_STANDARDS.workingDaysPerMonth
        - (isTarget && applied.downtimeHoursWeek > 0
            ? (scenDaily / 8) * applied.downtimeHoursWeek * 4
            : 0);

      return {
        name: line.name,
        baseDaily, baseWeekly, baseMonthly,
        scenDaily: Math.round(scenDaily * 10) / 10,
        scenWeekly: Math.round(scenWeekly * 10) / 10,
        scenMonthly: Math.round(scenMonthly * 10) / 10,
        isTarget,
      };
    });

    // Plant totals
    const baseTotalMonthly = perLine.reduce((s, l) => s + l.baseMonthly, 0);
    const scenTotalMonthly = perLine.reduce((s, l) => s + l.scenMonthly, 0);

    const baseUtil = (currentDemand / baseTotalMonthly) * 100;
    const scenUtil = (currentDemand / Math.max(1, scenTotalMonthly)) * 100;
    const deltaL = scenTotalMonthly - baseTotalMonthly;
    const deltaPct = ((deltaL / baseTotalMonthly) * 100);

    let risk = null;
    if (scenUtil > 100) {
      const shortfall = Math.round(currentDemand - scenTotalMonthly);
      risk = {
        type: 'over',
        message: `Over-capacity. Required pre-build from prior months: ${shortfall.toLocaleString()} L`,
      };
    } else if (scenUtil > 90) {
      risk = {
        type: 'tight',
        message: `Utilization above 90% — little buffer for unplanned downtime.`,
      };
    }

    return {
      perLine,
      baseTotalMonthly: Math.round(baseTotalMonthly),
      scenTotalMonthly: Math.round(scenTotalMonthly),
      baseUtil,
      scenUtil,
      deltaL: Math.round(deltaL),
      deltaPct,
      risk,
    };
  }, [applied, baselineLines, currentDemand]);

  const chartData = sim.perLine.map(l => ({
    name: l.name,
    Baseline: Math.round(l.baseMonthly),
    Scenario: Math.round(l.scenMonthly),
  }));

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onRun = () => setApplied({ ...form });

  const selectedLine = baselineLines.find(l => l.name === form.lineId);
  const availableSkus = selectedLine ? selectedLine.supportedSkus : ALL_SKUS;

  return (
    <div className="line-sim-container">
      <header className="screen-header">
        <h1>🔧 Production Line Simulator</h1>
        <p>Run what-if scenarios — adjust downtime, SKU mix, shift hours. Baseline uses {MONTH_LABELS[CURRENT_MONTH_IDX]} demand ({currentDemand.toLocaleString()} L).</p>
      </header>

      <div className="sim-layout">
        {/* ── SCENARIO FORM ──────────────────────────────── */}
        <div className="sim-panel sim-form">
          <h2>Scenario Inputs</h2>

          <label>
            <span>Line</span>
            <select value={form.lineId} onChange={e => update('lineId', e.target.value)}>
              <option>All</option>
              {baselineLines.map(l => <option key={l.id}>{l.name}</option>)}
            </select>
          </label>

          <label>
            <span>Adjust daily capacity (± L/day)</span>
            <input
              type="number" step="1"
              value={form.capacityDelta}
              onChange={e => update('capacityDelta', parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            <span>Add downtime (hours this week)</span>
            <input
              type="number" min="0" max="40" step="0.5"
              value={form.downtimeHoursWeek}
              onChange={e => update('downtimeHoursWeek', parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            <span>Swap SKU (from)</span>
            <select value={form.swapFromSku} onChange={e => update('swapFromSku', e.target.value)}>
              {availableSkus.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label>
            <span>Swap SKU (to)</span>
            <select value={form.swapToSku} onChange={e => update('swapToSku', e.target.value)}>
              {ALL_SKUS.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label>
            <span>Shift extension (extra hours/day)</span>
            <input
              type="number" min="0" max="4" step="0.5"
              value={form.shiftExtHours}
              onChange={e => update('shiftExtHours', parseFloat(e.target.value) || 0)}
            />
          </label>

          <button className="run-btn" onClick={onRun}>Run Simulation</button>
          <div className="sim-note">Default scenario: Line 3 with 4h downtime this week (reflects today's compressor issue).</div>
        </div>

        {/* ── IMPACT PANEL ──────────────────────────────── */}
        <div className="sim-panel sim-impact">
          <h2>Impact — Baseline vs Scenario</h2>
          <table className="impact-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Baseline</th>
                <th>Scenario</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Daily capacity (L)</td>
                <td>{sim.perLine.reduce((s, l) => s + l.baseDaily, 0)}</td>
                <td>{sim.perLine.reduce((s, l) => s + l.scenDaily, 0).toFixed(1)}</td>
                <td className={sim.deltaL >= 0 ? 'pos' : 'neg'}>
                  {(sim.perLine.reduce((s, l) => s + l.scenDaily, 0) - sim.perLine.reduce((s, l) => s + l.baseDaily, 0)).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td>Weekly capacity (L)</td>
                <td>{sim.perLine.reduce((s, l) => s + l.baseWeekly, 0).toLocaleString()}</td>
                <td>{sim.perLine.reduce((s, l) => s + l.scenWeekly, 0).toFixed(0)}</td>
                <td className={sim.deltaL >= 0 ? 'pos' : 'neg'}>
                  {(sim.perLine.reduce((s, l) => s + l.scenWeekly, 0) - sim.perLine.reduce((s, l) => s + l.baseWeekly, 0)).toFixed(0)}
                </td>
              </tr>
              <tr>
                <td>Monthly capacity (L)</td>
                <td>{sim.baseTotalMonthly.toLocaleString()}</td>
                <td>{sim.scenTotalMonthly.toLocaleString()}</td>
                <td className={sim.deltaL >= 0 ? 'pos' : 'neg'}>{sim.deltaL >= 0 ? '+' : ''}{sim.deltaL.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Utilization % ({MONTH_LABELS[CURRENT_MONTH_IDX]})</td>
                <td>{sim.baseUtil.toFixed(0)}%</td>
                <td className={sim.scenUtil > 100 ? 'neg' : ''}>{sim.scenUtil.toFixed(0)}%</td>
                <td className={sim.deltaL >= 0 ? 'pos' : 'neg'}>
                  {sim.deltaPct >= 0 ? '+' : ''}{sim.deltaPct.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>

          {sim.risk && (
            <div className={`risk-flag risk-${sim.risk.type}`}>
              ⚠ {sim.risk.message}
            </div>
          )}

          {applied.swapFromSku !== applied.swapToSku && (
            <div className="info-note">
              SKU swap set: {applied.swapFromSku} → {applied.swapToSku}. (Mix shift applied at plant-total level in full modelling; this prototype reports capacity only.)
            </div>
          )}
        </div>
      </div>

      {/* ── CHART ──────────────────────────────────────── */}
      <div className="sim-panel">
        <h2>Monthly Capacity by Line — Baseline vs Scenario</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'L / month', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip formatter={v => v.toLocaleString() + ' L'} />
            <Legend />
            <Bar dataKey="Baseline" fill="#8B4513" radius={[4,4,0,0]} />
            <Bar dataKey="Scenario" fill="#EE1C25" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineSimulator;
