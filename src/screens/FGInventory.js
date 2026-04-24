import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import {
  FG_INVENTORY, SKU_WEIGHTS, MONTHLY_DEMAND, MONTH_LABELS,
  SHELF_LIFE, PRODUCTION_STANDARDS, LIVE_LINE_STATUS,
  WEEKLY_SCHEDULE_TEMPLATE,
} from '../data/realisticSampleData';
import '../styles/FGInventory.css';

const SKUS             = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
const CURRENT_IDX      = 6;  // Apr 2026
const CAPACITY         = PRODUCTION_STANDARDS.monthlyCapacity; // 1500 L
const SAFETY_DAYS      = 10;
const TODAY_STR        = '23 Apr 2026';
const TODAY_DATE       = new Date('2026-04-23');
const WORKING_DAYS_MO  = PRODUCTION_STANDARDS.workingDaysPerMonth;

// SKU brand colours
const SKU_COLOR = {
  Vanilla:   '#f7c948',
  Caramel:   '#c0702a',
  Mint:      '#5bba6f',
  Chocolate: '#4a2c2a',
};

const statusForDays = d => {
  if (d < 5)  return { key: 'critical', label: '🔴 Critical',        cls: 'sp-critical', action: 'Produce immediately' };
  if (d < 10) return { key: 'tight',    label: '🟡 Tight',           cls: 'sp-tight',    action: 'Schedule production soon' };
  if (d < 20) return { key: 'ok',       label: '🟢 OK',              cls: 'sp-ok',       action: 'Monitor — within target' };
  return             { key: 'surplus',  label: '🔵 Surplus',         cls: 'sp-surplus',  action: 'Pause this SKU if line needed' };
};

const addDays = (date, n) => {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
};
const formatDate = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const FGInventory = () => {
  const [showProjection, setShowProjection] = useState(true);
  const monthDemand = MONTHLY_DEMAND[CURRENT_IDX]; // 1850 L

  // ── Per-SKU computed rows ────────────────────────────────────
  const rows = useMemo(() => SKUS.map(sku => {
    const stock          = FG_INVENTORY[sku].qty;
    const batches        = FG_INVENTORY[sku].batches;
    const monthlyDemand  = Math.round(monthDemand * SKU_WEIGHTS[sku]);
    const dailyDemand    = monthlyDemand / 30;
    const daysOfCover    = dailyDemand > 0 ? stock / dailyDemand : 0;
    const stockoutDate   = daysOfCover < 60 ? formatDate(addDays(TODAY_DATE, Math.floor(daysOfCover))) : null;
    const status         = statusForDays(daysOfCover);

    // find if this SKU is currently on a line
    const onLine = LIVE_LINE_STATUS.find(
      l => l.status === 'running' && l.currentSku === sku
    );
    const nextOnLine = LIVE_LINE_STATUS.find(
      l => l.status === 'running' && l.nextSku === sku
    );

    // weekly production from schedule template (week 1 = this week)
    const weeklyProdW1  = (WEEKLY_SCHEDULE_TEMPLATE.skuAllocation[sku]?.[0] || 0) * 5;
    const weeklyProdW2  = (WEEKLY_SCHEDULE_TEMPLATE.skuAllocation[sku]?.[1] || 0) * 5;
    const weeklyProdW3  = (WEEKLY_SCHEDULE_TEMPLATE.skuAllocation[sku]?.[2] || 0) * 5;
    const weeklyProdW4  = (WEEKLY_SCHEDULE_TEMPLATE.skuAllocation[sku]?.[3] || 0) * 5;
    const weeklyDemand  = Math.round(monthlyDemand / 4.33);

    // 4-week stock projection
    const w1End = Math.max(0, stock      + weeklyProdW1 - weeklyDemand);
    const w2End = Math.max(0, w1End      + weeklyProdW2 - weeklyDemand);
    const w3End = Math.max(0, w2End      + weeklyProdW3 - weeklyDemand);
    const w4End = Math.max(0, w3End      + weeklyProdW4 - weeklyDemand);

    const lines = WEEKLY_SCHEDULE_TEMPLATE.lineAssignment[sku]?.join(', ') || '—';

    // produce-now recommendation: if stock + this-week production < 14d cover
    const w1CoverDays = weeklyDemand > 0 ? ((stock + weeklyProdW1) / dailyDemand) : 99;
    const needProduction = w1CoverDays < 14;

    return {
      sku, stock, batches, monthlyDemand, dailyDemand: Math.round(dailyDemand * 10) / 10,
      daysOfCover: Math.round(daysOfCover * 10) / 10, stockoutDate,
      status, onLine, nextOnLine,
      weeklyProdW1, weeklyProdW2, weeklyProdW3, weeklyProdW4,
      weeklyDemand, w1End, w2End, w3End, w4End,
      lines, needProduction, shelfLife: SHELF_LIFE[sku],
    };
  }), [monthDemand]);

  const totalStock   = rows.reduce((s, r) => s + r.stock, 0);
  const criticalSkus = rows.filter(r => r.status.key === 'critical' || r.status.key === 'tight');
  const produceNow   = rows.filter(r => r.needProduction);

  // Monthly capacity per SKU (proportional)
  const skuCapacity = sku => Math.round(CAPACITY * SKU_WEIGHTS[sku]);

  // ── Chart data ───────────────────────────────────────────────
  const chartData = rows.map(r => ({
    sku: r.sku,
    stock: r.stock,
    cover: r.daysOfCover,
    color: r.status.key === 'critical' ? '#EE1C25' :
           r.status.key === 'tight'    ? '#f0a500' :
           r.status.key === 'surplus'  ? '#3b82f6' : '#7AC943',
  }));

  return (
    <div className="fg-inventory-container">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="screen-header">
        <div>
          <h1>📦 Finished Goods Inventory</h1>
          <p>Main Cold Store &nbsp;·&nbsp; Last counted {TODAY_STR}, 06:00 IST &nbsp;·&nbsp; Based on {MONTH_LABELS[CURRENT_IDX]} demand rate</p>
        </div>
      </header>

      {/* ── ACTION BANNER ─────────────────────────────────────── */}
      {produceNow.length > 0 && (
        <div className="action-banner">
          <span className="ab-icon">⚠</span>
          <div>
            <strong>{produceNow.length} SKU{produceNow.length > 1 ? 's' : ''} need production scheduled:</strong>
            {' '}{produceNow.map(r => `${r.sku} (${r.daysOfCover}d cover)`).join(' · ')}
          </div>
        </div>
      )}

      {/* ── KPI STRIP ─────────────────────────────────────────── */}
      <div className="fg-kpi-strip">
        <div className="fg-kpi">
          <div className="fg-kpi-val">{totalStock.toLocaleString()} L</div>
          <div className="fg-kpi-label">Total FG Stock</div>
          <div className="fg-kpi-sub">Across {SKUS.length} SKUs</div>
        </div>
        <div className={`fg-kpi ${criticalSkus.length > 0 ? 'fkpi-warn' : 'fkpi-ok'}`}>
          <div className="fg-kpi-val">{criticalSkus.length}</div>
          <div className="fg-kpi-label">SKUs Below 10-Day Cover</div>
          <div className="fg-kpi-sub">{criticalSkus.length > 0 ? criticalSkus.map(r => r.sku).join(', ') : 'All SKUs OK'}</div>
        </div>
        <div className={`fg-kpi ${produceNow.length > 0 ? 'fkpi-warn' : 'fkpi-ok'}`}>
          <div className="fg-kpi-val">{produceNow.length}</div>
          <div className="fg-kpi-label">SKUs Needing Production</div>
          <div className="fg-kpi-sub">{produceNow.length > 0 ? 'Schedule this week' : 'On track this week'}</div>
        </div>
        <div className="fg-kpi">
          <div className="fg-kpi-val">{MONTH_LABELS[CURRENT_IDX]}</div>
          <div className="fg-kpi-label">Planning Basis</div>
          <div className="fg-kpi-sub">{monthDemand.toLocaleString()} L total demand</div>
        </div>
      </div>

      {/* ── SKU CARDS (main section) ──────────────────────────── */}
      <div className="sku-cards-grid">
        {rows.map(r => (
          <div key={r.sku} className={`sku-card sc-${r.status.key}`}>

            {/* Card header */}
            <div className="sc-header" style={{ borderBottom: `3px solid ${SKU_COLOR[r.sku]}` }}>
              <div>
                <div className="sc-name">{r.sku}</div>
                <div className="sc-meta">{r.batches} batch{r.batches !== 1 ? 'es' : ''} &nbsp;·&nbsp; Shelf life {r.shelfLife}d</div>
              </div>
              <span className={`status-pill ${r.status.cls}`}>{r.status.label}</span>
            </div>

            {/* Key numbers */}
            <div className="sc-nums">
              <div className="sc-num-block">
                <div className="sc-num-val">{r.stock.toLocaleString()}<span className="sc-num-unit"> L</span></div>
                <div className="sc-num-label">In Stock</div>
              </div>
              <div className="sc-num-block">
                <div className={`sc-num-val sc-cover ${r.status.key === 'critical' ? 'cover-red' : r.status.key === 'tight' ? 'cover-yellow' : 'cover-green'}`}>
                  {r.daysOfCover}<span className="sc-num-unit">d</span>
                </div>
                <div className="sc-num-label">Days Cover</div>
              </div>
              <div className="sc-num-block">
                <div className="sc-num-val">{r.dailyDemand}<span className="sc-num-unit"> L/d</span></div>
                <div className="sc-num-label">Daily Burn</div>
              </div>
            </div>

            {/* Cover bar */}
            <div className="sc-cover-bar-wrap">
              <div className="sc-cover-bar-bg">
                <div
                  className={`sc-cover-bar-fill ${r.status.key === 'critical' ? 'bar-red' : r.status.key === 'tight' ? 'bar-yellow' : 'bar-green'}`}
                  style={{ width: `${Math.min(100, (r.daysOfCover / 20) * 100)}%` }}
                />
                <div className="sc-cover-target-line" style={{ left: `${(SAFETY_DAYS / 20) * 100}%` }} />
              </div>
              <div className="sc-cover-bar-labels">
                <span>0d</span><span>Target 10d</span><span>20d</span>
              </div>
            </div>

            {/* Stockout + line status */}
            <div className="sc-detail-rows">
              {r.stockoutDate && r.daysOfCover < 20 && (
                <div className="sc-detail-row">
                  <span className="sc-detail-key">Stockout risk</span>
                  <span className={`sc-detail-val ${r.daysOfCover < 10 ? 'red-text' : ''}`}>~{r.stockoutDate}</span>
                </div>
              )}
              <div className="sc-detail-row">
                <span className="sc-detail-key">Assigned lines</span>
                <span className="sc-detail-val">{r.lines}</span>
              </div>
              {r.onLine && (
                <div className="sc-detail-row sc-on-line">
                  <span className="sc-detail-key">▶ Running now</span>
                  <span className="sc-detail-val green-text">{r.onLine.lineId} — {r.onLine.progressPct}% done ({r.onLine.producedSoFarL} L of {r.onLine.targetTotalL} L)</span>
                </div>
              )}
              {r.nextOnLine && !r.onLine && (
                <div className="sc-detail-row sc-next-up">
                  <span className="sc-detail-key">Next up</span>
                  <span className="sc-detail-val">{r.nextOnLine.lineId} changeover at {r.nextOnLine.changeoverStartTime}</span>
                </div>
              )}
              {!r.onLine && !r.nextOnLine && (
                <div className="sc-detail-row">
                  <span className="sc-detail-key">Line status</span>
                  <span className="sc-detail-val grey-text">Not in current shift</span>
                </div>
              )}
            </div>

            {/* Action recommendation */}
            <div className={`sc-action sc-action-${r.status.key}`}>
              <strong>Action:</strong> {r.status.action}
              {r.needProduction && <span className="sc-produce-chip">Produce this week</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── 4-WEEK STOCK PROJECTION ───────────────────────────── */}
      <div className="table-section">
        <div className="section-header-row">
          <div>
            <h2>📅 4-Week Stock Projection</h2>
            <p>At current production schedule + {MONTH_LABELS[CURRENT_IDX]} demand rate. Red = below 5-day cover. Yellow = below 10-day cover.</p>
          </div>
          <button className="toggle-btn" onClick={() => setShowProjection(s => !s)}>
            {showProjection ? '▲ Hide' : '▼ Show'}
          </button>
        </div>

        {showProjection && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th className="num">Now</th>
                  <th className="num">Wk 1 (Apr 28)</th>
                  <th className="num">Wk 2 (May 5)</th>
                  <th className="num">Wk 3 (May 12)</th>
                  <th className="num">Wk 4 (May 19)</th>
                  <th>Lines</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const proj = [r.stock, r.w1End, r.w2End, r.w3End, r.w4End];
                  return (
                    <tr key={r.sku}>
                      <td className="sku-name-cell">
                        <span className="sku-dot" style={{ background: SKU_COLOR[r.sku] }} />
                        {r.sku}
                      </td>
                      {proj.map((v, i) => {
                        const days = r.dailyDemand > 0 ? v / r.dailyDemand : 99;
                        const cls  = days < 5 ? 'proj-critical' : days < 10 ? 'proj-tight' : 'proj-ok';
                        return (
                          <td key={i} className={`num proj-cell ${cls}`}>
                            <div className="proj-stock">{v.toLocaleString()} L</div>
                            <div className="proj-days">{Math.round(days)}d cover</div>
                          </td>
                        );
                      })}
                      <td className="grey-text small-text">{r.lines}</td>
                    </tr>
                  );
                })}
                {/* Weekly production + demand reference row */}
                <tr className="ref-row">
                  <td className="grey-text">Weekly produced (Wk1–4)</td>
                  {[null, ...rows.map(r => null)].map((_, i) => i === 0 ? (
                    <td key={0} />
                  ) : null)}
                </tr>
                <tr className="ref-row">
                  <td colSpan={6} className="grey-text small-text">
                    Weekly demand: {rows.map(r => `${r.sku} ${r.weeklyDemand}L`).join(' · ')} &nbsp;·&nbsp;
                    Weekly production Wk1: {rows.map(r => `${r.sku} ${r.weeklyProdW1}L`).join(' · ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MONTHLY CAPACITY vs DEMAND PER SKU ───────────────── */}
      <div className="table-section">
        <div className="section-header-row">
          <div>
            <h2>🏭 Monthly Capacity Available vs Demand — by SKU</h2>
            <p>How much of the {CAPACITY.toLocaleString()} L/month capacity is allocated to each SKU, and does it meet demand?</p>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th className="num">Monthly Demand (L)</th>
                <th className="num">Max Capacity (L)</th>
                <th className="num">Gap (L)</th>
                <th className="num">Current Stock (L)</th>
                <th>Can Meet Demand?</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const cap = skuCapacity(r.sku);
                const gap = r.monthlyDemand - (cap + r.stock);
                const canMeet = gap <= 0;
                return (
                  <tr key={r.sku}>
                    <td className="sku-name-cell">
                      <span className="sku-dot" style={{ background: SKU_COLOR[r.sku] }} />
                      {r.sku}
                    </td>
                    <td className="num bold">{r.monthlyDemand.toLocaleString()}</td>
                    <td className="num">{cap.toLocaleString()}</td>
                    <td className={`num bold ${gap > 0 ? 'red-text' : 'green-text'}`}>
                      {gap > 0 ? `+${gap.toLocaleString()}` : '—'}
                    </td>
                    <td className="num">{r.stock.toLocaleString()}</td>
                    <td>
                      <span className={`status-pill ${canMeet ? 'sp-ok' : 'sp-critical'}`}>
                        {canMeet ? '✅ Yes (with stock)' : '⚠ No — pre-build needed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHART ─────────────────────────────────────────────── */}
      <div className="table-section">
        <div className="section-header-row">
          <div>
            <h2>📊 Days of Cover by SKU</h2>
            <p>Red dashed line = 10-day safety stock target. Below this line = schedule production.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e0e0" />
            <XAxis dataKey="sku" tick={{ fontSize: 13, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Days of Cover', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip formatter={(v, name) => [`${v} days`, name === 'cover' ? 'Days of Cover' : name]} />
            <ReferenceLine y={SAFETY_DAYS} stroke="#EE1C25" strokeDasharray="5 5"
              label={{ value: '10-day target', position: 'insideTopRight', fontSize: 11, fill: '#EE1C25' }} />
            <Bar dataKey="cover" name="Days of Cover" radius={[6, 6, 0, 0]}>
              {chartData.map((c, i) => <Cell key={i} fill={c.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default FGInventory;
