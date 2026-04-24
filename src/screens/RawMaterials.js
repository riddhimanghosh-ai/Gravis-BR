import React, { useState, useMemo } from 'react';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import {
  MONTH_LABELS,
  MONTHLY_DEMAND,
  SKU_WEIGHTS,
  CHANNEL_WEIGHTS,
  FG_INVENTORY,
  PRODUCTION_STANDARDS,
  RAW_MATERIAL_BOM,
  RAW_MATERIAL_INVENTORY,
} from '../data/realisticSampleData';
import '../styles/RawMaterials.css';

const SKUS     = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
const CHANNELS = ['Parlor', 'Retail', 'HoReCa', 'E-Commerce'];
const CAPACITY = PRODUCTION_STANDARDS.monthlyCapacity; // 1500 L

const RawMaterials = () => {
  const [monthIdx, setMonthIdx] = useState(6); // Apr 2026 default
  const [selectedSkus, setSelectedSkus] = useState(['Vanilla', 'Caramel', 'Mint', 'Chocolate']); // all selected by default

  const computed = useMemo(() => {
    const fullDemand = MONTHLY_DEMAND[monthIdx];

    // ── Totals filtered to selected SKUs only ──────────────────
    const filteredDemand = selectedSkus.reduce((sum, sku) =>
      sum + Math.round(fullDemand * SKU_WEIGHTS[sku]), 0);
    const opening       = Math.round(filteredDemand * 0.40);
    const toProduce     = Math.max(0, filteredDemand - opening);
    const cappedProduce = Math.min(toProduce, CAPACITY);
    const unmetDemand   = Math.max(0, toProduce - CAPACITY);

    // ── SKU breakdown (selected SKUs only) ─────────────────────
    const skuRows = selectedSkus.map(sku => {
      const skuDemand  = Math.round(fullDemand * SKU_WEIGHTS[sku]);
      const skuOpening = Math.round(skuDemand * 0.40);
      const skuProduce = Math.min(Math.max(0, skuDemand - skuOpening), CAPACITY);
      return { sku, skuDemand, skuOpening, skuProduce };
    });

    // ── Channel breakdown (selected SKUs only) ─────────────────
    const channelRows = CHANNELS.map(ch => {
      const chDemand = selectedSkus.reduce((sum, sku) =>
        sum + Math.round(fullDemand * CHANNEL_WEIGHTS[ch][monthIdx] * SKU_WEIGHTS[sku]), 0);
      const chOpening  = Math.round(chDemand * 0.40);
      const chProduce  = Math.max(0, chDemand - chOpening);
      return { channel: ch, chDemand, chOpening, chProduce };
    });

    // ── RM requirements (BOM × selected SKUs produce) ──────────
    const rmRows = RAW_MATERIAL_INVENTORY.map(rm => {
      let required = 0;
      skuRows.forEach(({ sku, skuProduce }) => {
        const bomEntry = RAW_MATERIAL_BOM[sku]?.[rm.name];
        if (bomEntry) required += (skuProduce / 100) * bomEntry.qty;
      });
      required = Math.round(required * 10) / 10;

      const gap = Math.round((required - rm.currentStock) * 10) / 10;
      const orderNeeded = gap > 0;

      let urgency;
      if (!orderNeeded) {
        urgency = { label: '🟢 Sufficient', cls: 'rm-status-ok' };
      } else if (rm.leadTimeDays > 7) {
        urgency = { label: '🔴 Order Urgent', cls: 'rm-status-critical' };
      } else {
        urgency = { label: '🟠 Order Soon', cls: 'rm-status-tight' };
      }
      return { ...rm, required, gap, orderNeeded, urgency };
    });

    // ── FG current stock ────────────────────────────────────────
    const fgRows = SKUS.map(sku => {
      const inv = FG_INVENTORY[sku];
      const dailyDemand = Math.round(filteredDemand / 30);
      const daysOfCover = inv.qty > 0 ? Math.round(inv.qty / (dailyDemand || 1)) : 0;
      return { sku, qty: inv.qty, batches: inv.batches, daysOfCover };
    });

    const orderChecklist = rmRows.filter(r => r.orderNeeded);
    const rmTotal    = rmRows.length;
    const rmWithGap  = rmRows.filter(r => r.orderNeeded).length;
    const urgentCount = rmRows.filter(r => r.orderNeeded && r.urgency.cls === 'rm-status-critical').length;

    return {
      filteredDemand, opening, toProduce: cappedProduce, unmetDemand,
      skuRows, channelRows, rmRows, fgRows, orderChecklist,
      rmTotal, rmWithGap, rmSufficient: rmTotal - rmWithGap, urgentCount,
    };
  }, [monthIdx, selectedSkus]);

  const fmtL = v => `${v.toLocaleString('en-IN')} L`;
  const fmtU = (v, unit) => `${v.toLocaleString('en-IN')} ${unit}`;

  return (
    <div className="raw-materials-container">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="screen-header">
        <h1>🧪 Raw Material Inventory</h1>
        <p>
          BOM-driven requirement check — for a given month's production plan, see what raw materials
          are available, what's short, and what needs to be ordered.
        </p>
      </header>

      {/* ── MONTH SELECTOR ─────────────────────────────────────── */}
      <div className="month-selector-row">
        <label>Planning Month:</label>
        <select value={monthIdx} onChange={e => setMonthIdx(Number(e.target.value))}>
          {MONTH_LABELS.map((lbl, i) => (
            <option key={i} value={i}>{lbl}</option>
          ))}
        </select>
        {computed.unmetDemand > 0 && (
          <span style={{ fontSize: '12px', color: '#EE1C25', fontWeight: 600 }}>
            ⚠ Demand exceeds capacity by {fmtL(computed.unmetDemand)} — only {fmtL(computed.toProduce)} is plannable in-month.
          </span>
        )}
      </div>

      {/* ── SKU FILTER ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <MultiSelectDropdown
          label="🍦 SKUs"
          options={SKUS}
          selected={selectedSkus}
          onChange={setSelectedSkus}
          allLabel="All SKUs"
        />
      </div>

      {/* ── FG PRODUCTION CONTEXT ──────────────────────────────── */}
      <div className="context-card">
        <h2>📦 Production Context — {MONTH_LABELS[monthIdx]}{selectedSkus.length < SKUS.length ? ` (${selectedSkus.join(', ')})` : ''}</h2>

        {/* Summary stat cards — totals for selected SKUs only */}
        <div className="context-grid-3">
          <div className="context-stat">
            <div className="context-stat-label">Total Demand</div>
            <div className="context-stat-value">{fmtL(computed.filteredDemand)}</div>
            {selectedSkus.length < SKUS.length && (
              <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{selectedSkus.length} of {SKUS.length} SKUs</div>
            )}
          </div>
          <div className="context-stat">
            <div className="context-stat-label">Opening Stock (40%)</div>
            <div className="context-stat-value highlight-green">{fmtL(computed.opening)}</div>
          </div>
          <div className="context-stat">
            <div className="context-stat-label">To Produce This Month</div>
            <div className={`context-stat-value ${computed.toProduce > 1000 ? 'highlight-red' : ''}`}>
              {fmtL(computed.toProduce)}
            </div>
          </div>
        </div>

        {/* Two side-by-side breakdown tables */}
        <div className="bifurcation-row">

          {/* Channel Breakdown */}
          <div className="bifurcation-block">
            <div className="bifurcation-title">📊 By Channel</div>
            <table className="mini-sku-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th className="num">Demand (L)</th>
                  <th className="num">Opening (L)</th>
                  <th className="num">To Produce (L)</th>
                </tr>
              </thead>
              <tbody>
                {computed.channelRows.map(r => (
                  <tr key={r.channel}>
                    <td className="sku-name">{r.channel}</td>
                    <td className="num">{r.chDemand.toLocaleString()}</td>
                    <td className="num">{r.chOpening.toLocaleString()}</td>
                    <td className="num">{r.chProduce.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td className="num"><strong>{computed.filteredDemand.toLocaleString()}</strong></td>
                  <td className="num"><strong>{computed.opening.toLocaleString()}</strong></td>
                  <td className="num"><strong>{computed.toProduce.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* SKU Breakdown */}
          <div className="bifurcation-block">
            <div className="bifurcation-title">🍦 By SKU</div>
            <table className="mini-sku-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th className="num">Demand (L)</th>
                  <th className="num">Opening (L)</th>
                  <th className="num">To Produce (L)</th>
                </tr>
              </thead>
              <tbody>
                {computed.skuRows.map(r => (
                  <tr key={r.sku}>
                    <td className="sku-name">{r.sku}</td>
                    <td className="num">{r.skuDemand.toLocaleString()}</td>
                    <td className="num">{r.skuOpening.toLocaleString()}</td>
                    <td className="num">{r.skuProduce.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td className="num"><strong>{computed.skuRows.reduce((s,r)=>s+r.skuDemand,0).toLocaleString()}</strong></td>
                  <td className="num"><strong>{computed.skuRows.reduce((s,r)=>s+r.skuOpening,0).toLocaleString()}</strong></td>
                  <td className="num"><strong>{computed.skuRows.reduce((s,r)=>s+r.skuProduce,0).toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </div>

      {/* ── ORDER CHECKLIST (show prominently if gaps exist) ───── */}
      {computed.orderChecklist.length > 0 ? (
        <div className="order-checklist-section">
          <h2>🛒 Order Checklist — {computed.orderChecklist.length} ingredient{computed.orderChecklist.length > 1 ? 's' : ''} need restocking</h2>
          <p>Place these purchase orders immediately to ensure materials arrive before production starts.</p>
          <table className="order-checklist-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>In Stock</th>
                <th>Required</th>
                <th>Order Amount</th>
                <th>Supplier</th>
                <th>Lead Time</th>
                <th>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {computed.orderChecklist.map(r => (
                <tr key={r.name}>
                  <td className="checklist-ingredient">{r.name}</td>
                  <td>{fmtU(r.currentStock, r.unit)}</td>
                  <td>{fmtU(r.required, r.unit)}</td>
                  <td className="checklist-amount">+{fmtU(r.gap, r.unit)}</td>
                  <td>{r.supplier}</td>
                  <td>{r.leadTimeDays}d</td>
                  <td><span className={r.urgency.cls}>{r.urgency.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="all-sufficient-banner">
          ✅ All raw materials are sufficient for {MONTH_LABELS[monthIdx]} — no purchase orders needed.
        </div>
      )}

      {/* ── RM REQUIREMENTS TABLE ──────────────────────────────── */}
      <div className="table-section">
        <h2>🔬 Raw Material Requirements vs Current Stock</h2>
        <p>
          Required qty is calculated from BOM × production plan for {MONTH_LABELS[monthIdx]}.
          Gap = Required − Current Stock (positive gap = order needed).
        </p>
        <div className="table-wrapper">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Unit</th>
                <th className="num">Current Stock</th>
                <th className="num">Required</th>
                <th className="num">Gap</th>
                <th>Supplier</th>
                <th>Lead Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {computed.rmRows.map(r => (
                <tr
                  key={r.name}
                  className={
                    r.urgency.cls === 'rm-status-critical' ? 'order-row-critical' :
                    r.urgency.cls === 'rm-status-tight'    ? 'order-row-amber' : ''
                  }
                >
                  <td>
                    <div className="rm-ingredient-name">{r.name}</div>
                    <div className="rm-supplier">{r.supplier}</div>
                  </td>
                  <td>{r.unit}</td>
                  <td className="num">{r.currentStock.toLocaleString()}</td>
                  <td className="num">{r.required.toLocaleString()}</td>
                  <td className="num">
                    {r.gap > 0
                      ? <span className="gap-positive">+{r.gap.toLocaleString()}</span>
                      : <span className="gap-zero">{r.gap.toLocaleString()}</span>
                    }
                  </td>
                  <td>{r.supplier}</td>
                  <td>{r.leadTimeDays}d</td>
                  <td><span className={r.urgency.cls}>{r.urgency.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SIDE-BY-SIDE: FG INVENTORY + RM SUMMARY ────────────── */}
      <div className="comparison-row">

        {/* FG Inventory card */}
        <div className="comparison-card">
          <h2>📦 FG Inventory — Current Stock</h2>
          {computed.fgRows.filter(r => selectedSkus.includes(r.sku)).map(r => (
            <div key={r.sku} className="fg-sku-row">
              <div>
                <div className="fg-sku-name">{r.sku}</div>
                <div className="fg-sku-cover">{r.batches} batch{r.batches !== 1 ? 'es' : ''} · {r.daysOfCover}d cover</div>
              </div>
              <div className="fg-sku-qty">{r.qty.toLocaleString()} L</div>
            </div>
          ))}
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#aaa' }}>
            Stock as of today. Days of cover = stock ÷ daily demand ({MONTH_LABELS[monthIdx]}).
          </div>
        </div>

        {/* RM Summary card */}
        <div className="comparison-card">
          <h2>🧪 Raw Material Summary</h2>
          <div className="rm-summary-stat">
            <span className="rm-summary-label">Total ingredients tracked</span>
            <span className="rm-summary-value">{computed.rmTotal}</span>
          </div>
          <div className="rm-summary-stat">
            <span className="rm-summary-label">Sufficient (no order needed)</span>
            <span className="rm-summary-value green">{computed.rmSufficient}</span>
          </div>
          <div className="rm-summary-stat">
            <span className="rm-summary-label">Shortfalls (order needed)</span>
            <span className={`rm-summary-value ${computed.rmWithGap > 0 ? 'red' : 'green'}`}>
              {computed.rmWithGap}
            </span>
          </div>
          {computed.urgentCount > 0 && (
            <div className="rm-summary-stat">
              <span className="rm-summary-label">🔴 Urgent orders (lead &gt; 7d)</span>
              <span className="rm-summary-value red">{computed.urgentCount}</span>
            </div>
          )}
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#aaa' }}>
            Based on BOM × production plan for {MONTH_LABELS[monthIdx]}.
          </div>
        </div>
      </div>

    </div>
  );
};

export default RawMaterials;
