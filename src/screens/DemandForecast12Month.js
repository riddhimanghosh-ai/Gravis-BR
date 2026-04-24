import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  MONTH_LABELS, MONTH_SHORT, MONTHLY_DEMAND, MONTH_TYPE,
  CHANNEL_WEIGHTS, SKU_WEIGHTS,
  FORECAST_CI, DECISION_ALERTS, PRODUCTION_STANDARDS,
} from '../data/realisticSampleData';
import '../styles/DemandForecast12Month.css';

const DemandForecast12Month = () => {
  const allChannels = ['Parlor', 'Retail', 'HoReCa', 'E-Commerce'];
  const allSkus     = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
  const capacity    = PRODUCTION_STANDARDS.monthlyCapacity;

  // ── Filter state ────────────────────────────────────────
  const [monthRange, setMonthRange] = useState({ start: 0, end: 11 });
  const [selectedSkus, setSelectedSkus] = useState(allSkus);
  const [selectedChannels, setSelectedChannels] = useState(allChannels);
  const [showCharts, setShowCharts] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // Toggle SKU
  const toggleSku = sku => {
    setSelectedSkus(prev =>
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  // Toggle Channel
  const toggleChannel = ch => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  // ── Build monthly data ──────────────────────────────────
  const monthlyRows = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      if (idx < monthRange.start || idx > monthRange.end) return null;

      const isForecast = MONTH_TYPE[idx] === 'Forecast';
      const baseDemand = MONTHLY_DEMAND[idx];

      // Filtered demand: sum only selected channels × skus
      let filteredDemand = 0;
      selectedChannels.forEach(ch => {
        selectedSkus.forEach(sku => {
          filteredDemand += Math.round(
            baseDemand * CHANNEL_WEIGHTS[ch][idx] * SKU_WEIGHTS[sku]
          );
        });
      });

      // CI for forecast months
      let ci;
      if (isForecast) {
        if (idx <= 8)  ci = FORECAST_CI.months1_3;
        else if (idx <= 10) ci = FORECAST_CI.months4_6;
        else ci = FORECAST_CI.months7_9;
      }

      // Channel breakdown
      let channelBreakdown = {};
      selectedChannels.forEach(ch => {
        let chDemand = 0;
        selectedSkus.forEach(sku => {
          chDemand += Math.round(baseDemand * CHANNEL_WEIGHTS[ch][idx] * SKU_WEIGHTS[sku]);
        });
        channelBreakdown[ch] = chDemand;
      });

      // SKU breakdown
      let skuBreakdown = {};
      selectedSkus.forEach(sku => {
        let skuDemand = 0;
        selectedChannels.forEach(ch => {
          skuDemand += Math.round(baseDemand * CHANNEL_WEIGHTS[ch][idx] * SKU_WEIGHTS[sku]);
        });
        skuBreakdown[sku] = skuDemand;
      });

      // Planner action (utilPct-based)
      const utilPct = Math.round((filteredDemand / capacity) * 100);
      let plannerAction;
      if (utilPct > 130) {
        plannerAction = { label: `🔴 Over-capacity (${utilPct}%) — pre-build inventory in prior months`, cls: 'action-critical' };
      } else if (utilPct > 100) {
        plannerAction = { label: `🟠 At-capacity (${utilPct}%) — plan extra shift or 3PL top-up`, cls: 'action-high' };
      } else if (utilPct > 85) {
        plannerAction = { label: `🟡 Tight (${utilPct}%) — approve overtime; monitor weekly`, cls: 'action-medium' };
      } else {
        const suffix = MONTH_TYPE[idx] === 'Actual' ? 'Actual month, no action needed' : 'Forecast month, confirm pre-build plan';
        plannerAction = { label: `✅ Normal (${utilPct}%) — ${suffix}`, cls: 'action-ok' };
      }

      return {
        label, shortLabel: MONTH_SHORT[idx], type: MONTH_TYPE[idx],
        demand: filteredDemand,
        isForecast,
        forecastLower: isForecast ? Math.round(filteredDemand * ci.lower) : null,
        forecastUpper: isForecast ? Math.round(filteredDemand * ci.upper) : null,
        ...channelBreakdown,
        ...skuBreakdown,
        plannerAction, utilPct, capacity,
      };
    }).filter(r => r !== null);
  }, [monthRange, selectedSkus, selectedChannels]);

  // ── Summary metrics ────────────────────────────────────
  const metrics = useMemo(() => {
    if (monthlyRows.length === 0) return {};
    const hist = monthlyRows.filter((r, i) => monthlyRows[i]?.type === 'Actual');
    const fore = monthlyRows.filter((r, i) => monthlyRows[i]?.type === 'Forecast');
    const avgHist = hist.length > 0 ? Math.round(hist.reduce((s, r) => s + r.demand, 0) / hist.length) : 0;
    const avgFore = fore.length > 0 ? Math.round(fore.reduce((s, r) => s + r.demand, 0) / fore.length) : 0;
    const growth  = avgHist > 0 ? Math.round(((avgFore - avgHist) / avgHist) * 100) : 0;
    const annual  = monthlyRows.reduce((s, r) => s + r.demand, 0);
    const peak    = monthlyRows.reduce((max, r) => r.demand > max.demand ? r : max, { demand: 0 });
    const overCapacityMonths = monthlyRows.filter(r => r.demand > capacity).length;
    return { avgHist, avgFore, growth, annual, peak, overCapacityMonths };
  }, [monthlyRows]);

  const demandAlerts = DECISION_ALERTS.filter(a => a.screen === 'demand' || a.screen === 'production');

  return (
    <div className="demand-12month-container">

      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>📊 12-Month Demand Forecast</h1>
        <p>Oct 2025 → Sep 2026 &nbsp;|&nbsp; 6 months actual + 6 months forecast &nbsp;|&nbsp; Filter by month, SKU, and channel</p>
      </header>

      {/* ── ALERTS ────────────────────────────────────────── */}
      <div className="alert-strip">
        <div className="alert-strip-title">⚡ What Needs Your Attention</div>
        <div className="alert-strip-cards">
          {demandAlerts.map(a => (
            <div key={a.id} className={`alert-card alert-${a.priority}`}>
              <div className="alert-card-title">{a.emoji} {a.title}</div>
              <div className="alert-card-action">{a.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTERS ───────────────────────────────────────── */}
      <div className="filter-panel">
        {/* Month range */}
        <div className="filter-group">
          <label className="filter-label">📅 Month Range</label>
          <select value={monthRange.start} onChange={e => setMonthRange(r => ({ ...r, start: parseInt(e.target.value) }))}>
            {MONTH_LABELS.map((lbl, i) => <option key={i} value={i}>{lbl} (start)</option>)}
          </select>
          <span className="filter-sep">to</span>
          <select value={monthRange.end} onChange={e => setMonthRange(r => ({ ...r, end: parseInt(e.target.value) }))}>
            {MONTH_LABELS.map((lbl, i) => <option key={i} value={i}>{lbl} (end)</option>)}
          </select>
        </div>

        {/* SKU multi-select */}
        <div className="filter-group">
          <label className="filter-label">🍦 SKUs</label>
          <div className="checkbox-group">
            {allSkus.map(sku => (
              <label key={sku} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedSkus.includes(sku)}
                  onChange={() => toggleSku(sku)}
                />
                {sku}
              </label>
            ))}
          </div>
        </div>

        {/* Channel multi-select */}
        <div className="filter-group">
          <label className="filter-label">🏪 Channels</label>
          <div className="checkbox-group">
            {allChannels.map(ch => (
              <label key={ch} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedChannels.includes(ch)}
                  onChange={() => toggleChannel(ch)}
                />
                {ch}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUMMARY METRICS ──────────────────────────────── */}
      {monthlyRows.length > 0 && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Demand</div>
            <div className="metric-value">{metrics.annual?.toLocaleString()} L</div>
            <div className="metric-subtext">{monthlyRows.length} months</div>
          </div>
          <div className={`metric-card ${metrics.overCapacityMonths > 0 ? 'negative' : 'positive'}`}>
            <div className="metric-label">Over-Capacity Months</div>
            <div className="metric-value">{metrics.overCapacityMonths}</div>
            <div className="metric-subtext">{metrics.overCapacityMonths > 0 ? 'Pre-build required' : 'Within capacity'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Peak Month</div>
            <div className="metric-value">{metrics.peak?.label}</div>
            <div className="metric-subtext">{metrics.peak?.demand?.toLocaleString()} L</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">SKUs Selected</div>
            <div className="metric-value">{selectedSkus.length}</div>
            <div className="metric-subtext">Channels: {selectedChannels.length}</div>
          </div>
        </div>
      )}

      {/* ── TABLE ────────────────────────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>📋 Filtered Demand Plan</h2>
          <p>SKUs: {selectedSkus.join(', ')} &nbsp;|&nbsp; Channels: {selectedChannels.join(', ')}</p>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="number">Total Demand (L)</th>
                {selectedChannels.map(ch => <th key={ch} className="number">{ch} (L)</th>)}
                {selectedSkus.map(sku => <th key={sku} className="number">{sku} (L)</th>)}
                <th>Planner Action</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row, idx) => (
                <tr key={idx} className={row.isForecast ? 'row-forecast' : 'row-actual'}>
                  <td className="highlight">{row.label}</td>
                  <td className="number bold">{row.demand.toLocaleString()}</td>
                  {selectedChannels.map(ch => (
                    <td key={ch} className="number">{(row[ch] || 0).toLocaleString()}</td>
                  ))}
                  {selectedSkus.map(sku => (
                    <td key={sku} className="number">{(row[sku] || 0).toLocaleString()}</td>
                  ))}
                  <td><span className={`action-badge ${row.plannerAction.cls}`}>{row.plannerAction.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHARTS (optional) ────────────────────────────── */}
      <div className="chart-toggle-section">
        <button className="toggle-charts-btn" onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? '▼ Hide' : '▶ Show'} Demand Trend Chart
        </button>
        {showCharts && monthlyRows.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
              <XAxis dataKey="shortLabel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => v.toLocaleString() + ' L'} />
              <Legend />
              <Bar dataKey="demand" fill="#EE1C25" name="Demand (L)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default DemandForecast12Month;
