import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FilterPanel from '../components/FilterPanel';
import {
  MONTH_LABELS, MONTH_SHORT, MONTHLY_DEMAND, MONTH_TYPE,
  CHANNEL_WEIGHTS, SKU_WEIGHTS,
  PRODUCTION_STANDARDS, INVENTORY_RULES, DECISION_ALERTS,
} from '../data/realisticSampleData';
import '../styles/ManufacturingExecutionPlanning.css';

const ManufacturingExecutionPlanning = () => {
  const channels = useMemo(() => ['Parlor', 'Retail', 'HoReCa', 'E-Commerce'], []);
  const skus     = useMemo(() => ['Vanilla', 'Caramel', 'Mint', 'Chocolate'], []);

  const [filters, setFilters] = useState({ channels, skus });
  const [showChart, setShowChart] = useState(false);
  const [monthRange, setMonthRange] = useState({ start: 0, end: 11 });

  const MONTHLY_CAPACITY = PRODUCTION_STANDARDS.monthlyCapacity; // 1500 L/month

  // ── Build monthly summary rows ─────────────────────────────────
  const monthlyRows = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      if (idx < monthRange.start || idx > monthRange.end) return null;

      const baseDemand = MONTHLY_DEMAND[idx];

      let filteredDemand = 0;
      filters.channels.forEach(ch => {
        filters.skus.forEach(sku => {
          filteredDemand += Math.round(
            baseDemand * CHANNEL_WEIGHTS[ch][idx] * SKU_WEIGHTS[sku]
          );
        });
      });

      // Inventory: 40% of demand on hand; production needed = demand - current inventory
      const currentInv      = Math.round(filteredDemand * 0.40);
      const productionNeeded = Math.max(0, filteredDemand - currentInv);
      const utilPct         = Math.round((productionNeeded / MONTHLY_CAPACITY) * 100);
      const isForecast      = MONTH_TYPE[idx] === 'Forecast';

      let status, decision, statusClass;
      if (utilPct > 200) {
        status = 'CRITICAL';      statusClass = 'status-critical';
        decision = '🔴 Cannot produce in-month — pre-build inventory from Jan/Feb';
      } else if (utilPct > 100) {
        status = 'OVER-CAPACITY'; statusClass = 'status-warning';
        decision = '🟠 Exceeds capacity — plan extra shift or 3PL pre-stock';
      } else if (utilPct > 80) {
        status = 'TIGHT';         statusClass = 'status-caution';
        decision = '🟡 Near-full — approve overtime this month';
      } else {
        status = 'OK';            statusClass = 'status-ok';
        decision = '✅ Proceed as scheduled';
      }

      return {
        label, shortLabel: MONTH_SHORT[idx], isForecast,
        demand: filteredDemand, currentInv, productionNeeded,
        utilPct, status, statusClass, decision,
      };
    }).filter(r => r !== null);
  }, [filters, monthRange]);

  // ── SKU annual summary (4 clean rows) ─────────────────────────
  const skuSummary = useMemo(() => {
    return skus.map(sku => {
      const skuRows = MONTH_LABELS.map((_, idx) => {
        if (idx < monthRange.start || idx > monthRange.end) return null;
        let d = 0;
        filters.channels.forEach(ch => {
          d += Math.round(MONTHLY_DEMAND[idx] * CHANNEL_WEIGHTS[ch][idx] * SKU_WEIGHTS[sku]);
        });
        return { label: MONTH_LABELS[idx], demand: d };
      }).filter(r => r !== null);
      const annual = skuRows.reduce((s, r) => s + r.demand, 0);
      const peak   = skuRows.reduce((max, r) => r.demand > max.demand ? r : max, { demand: 0 });
      const low    = skuRows.reduce((min, r) => r.demand < min.demand ? r : min, { demand: Infinity });
      return { sku, annual, peakMonth: peak.label || '—', peakDemand: peak.demand || 0, lowMonth: low.label || '—' };
    });
  }, [filters, skus, monthRange]);

  const prodAlerts    = DECISION_ALERTS.filter(a => a.screen === 'production');
  const overCapCount  = monthlyRows.filter(r => r.utilPct > 100).length;
  const criticalCount = monthlyRows.filter(r => r.utilPct > 200).length;

  return (
    <div className="mep-container">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>🏭 Manufacturing Execution Planning</h1>
        <p>Oct 2025 → Sep 2026 &nbsp;|&nbsp; Monthly capacity: 1,500 L &nbsp;|&nbsp; Lines 1+2+3 = 75 L/day × 20 working days</p>
      </header>

      {/* ── ALERT STRIP ──────────────────────────────────────── */}
      <div className="alert-strip">
        <div className="alert-strip-title">⚡ What Needs Your Attention</div>
        <div className="alert-strip-cards">
          {prodAlerts.map(a => (
            <div key={a.id} className={`alert-card alert-${a.priority}`}>
              <div className="alert-card-title">{a.emoji} {a.title}</div>
              <div className="alert-card-action">{a.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MONTH RANGE FILTER ───────────────────────────────── */}
      <div className="filter-panel">
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
      </div>

      {/* ── FILTER ───────────────────────────────────────────── */}
      <FilterPanel
        channels={channels} skus={skus}
        defaultSelectedChannels={channels} defaultSelectedSkus={skus}
        onFilterChange={setFilters}
      />

      {/* ── SUMMARY METRICS ──────────────────────────────────── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Monthly Capacity</div>
          <div className="metric-value">1,500 L</div>
          <div className="metric-subtext">75 L/day × 20 days</div>
        </div>
        <div className={`metric-card ${overCapCount > 0 ? 'negative' : 'positive'}`}>
          <div className="metric-label">Over-Capacity Months</div>
          <div className="metric-value">{overCapCount}</div>
          <div className="metric-subtext">{overCapCount > 0 ? 'Need pre-build strategy' : 'All within capacity'}</div>
        </div>
        <div className={`metric-card ${criticalCount > 0 ? 'negative' : ''}`}>
          <div className="metric-label">Critical Months (&gt;200%)</div>
          <div className="metric-value">{criticalCount}</div>
          <div className="metric-subtext">Jun, Jul, Aug — peak summer</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Annual Production Needed</div>
          <div className="metric-value">{monthlyRows.reduce((s, r) => s + r.productionNeeded, 0).toLocaleString()} L</div>
        </div>
        <div className="metric-card positive">
          <div className="metric-label">Best Month for Maintenance</div>
          <div className="metric-value">{monthlyRows.reduce((min, r) => r.utilPct < min.utilPct ? r : min).label}</div>
          <div className="metric-subtext">Lowest utilisation</div>
        </div>
      </div>

      {/* ── PRIMARY TABLE ─────────────────────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>📋 Monthly Production Plan</h2>
          <p>Use the <strong>Decision</strong> column to know exactly what to do each month. All numbers are in Litres.</p>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Type</th>
                <th className="number">Demand (L)</th>
                <th className="number">In Stock (L)</th>
                <th className="number">Need to Produce (L)</th>
                <th className="number">Capacity (L)</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row, idx) => (
                <tr key={idx} className={row.statusClass}>
                  <td className="highlight">{row.label}</td>
                  <td>
                    <span className={`period-badge ${row.isForecast ? 'badge-forecast' : 'badge-actual'}`}>
                      {row.isForecast ? 'Forecast' : 'Actual'}
                    </span>
                  </td>
                  <td className="number">{row.demand.toLocaleString()}</td>
                  <td className="number">{row.currentInv.toLocaleString()}</td>
                  <td className="number bold">{row.productionNeeded.toLocaleString()}</td>
                  <td className="number">{MONTHLY_CAPACITY.toLocaleString()}</td>
                  <td className="decision-cell">{row.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SKU ANNUAL SUMMARY (4 rows) ───────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>🍦 SKU Annual Summary</h2>
          <p>Annual demand and peak month per flavour — use for raw material procurement and line scheduling.</p>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Flavour</th>
                <th className="number">Annual Demand (L)</th>
                <th className="number">% of Total</th>
                <th>Peak Month</th>
                <th className="number">Peak Demand (L)</th>
                <th>Lowest Month</th>
                <th>Assigned Lines</th>
              </tr>
            </thead>
            <tbody>
              {skuSummary.map((row, idx) => {
                const totalAnnual = skuSummary.reduce((s, r) => s + r.annual, 0);
                const pct = ((row.annual / totalAnnual) * 100).toFixed(1);
                const lineMap = { Vanilla: 'Line 1 + Line 3', Caramel: 'Line 1', Mint: 'Line 2', Chocolate: 'Line 2' };
                return (
                  <tr key={idx}>
                    <td className="sku-name">{row.sku}</td>
                    <td className="number bold">{row.annual.toLocaleString()}</td>
                    <td className="number">{pct}%</td>
                    <td className="highlight">{row.peakMonth}</td>
                    <td className="number">{row.peakDemand.toLocaleString()}</td>
                    <td className="text-muted">{row.lowMonth}</td>
                    <td className="text-muted">{lineMap[row.sku]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHART (secondary) ────────────────────────────────── */}
      <div className="chart-section">
        <button className="toggle-chart-btn" onClick={() => setShowChart(!showChart)}>
          {showChart ? '▼ Hide' : '▶ Show'} Demand vs Capacity Chart
        </button>
        {showChart && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
                <XAxis dataKey="shortLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => v.toLocaleString() + ' L'} />
                <Legend />
                <Bar dataKey="demand"           fill="#EE1C25" name="Demand (L)"           radius={[3,3,0,0]} />
                <Bar dataKey="productionNeeded" fill="#FFB347" name="Need to Produce (L)"  radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── DECISION GUIDELINES ──────────────────────────────── */}
      <div className="guidelines-section">
        <h2>📌 When to Take Action</h2>
        <div className="guidelines-grid">
          <div className="guideline-card ok">
            <h3>✅ ≤100% Utilisation — Normal</h3>
            <p>Production can meet demand in this month. Run standard schedule. Rotate stock FIFO.</p>
          </div>
          <div className="guideline-card caution">
            <h3>🟡 80–100% — Tight</h3>
            <p>Very close to the limit. Pre-approve overtime. Ensure raw materials arrive 2 weeks early.</p>
          </div>
          <div className="guideline-card warning">
            <h3>🟠 100–200% — Over-Capacity</h3>
            <p>You cannot produce all demand this month. Build inventory in the 2–3 preceding months.</p>
          </div>
          <div className="guideline-card critical">
            <h3>🔴 &gt;200% — Critical Gap</h3>
            <p>Jun–Aug summer demand is 14× our monthly capacity. Strategy: max-produce Jan–May and store cold. Never try to produce in-month alone.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ManufacturingExecutionPlanning;
