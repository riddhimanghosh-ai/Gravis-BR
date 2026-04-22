import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import {
  FG_INVENTORY, SKU_WEIGHTS, MONTHLY_DEMAND, MONTH_LABELS,
  SHELF_LIFE, INVENTORY_RULES, DECISION_ALERTS,
} from '../data/realisticSampleData';
import '../styles/FGInventory.css';

const CURRENT_MONTH_IDX = 6; // Apr 2026

const statusForDays = d => {
  if (d < 7) return { key: 'critical', label: '🔴 Critical', cls: 'status-critical', action: 'Expedite production' };
  if (d < 14) return { key: 'tight',   label: '🟡 Tight',    cls: 'status-tight',    action: 'Monitor closely' };
  return             { key: 'ok',      label: '🟢 OK',       cls: 'status-ok',       action: '—' };
};

const FGInventory = () => {
  const skus = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
  const currentMonthDemand = MONTHLY_DEMAND[CURRENT_MONTH_IDX];

  const rows = useMemo(() => skus.map(sku => {
    const stock  = FG_INVENTORY[sku].qty;
    const skuMonthlyDemand = currentMonthDemand * SKU_WEIGHTS[sku];
    const dailyDemand = skuMonthlyDemand / 30;
    const daysOfCover = dailyDemand > 0 ? stock / dailyDemand : 0;
    const status = statusForDays(daysOfCover);
    return {
      sku,
      stock,
      batches: FG_INVENTORY[sku].batches,
      shelfLife: SHELF_LIFE[sku],
      skuMonthlyDemand: Math.round(skuMonthlyDemand),
      daysOfCover,
      status,
    };
  }), [currentMonthDemand]);

  const totalStock = rows.reduce((s, r) => s + r.stock, 0);
  const totalBatches = rows.reduce((s, r) => s + r.batches, 0);
  const avgDaysOfCover = rows.reduce((s, r) => s + r.daysOfCover, 0) / rows.length;
  const belowTarget = rows.filter(r => r.daysOfCover < 10).length;

  const alerts = DECISION_ALERTS.filter(a => a.screen === 'cold-chain' || a.screen === 'production').slice(0, 2);

  const chartData = rows.map(r => ({
    sku: r.sku,
    stock: r.stock,
    fill:
      r.status.key === 'critical' ? '#EE1C25' :
      r.status.key === 'tight'    ? '#FFB347' :
                                     '#7AC943',
  }));

  return (
    <div className="fg-inventory-container">
      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>📦 Finished Goods Inventory</h1>
        <p>How much FG stock is on hand right now, by SKU &nbsp;|&nbsp; Warehouse: Main Cold Store &nbsp;|&nbsp; Last counted 23 Apr 2026, 06:00 IST</p>
      </header>

      {/* ── ALERTS ────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="alert-strip">
          <div className="alert-strip-title">⚡ What Needs Your Attention</div>
          <div className="alert-strip-cards">
            {alerts.map(a => (
              <div key={a.id} className={`alert-card alert-${a.priority}`}>
                <div className="alert-card-title">{a.emoji} {a.title}</div>
                <div className="alert-card-action">{a.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUMMARY TILES ─────────────────────────────────── */}
      <div className="tiles-grid">
        <div className="tile">
          <div className="tile-label">Total FG Stock</div>
          <div className="tile-value">{totalStock.toLocaleString()} L</div>
          <div className="tile-sub">Across {skus.length} SKUs</div>
        </div>
        <div className="tile">
          <div className="tile-label">Avg Days of Cover</div>
          <div className="tile-value">{avgDaysOfCover.toFixed(1)}</div>
          <div className="tile-sub">Target: {INVENTORY_RULES.safetyStockDays} days</div>
        </div>
        <div className={`tile ${belowTarget > 0 ? 'tile-warn' : 'tile-ok'}`}>
          <div className="tile-label">SKUs Below 10d Cover</div>
          <div className="tile-value">{belowTarget}</div>
          <div className="tile-sub">{belowTarget > 0 ? 'Action required' : 'All SKUs covered'}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Total Batches</div>
          <div className="tile-value">{totalBatches}</div>
          <div className="tile-sub">FIFO rotation</div>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────── */}
      <div className="table-section">
        <div className="section-header">
          <h2>📋 Stock by SKU — {MONTH_LABELS[CURRENT_MONTH_IDX]} demand basis</h2>
          <p>Days of cover = current stock ÷ (this month's SKU demand ÷ 30 days).</p>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th className="number">Current Stock (L)</th>
                <th className="number"># Batches</th>
                <th className="number">Shelf Life</th>
                <th className="number">This Month's Demand (L)</th>
                <th className="number">Days of Cover</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.sku}>
                  <td className="highlight">{r.sku}</td>
                  <td className="number bold">{r.stock.toLocaleString()}</td>
                  <td className="number">{r.batches}</td>
                  <td className="number">{r.shelfLife}d</td>
                  <td className="number">{r.skuMonthlyDemand.toLocaleString()}</td>
                  <td className="number">{r.daysOfCover.toFixed(1)}</td>
                  <td><span className={`status-pill ${r.status.cls}`}>{r.status.label}</span></td>
                  <td className="action-text">{r.status.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHART ─────────────────────────────────────────── */}
      <div className="chart-section">
        <div className="section-header">
          <h2>📊 Stock Level by SKU</h2>
          <p>Reference line = target 10 days of cover (converted per SKU).</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
            <XAxis dataKey="sku" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Stock (L)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip formatter={v => v.toLocaleString() + ' L'} />
            <Legend />
            <ReferenceLine
              y={Math.round((currentMonthDemand / 30) * 10 * 0.35)}
              stroke="#8B4513"
              strokeDasharray="4 4"
              label={{ value: '~10-day target (avg)', fontSize: 10, fill: '#8B4513' }}
            />
            <Bar dataKey="stock" name="FG Stock (L)" radius={[6,6,0,0]}>
              {chartData.map((c, i) => <Cell key={i} fill={c.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default FGInventory;
