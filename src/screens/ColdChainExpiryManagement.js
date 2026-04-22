import React, { useState, useMemo } from 'react';
import FilterPanel from '../components/FilterPanel';
import { generateRealisticBatches, DECISION_ALERTS } from '../data/realisticSampleData';
import '../styles/ColdChainExpiryManagement.css';

const ColdChainExpiryManagement = () => {
  const cities = useMemo(() => ['Bangalore', 'Hyderabad', 'Chennai', 'Pune'], []);
  const skus   = useMemo(() => ['Vanilla', 'Caramel', 'Mint', 'Chocolate'], []);

  const [filters, setFilters] = useState({ cities, channels: [], skus });
  const [sortBy, setSortBy]   = useState('expiry');

  // Deterministic batches from data file — no randomness
  const allBatches = useMemo(() => generateRealisticBatches(), []);

  const filteredBatches = useMemo(() => {
    let list = allBatches.filter(b =>
      filters.cities.includes(b.city) && filters.skus.includes(b.sku)
    );
    if (sortBy === 'expiry') list = [...list].sort((a, b) => a.daysToExpiry - b.daysToExpiry);
    else if (sortBy === 'risk') list = [...list].sort((a, b) => b.riskScore - a.riskScore);
    else if (sortBy === 'qty')  list = [...list].sort((a, b) => b.quantity - a.quantity);
    return list;
  }, [allBatches, filters, sortBy]);

  const summary = useMemo(() => {
    const expired  = filteredBatches.filter(b => b.daysToExpiry < 0);
    const critical = filteredBatches.filter(b => b.daysToExpiry >= 0 && b.daysToExpiry < 30);
    const atRisk   = filteredBatches.filter(b => b.daysToExpiry >= 30 && b.daysToExpiry < 90);
    const safe     = filteredBatches.filter(b => b.daysToExpiry >= 90);
    const tempAlert = filteredBatches.filter(b => b.storageTemp > -17);
    const totalQty  = filteredBatches.reduce((s, b) => s + b.quantity, 0);
    const storageCost = filteredBatches.reduce((s, b) => s + b.storageCostPerMonth, 0);
    const avgTemp   = filteredBatches.length > 0
      ? (filteredBatches.reduce((s, b) => s + b.storageTemp, 0) / filteredBatches.length).toFixed(1)
      : '-18.0';
    const qty = arr => arr.reduce((s, b) => s + b.quantity, 0);
    const avgDays = arr => arr.length ? Math.round(arr.reduce((s, b) => s + b.daysToExpiry, 0) / arr.length) : 0;
    return {
      total: filteredBatches.length, totalQty, storageCost, avgTemp,
      expired:  { count: expired.length,  qty: qty(expired) },
      critical: { count: critical.length, qty: qty(critical), avgDays: avgDays(critical) },
      atRisk:   { count: atRisk.length,   qty: qty(atRisk),  avgDays: avgDays(atRisk) },
      safe:     { count: safe.length,     qty: qty(safe) },
      tempAlert: tempAlert.length,
    };
  }, [filteredBatches]);

  const coldAlerts = DECISION_ALERTS.filter(a => a.screen === 'cold-chain');

  return (
    <div className="cold-chain-container">

      {/* ── FUTURE PREVIEW BANNER ─────────────────────────────── */}
      <div className="future-preview-banner">
        🚧 FUTURE PREVIEW — Cold Chain &amp; Batch Expiry tracking is not active in this release.
        Data shown is simulated for future feature design.
      </div>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>❄️ Cold Chain &amp; Expiry Management</h1>
        <p>Today: 23 Apr 2026 &nbsp;|&nbsp; Batch-level FIFO tracking &nbsp;|&nbsp; Temperature monitoring &nbsp;|&nbsp; Storage cost optimisation</p>
      </header>

      {/* ── DECISION DASHBOARD (4 big coloured boxes) ─────────── */}
      <div className="decision-dashboard">
        <div className="dash-card dash-expired">
          <div className="dash-count">{summary.expired.count}</div>
          <div className="dash-label">EXPIRED</div>
          <div className="dash-qty">{summary.expired.qty.toLocaleString()} L in store</div>
          <div className="dash-action">🚨 Remove from cold store today</div>
        </div>
        <div className="dash-card dash-critical">
          <div className="dash-count">{summary.critical.count}</div>
          <div className="dash-label">CRITICAL &lt;30 Days</div>
          <div className="dash-qty">{summary.critical.qty.toLocaleString()} L · avg {summary.critical.avgDays}d left</div>
          <div className="dash-action">⚡ Dispatch to Parlor this week</div>
        </div>
        <div className="dash-card dash-at-risk">
          <div className="dash-count">{summary.atRisk.count}</div>
          <div className="dash-label">AT RISK 30–90 Days</div>
          <div className="dash-qty">{summary.atRisk.qty.toLocaleString()} L · avg {summary.atRisk.avgDays}d left</div>
          <div className="dash-action">📋 Schedule in next 2 weeks</div>
        </div>
        <div className="dash-card dash-safe">
          <div className="dash-count">{summary.safe.count}</div>
          <div className="dash-label">SAFE &gt;90 Days</div>
          <div className="dash-qty">{summary.safe.qty.toLocaleString()} L</div>
          <div className="dash-action">✅ Normal FIFO rotation</div>
        </div>
      </div>

      {/* ── ALERTS ────────────────────────────────────────────── */}
      <div className="alert-strip">
        <div className="alert-strip-title">⚡ Actions Required Today</div>
        <div className="alert-strip-cards">
          {coldAlerts.map(a => (
            <div key={a.id} className={`alert-card alert-${a.priority}`}>
              <div className="alert-card-title">{a.emoji} {a.title}</div>
              <div className="alert-card-desc">{a.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTER + SORT ─────────────────────────────────────── */}
      <FilterPanel
        cities={cities} skus={skus}
        defaultSelectedCities={cities} defaultSelectedSkus={skus}
        onFilterChange={setFilters}
      />

      {/* ── KEY METRICS ───────────────────────────────────────── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Batches</div>
          <div className="metric-value">{summary.total}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Stock (L)</div>
          <div className="metric-value">{summary.totalQty.toLocaleString()}</div>
        </div>
        <div className={`metric-card ${summary.tempAlert > 0 ? 'warning' : ''}`}>
          <div className="metric-label">Temp Alert Batches</div>
          <div className="metric-value">{summary.tempAlert}</div>
          <div className="metric-subtext">Temp above −17°C</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Storage Temp</div>
          <div className="metric-value">{summary.avgTemp}°C</div>
          <div className="metric-subtext">Target: −18°C</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Monthly Storage Cost</div>
          <div className="metric-value">₹{(summary.storageCost / 1000).toFixed(0)}K</div>
          <div className="metric-subtext">₹60 per litre/month</div>
        </div>
      </div>

      {/* ── BATCH TABLE ───────────────────────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>📋 Batch Inventory — Complete FIFO List</h2>
          <p>Read the <strong>Recommended Action</strong> column to know what to do with each batch. Expired and critical batches are at the top by default.</p>
        </div>

        <div className="table-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="expiry">⚡ Urgency — expiry soonest first</option>
            <option value="risk">⚠ Risk Score — highest first</option>
            <option value="qty">📦 Quantity — largest first</option>
          </select>
          <span className="record-count">{filteredBatches.length} batches</span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Flavour</th>
                <th>City</th>
                <th className="number">Qty (L)</th>
                <th>Made On</th>
                <th>Expires</th>
                <th className="number">Days Left</th>
                <th className="number">Temp (°C)</th>
                <th className="number">Abuse Hrs ⓘ</th>
                <th>Status</th>
                <th className="number">Risk</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((b, idx) => (
                <tr key={idx} className={`status-${b.fifoStatus.toLowerCase()}`}>
                  <td className="highlight mono">{b.batchId}</td>
                  <td>{b.sku}</td>
                  <td>{b.city}</td>
                  <td className="number">{b.quantity}</td>
                  <td className="text-muted">{b.productionDate}</td>
                  <td className={b.daysToExpiry < 30 ? 'urgent' : 'highlight'}>{b.expiryDate}</td>
                  <td className={`number ${b.daysToExpiry < 0 ? 'expired-text' : b.daysToExpiry < 30 ? 'urgent' : b.daysToExpiry < 90 ? 'warning-text' : ''}`}>
                    {b.daysToExpiry < 0 ? 'EXPIRED' : b.daysToExpiry}
                  </td>
                  <td className={`number ${b.storageTemp > -17 ? 'temp-alert' : ''}`}>{b.storageTemp}</td>
                  <td className={`number ${b.tempAbuseHours >= 4 ? 'urgent' : b.tempAbuseHours >= 2 ? 'warning-text' : ''}`}>
                    {b.tempAbuseHours}h
                  </td>
                  <td>
                    <span className={`status-badge status-${b.fifoStatus.toLowerCase()}`}>{b.fifoStatus}</span>
                  </td>
                  <td className="number risk-score">{b.riskScore}/5</td>
                  <td className="action-cell">{b.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DISTRIBUTION SUMMARY TABLE ───────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>📊 Summary by Expiry Status</h2>
          <p>Daily stand-up view — report these 4 numbers at every shift handover.</p>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th className="number">Batches</th>
                <th className="number">Qty (L)</th>
                <th className="number">Avg Days Left</th>
                <th className="number">Storage Cost/Month</th>
                <th>What to Do Now</th>
              </tr>
            </thead>
            <tbody>
              <tr className="status-expired">
                <td className="highlight">EXPIRED</td>
                <td className="number">{summary.expired.count}</td>
                <td className="number">{summary.expired.qty.toLocaleString()}</td>
                <td className="number expired-text">PAST DUE</td>
                <td className="number">₹{(summary.expired.qty * 60 / 1000).toFixed(0)}K (wasted)</td>
                <td>🚨 Remove today. Do not dispatch. File waste report.</td>
              </tr>
              <tr className="status-critical">
                <td className="highlight">CRITICAL</td>
                <td className="number">{summary.critical.count}</td>
                <td className="number">{summary.critical.qty.toLocaleString()}</td>
                <td className="number urgent">{summary.critical.avgDays} days</td>
                <td className="number">₹{(summary.critical.qty * 60 / 1000).toFixed(0)}K</td>
                <td>⚡ Allocate to Parlor (highest volume) this week</td>
              </tr>
              <tr className="status-at_risk">
                <td className="highlight">AT RISK</td>
                <td className="number">{summary.atRisk.count}</td>
                <td className="number">{summary.atRisk.qty.toLocaleString()}</td>
                <td className="number warning-text">{summary.atRisk.avgDays} days</td>
                <td className="number">₹{(summary.atRisk.qty * 60 / 1000).toFixed(0)}K</td>
                <td>📋 Schedule dispatch. Monitor every 2 days.</td>
              </tr>
              <tr className="status-ok">
                <td className="highlight">SAFE</td>
                <td className="number">{summary.safe.count}</td>
                <td className="number">{summary.safe.qty.toLocaleString()}</td>
                <td className="number">90+ days</td>
                <td className="number">₹{(summary.safe.qty * 60 / 1000).toFixed(0)}K</td>
                <td>✅ Normal FIFO — oldest batch out first</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DECISION GUIDELINES ───────────────────────────────── */}
      <div className="guidelines-section">
        <h2>📌 Cold Chain Decision Guide</h2>
        <div className="guidelines-grid">
          <div className="guideline-card critical">
            <h3>🚨 EXPIRED</h3>
            <p>Remove immediately. Check if storage temperature caused premature expiry. Review cold store maintenance log.</p>
          </div>
          <div className="guideline-card critical">
            <h3>⚡ CRITICAL (&lt;30 days)</h3>
            <p>Allocate to <strong>Parlor channel</strong> (highest daily volume). If &gt;400L, contact 2–3 parlor chains simultaneously. 10–15% trade discount may be needed.</p>
          </div>
          <div className="guideline-card warning">
            <h3>📋 AT RISK (30–90 days)</h3>
            <p>Monitor daily. Prepare FIFO dispatch plan. Alert distributors. Target dispatch within 2 weeks to stay out of critical zone.</p>
          </div>
          <div className="guideline-card ok">
            <h3>✅ SAFE (&gt;90 days)</h3>
            <p>Normal operations. Dispatch oldest batch first (FIFO). Cold store checks every 8 hours. No escalation needed.</p>
          </div>
          <div className="guideline-card warning">
            <h3>🌡 Temperature &gt;−17°C</h3>
            <p>Alert cold store manager. Check compressor and door seals. Any batch above −15°C for &gt;4 hours gets risk 4–5. Plan early dispatch.</p>
          </div>
          <div className="guideline-card">
            <h3>💡 What is "Abuse Hrs"?</h3>
            <p><strong>Abuse hours</strong> = total time the storage temperature was above −17°C. Each hour of abuse shortens the effective shelf life and increases risk. 0 = perfect. &gt;4 hrs = urgent action.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ColdChainExpiryManagement;
