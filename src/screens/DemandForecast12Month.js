import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import FilterPanel from '../components/FilterPanel';
import {
  MONTH_LABELS, MONTH_SHORT, MONTHLY_DEMAND, MONTH_TYPE,
  CHANNEL_WEIGHTS, SKU_WEIGHTS,
  FORECAST_CI, DECISION_ALERTS,
} from '../data/realisticSampleData';
import '../styles/DemandForecast12Month.css';

const DemandForecast12Month = () => {
  const channels  = useMemo(() => ['Parlor', 'Retail', 'HoReCa', 'E-Commerce'], []);
  const skus      = useMemo(() => ['Vanilla', 'Caramel', 'Mint', 'Chocolate'], []);

  const [filters, setFilters] = useState({ channels, skus });
  const [showCharts, setShowCharts] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // ── Build per-row data for all 12 months ───────────────────────
  const monthlyRows = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      const isForecast = MONTH_TYPE[idx] === 'Forecast';
      const baseDemand = MONTHLY_DEMAND[idx];

      // Apply filters: sum only selected channels × skus (cities aggregate to 1.0)
      let filteredDemand = 0;
      filters.channels.forEach(ch => {
        filters.skus.forEach(sku => {
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

      // Channel breakdown (for display)
      const parlor    = Math.round(filteredDemand * CHANNEL_WEIGHTS['Parlor'][idx]);
      const retail    = Math.round(filteredDemand * CHANNEL_WEIGHTS['Retail'][idx]);
      const horeca    = Math.round(filteredDemand * CHANNEL_WEIGHTS['HoReCa'][idx]);
      const ecom      = Math.round(filteredDemand * CHANNEL_WEIGHTS['E-Commerce'][idx]);

      // Monthly capacity = 1500 L
      const monthlyCapacity = 1500;
      const utilPct = Math.round((filteredDemand / monthlyCapacity) * 100);

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
        label,          // "Oct 2025"
        shortLabel: MONTH_SHORT[idx],  // "Oct 25" (chart axes)
        type: MONTH_TYPE[idx],
        demand: filteredDemand,
        isForecast,
        forecastLower: isForecast ? Math.round(filteredDemand * ci.lower) : null,
        forecastUpper: isForecast ? Math.round(filteredDemand * ci.upper) : null,
        parlor, retail, horeca, ecom,
        plannerAction,
        monthlyCapacity,
      };
    });
  }, [filters]);

  // ── Summary metrics ────────────────────────────────────────────
  const metrics = useMemo(() => {
    const hist = monthlyRows.slice(0, 6);
    const fore = monthlyRows.slice(6, 12);
    const avgHist = Math.round(hist.reduce((s, r) => s + r.demand, 0) / 6);
    const avgFore = Math.round(fore.reduce((s, r) => s + r.demand, 0) / 6);
    const growth  = Math.round(((avgFore - avgHist) / avgHist) * 100);
    const annual  = monthlyRows.reduce((s, r) => s + r.demand, 0);
    const peak    = monthlyRows.reduce((max, r) => r.demand > max.demand ? r : max);
    const lowMonth = monthlyRows.reduce((min, r) => r.demand < min.demand ? r : min);
    const overCapacityMonths = monthlyRows.filter(r => r.demand > r.monthlyCapacity).length;
    return { avgHist, avgFore, growth, annual, peak, lowMonth, overCapacityMonths };
  }, [monthlyRows]);

  // ── Demand-screen alerts ───────────────────────────────────────
  const demandAlerts = DECISION_ALERTS.filter(a => a.screen === 'demand' || a.screen === 'production');

  return (
    <div className="demand-12month-container">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>📊 12-Month Demand Forecast</h1>
        <p>Oct 2025 → Sep 2026 &nbsp;|&nbsp; 6 months actual + 6 months forecast &nbsp;|&nbsp; Use this to plan production, storage, and procurement</p>
      </header>

      {/* ── WHAT NEEDS ATTENTION (alert strip) ────────────────── */}
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

      {/* ── FILTER ───────────────────────────────────────────── */}
      <FilterPanel
        channels={channels} skus={skus}
        defaultSelectedChannels={channels} defaultSelectedSkus={skus}
        onFilterChange={setFilters}
      />

      {/* ── SUMMARY METRICS ──────────────────────────────────── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Avg Actual (Oct–Mar)</div>
          <div className="metric-value">{metrics.avgHist.toLocaleString()} L/mo</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Forecast (Apr–Sep)</div>
          <div className="metric-value">{metrics.avgFore.toLocaleString()} L/mo</div>
        </div>
        <div className={`metric-card ${metrics.growth >= 0 ? 'positive' : 'negative'}`}>
          <div className="metric-label">Season-on-Season Growth</div>
          <div className="metric-value">{metrics.growth >= 0 ? '+' : ''}{metrics.growth}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Annual Demand</div>
          <div className="metric-value">{metrics.annual.toLocaleString()} L</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Peak Month</div>
          <div className="metric-value">{metrics.peak.label}</div>
          <div className="metric-subtext">{metrics.peak.demand.toLocaleString()} L</div>
        </div>
        <div className={`metric-card ${metrics.overCapacityMonths > 0 ? 'negative' : 'positive'}`}>
          <div className="metric-label">Over-Capacity Months</div>
          <div className="metric-value">{metrics.overCapacityMonths}</div>
          <div className="metric-subtext">Need advance stock build</div>
        </div>
      </div>

      {/* ── PRIMARY TABLE: 12-MONTH DEMAND ────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>📋 12-Month Demand Plan</h2>
          <p>Use the <strong>Action</strong> column to decide what to do each month. Blue rows = actual data. Orange rows = forecast.</p>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Type</th>
                <th className="number">Total Demand (L)</th>
                <th className="number">Parlor (L)</th>
                <th className="number">Retail (L)</th>
                <th className="number">HoReCa (L)</th>
                <th className="number">E-Com (L)</th>
                <th className="number">vs Prev Month</th>
                <th>Planner Action</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row, idx) => {
                const prev = idx > 0 ? monthlyRows[idx - 1].demand : 0;
                const mom  = prev > 0 ? Math.round(((row.demand - prev) / prev) * 100) : 0;
                return (
                  <tr key={idx} className={row.isForecast ? 'row-forecast' : 'row-actual'}>
                    <td className="highlight">{row.label}</td>
                    <td><span className={`period-badge ${row.isForecast ? 'badge-forecast' : 'badge-actual'}`}>{row.type}</span></td>
                    <td className="number bold">{row.demand.toLocaleString()}</td>
                    <td className="number">{row.parlor.toLocaleString()}</td>
                    <td className="number">{row.retail.toLocaleString()}</td>
                    <td className="number">{row.horeca.toLocaleString()}</td>
                    <td className="number">{row.ecom.toLocaleString()}</td>
                    <td className={`number ${mom >= 0 ? 'growth-positive' : 'growth-negative'}`}>
                      {idx === 0 ? '—' : `${mom >= 0 ? '+' : ''}${mom}%`}
                    </td>
                    <td><span className={`action-badge ${row.plannerAction.cls}`}>{row.plannerAction.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MATRIX BREAKDOWN: SKU × CHANNEL × MONTH ──────────── */}
      <div className="table-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>🔍 Breakdown: SKU × Channel × Month</h2>
            <p>See which SKU × channel cell drives each month — useful when assigning production lines.</p>
          </div>
          <button className="toggle-charts-btn" onClick={() => setShowMatrix(s => !s)}>
            {showMatrix ? '✖ Hide' : '📊 Show'} SKU × Channel breakdown
          </button>
        </div>

        {showMatrix && (
          <div className="table-wrapper">
            <table className="data-table matrix-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Channel</th>
                  {[6,7,8,9,10,11].map(i => (
                    <th key={i} className="number">{MONTH_LABELS[i]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skus.flatMap(sku => {
                  const skuTotalsByMonth = [6,7,8,9,10,11].map(idx =>
                    Math.round(MONTHLY_DEMAND[idx] * SKU_WEIGHTS[sku])
                  );
                  return [
                    <tr key={`${sku}-hdr`} className="matrix-sku-header">
                      <td colSpan={2} style={{ fontWeight: 800 }}>{sku} — {(SKU_WEIGHTS[sku] * 100).toFixed(0)}% of mix</td>
                      {skuTotalsByMonth.map((v, i) => (
                        <td key={i} className="number bold">{v.toLocaleString()}</td>
                      ))}
                    </tr>,
                    ...channels.map(ch => (
                      <tr key={`${sku}-${ch}`} className="matrix-row">
                        <td style={{ color: '#bbb' }}>↳</td>
                        <td>{ch}</td>
                        {[6,7,8,9,10,11].map(idx => {
                          const cell = Math.round(
                            MONTHLY_DEMAND[idx] * SKU_WEIGHTS[sku] * CHANNEL_WEIGHTS[ch][idx]
                          );
                          return <td key={idx} className="number">{cell.toLocaleString()}</td>;
                        })}
                      </tr>
                    )),
                  ];
                })}
                <tr className="matrix-total-row">
                  <td colSpan={2} style={{ fontWeight: 800 }}>Total (all SKUs × channels)</td>
                  {[6,7,8,9,10,11].map(idx => (
                    <td key={idx} className="number bold">{MONTHLY_DEMAND[idx].toLocaleString()}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SEASONALITY TABLE ─────────────────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>🌡 Seasonality Index</h2>
          <p>Shows how each month compares to the annual average. Use this to plan raw material procurement and cold storage booking.</p>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="number">Demand (L)</th>
                <th className="number">vs Annual Avg</th>
                <th className="number">% of Annual</th>
                <th>Season</th>
                <th>Storage / Procurement Implication</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row, idx) => {
                const avg = metrics.annual / 12;
                const idx_val = (row.demand / avg).toFixed(2);
                const pct = ((row.demand / metrics.annual) * 100).toFixed(1);
                const season = idx_val > 1.3 ? '☀️ Peak Summer' : idx_val > 1.0 ? '🌤 Above Average' : idx_val > 0.85 ? '→ Normal' : '❄️ Low Winter';
                const implication =
                  idx_val > 1.3 ? 'Max cold storage utilisation. Pre-book extra 3PL space.' :
                  idx_val > 1.0 ? 'Ramp up production 4 weeks in advance.' :
                  idx_val > 0.85 ? 'Standard operations. FIFO rotation.' :
                                   'Reduce production batch sizes. Avoid over-stocking.';
                return (
                  <tr key={idx}>
                    <td className="highlight">{row.label}</td>
                    <td className="number">{row.demand.toLocaleString()}</td>
                    <td className="number">{idx_val}×</td>
                    <td className="number">{pct}%</td>
                    <td>{season}</td>
                    <td className="text-muted">{implication}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHARTS (secondary — collapsed by default) ─────────── */}
      <div className="chart-toggle-section">
        <button className="toggle-charts-btn" onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? '▼ Hide' : '▶ Show'} Charts (Channel Distribution &amp; Demand Trend)
        </button>
        {showCharts && (
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Channel Distribution — Full Year</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
                  <XAxis dataKey="shortLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => v.toLocaleString() + ' L'} />
                  <Legend />
                  <Area type="monotone" dataKey="parlor"  stackId="1" fill="#EE1C25" stroke="#EE1C25" name="Parlor" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="retail"  stackId="1" fill="#7AC943" stroke="#7AC943" name="Retail" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="horeca"  stackId="1" fill="#FFB347" stroke="#FFB347" name="HoReCa" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="ecom"    stackId="1" fill="#8B4513" stroke="#8B4513" name="E-Com" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-container">
              <h3>Monthly Demand Trend</h3>
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
            </div>
          </div>
        )}
      </div>

      {/* ── KEY INSIGHTS ──────────────────────────────────────── */}
      <div className="insights-section">
        <h2>📌 Key Planning Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>☀️ Peak Season: Apr – Aug 2026</h3>
            <p>Demand is 48–70% above the winter baseline. You cannot produce enough in-month — start building stock inventory from February onwards.</p>
          </div>
          <div className="insight-card">
            <h3>❄️ Lowest Month: Dec 2025</h3>
            <p>At 10,800L, December is the lowest demand month. Use this period to do deep-cleaning, line maintenance, and staff training.</p>
          </div>
          <div className="insight-card">
            <h3>📦 Annual Total: {metrics.annual.toLocaleString()}L</h3>
            <p>Use this number for annual raw material procurement contracts (milk solids, flavourings, sugar, packaging).</p>
          </div>
          <div className="insight-card">
            <h3>🏭 Capacity Gap: {metrics.overCapacityMonths} Months</h3>
            <p>{metrics.overCapacityMonths > 0 ? `${metrics.overCapacityMonths} months have demand exceeding 1,500L/month capacity. Plan stock build-up in low months (Nov–Feb) to fulfil peak season.` : 'All months are within production capacity.'}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DemandForecast12Month;
