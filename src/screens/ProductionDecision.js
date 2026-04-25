import React, { useMemo, useState } from 'react';
import {
  MONTHLY_DEMAND,
  MONTH_LABELS,
  MONTH_TYPE,
  SKU_WEIGHTS,
  PRODUCTION_STANDARDS,
  INVENTORY_RULES,
  DECISION_ALERTS,
} from '../data/realisticSampleData';
import '../styles/ProductionDecision.css';

/**
 * Production Decision — A/B/C framework
 * Answers: "How much should we produce this month —
 *          just the deficit (A), full capacity (B), or deficit + buffer (C)?"
 */
const ProductionDecision = () => {
  // Planner is making decisions for the current / upcoming month.
  // Default to Mar 2026 (idx 5) — cleanest trade-off for the demo.
  // Switch to Apr/May/Jun to see how the framework handles peak-season capacity squeeze.
  const [monthIdx, setMonthIdx] = useState(5);

  // ── Constants / assumptions ─────────────────────────────────
  const OPENING_RATIO = INVENTORY_RULES.openingInventoryRatio ?? 0.40;
  const CAPACITY = PRODUCTION_STANDARDS.monthlyCapacity; // 1500 L

  const assumptions = {
    variableCost: 80,     // ₹/L
    holdingCost: 2,       // ₹/L/month
    changeoverCost: 5000, // ₹
    marginPerL: 120,      // ₹
    Z: 1.65,
    CV: 0.15,
  };

  const monthLabel = MONTH_LABELS[monthIdx];
  const monthlyDemand = MONTHLY_DEMAND[monthIdx];
  const monthType = MONTH_TYPE[monthIdx];

  // ── SKU-level breakdown ─────────────────────────────────────
  const skuRows = useMemo(() => {
    return Object.entries(SKU_WEIGHTS).map(([sku, weight]) => {
      const demand = Math.round(monthlyDemand * weight);
      const opening = Math.round(demand * OPENING_RATIO);
      const deficit = demand - opening;
      const sigma = Math.round(demand * assumptions.CV);
      const buffer = Math.round(assumptions.Z * sigma);
      const optionA = deficit;
      const optionB = Math.round(CAPACITY * weight);
      const optionC = deficit + buffer;
      return { sku, weight, demand, opening, deficit, sigma, buffer, optionA, optionB, optionC };
    });
  }, [monthlyDemand, OPENING_RATIO, CAPACITY, assumptions.CV, assumptions.Z]);

  // ── Totals ──────────────────────────────────────────────────
  const totals = useMemo(() => {
    const totalDemand = skuRows.reduce((s, r) => s + r.demand, 0);
    const totalOpening = skuRows.reduce((s, r) => s + r.opening, 0);
    const totalDeficit = skuRows.reduce((s, r) => s + r.deficit, 0);
    const totalBuffer = skuRows.reduce((s, r) => s + r.buffer, 0);
    const spareCapacity = CAPACITY - totalDeficit;
    return { totalDemand, totalOpening, totalDeficit, totalBuffer, spareCapacity };
  }, [skuRows, CAPACITY]);

  // ── 12-Month Production Plan (all months, Option C) ──────────
  const monthlyProductionPlan = useMemo(() => {
    return MONTH_LABELS.map((label, idx) => {
      const demand = MONTHLY_DEMAND[idx];
      const planRow = { month: label, totalDemand: demand };

      Object.entries(SKU_WEIGHTS).forEach(([sku, weight]) => {
        const skuDemand = Math.round(demand * weight);
        const skuOpening = Math.round(skuDemand * OPENING_RATIO);
        const skuDeficit = skuDemand - skuOpening;
        const sigma = Math.round(skuDemand * assumptions.CV);
        const buffer = Math.round(assumptions.Z * sigma);
        // Option C: deficit + buffer
        planRow[`${sku}_demand`] = skuDemand;
        planRow[`${sku}_prod`] = Math.min(skuDeficit + buffer, Math.round(CAPACITY * weight));
      });

      return planRow;
    });
  }, [OPENING_RATIO, assumptions.CV, assumptions.Z, CAPACITY]);

  // ── Option A — Deficit only ─────────────────────────────────
  const optionA = useMemo(() => {
    const targetProduction = totals.totalDeficit;
    const production = Math.min(targetProduction, CAPACITY);
    const deficitShortfall = Math.max(0, targetProduction - CAPACITY);
    const prodCost = production * assumptions.variableCost;
    const changeovers = 1;
    const bufferStockoutL = skuRows.reduce((s, r) => s + r.sigma, 0);
    // Two sources of stockout: (a) uncovered forecast error, (b) actual deficit not produced
    const stockoutCost = bufferStockoutL * assumptions.marginPerL + deficitShortfall * assumptions.marginPerL;
    const holdingCost = 0;
    const total = prodCost + changeovers * assumptions.changeoverCost + stockoutCost;
    const utilization = (production / CAPACITY) * 100;
    const capacityConstrained = deficitShortfall > 0;
    return {
      label: 'A — Deficit Only',
      production,
      targetProduction,
      shortfall: deficitShortfall,
      capacityConstrained,
      prodCost,
      changeoverCost: changeovers * assumptions.changeoverCost,
      holdingCost,
      capitalCost: 0,
      stockoutCost,
      nextMoSaved: 0,
      total,
      utilization,
      serviceLevel: capacityConstrained
        ? `~70% (deficit ${Math.round(deficitShortfall)} L exceeds capacity)`
        : '~85% (no forecast-error buffer)',
      reasoning: capacityConstrained
        ? `Deficit (${targetProduction} L) alone exceeds capacity (${CAPACITY} L). Producing max possible (${production} L) still leaves ${Math.round(deficitShortfall)} L stockout. Pre-build from prior months is mandatory.`
        : 'Produce only what is missing vs opening inventory. Lowest production cost but no protection against forecast error — expect stockouts if demand runs hot.',
    };
  }, [totals.totalDeficit, skuRows, CAPACITY, assumptions.variableCost, assumptions.marginPerL, assumptions.changeoverCost]);

  // ── Option B — Full capacity ────────────────────────────────
  const optionB = useMemo(() => {
    const production = CAPACITY;
    const prodCost = production * assumptions.variableCost;
    const carryOver = Math.max(0, production - totals.totalDeficit);
    const holdingCost = carryOver * assumptions.holdingCost * 1.5;
    const capitalCost = carryOver * assumptions.variableCost * 0.01;
    const stockoutCost = 200;
    const nextMoSaved = 5000;
    const total =
      prodCost +
      assumptions.changeoverCost +
      holdingCost +
      capitalCost +
      stockoutCost -
      nextMoSaved;
    const utilization = (production / CAPACITY) * 100;
    return {
      label: 'B — Full Capacity',
      production,
      prodCost,
      changeoverCost: assumptions.changeoverCost,
      holdingCost,
      capitalCost,
      stockoutCost,
      nextMoSaved,
      total,
      utilization,
      serviceLevel: '~99%',
      reasoning:
        'Run the line at 100% and bank inventory ahead of peak season. Highest service level but ties up working capital and incurs extra holding cost on carry-over stock.',
    };
  }, [CAPACITY, totals.totalDeficit, assumptions.variableCost, assumptions.holdingCost, assumptions.changeoverCost]);

  // ── Option C — Deficit + statistical buffer (RECOMMENDED) ──
  const optionC = useMemo(() => {
    const targetProduction = totals.totalDeficit + totals.totalBuffer;
    const production = Math.min(targetProduction, CAPACITY);
    const shortfall = Math.max(0, targetProduction - CAPACITY);
    const prodCost = production * assumptions.variableCost;
    const effectiveBuffer = Math.max(0, production - totals.totalDeficit);
    const holdingCost = effectiveBuffer * assumptions.holdingCost * 1;
    const capitalCost = effectiveBuffer * assumptions.variableCost * 0.01;
    const stockoutCost = shortfall > 0 ? shortfall * assumptions.marginPerL * 0.3 : 300;
    const nextMoSaved = 2500;
    const total =
      prodCost +
      assumptions.changeoverCost +
      holdingCost +
      capitalCost +
      stockoutCost -
      nextMoSaved;
    const utilization = (production / CAPACITY) * 100;
    const capacityConstrained = shortfall > 0;
    return {
      label: 'C — Deficit + Safety Buffer',
      production,
      targetProduction,
      shortfall,
      capacityConstrained,
      prodCost,
      changeoverCost: assumptions.changeoverCost,
      holdingCost,
      capitalCost,
      stockoutCost,
      nextMoSaved,
      total,
      utilization,
      serviceLevel: capacityConstrained
        ? `~90% (capacity-limited; ${Math.round(shortfall)} L short of full buffer)`
        : '95% ✓',
      reasoning: capacityConstrained
        ? `Target was ${Math.round(targetProduction)} L (deficit ${totals.totalDeficit} + buffer ${totals.totalBuffer}) but monthly capacity caps it at ${CAPACITY} L. Short ${Math.round(shortfall)} L of statistical buffer → must be pre-built from prior months or sourced via 3PL.`
        : 'Produce the deficit plus a statistical safety buffer (Z=1.65 × σ, ~15% CV per SKU) to cover forecast error. Balanced cost vs service level — the default recommendation.',
    };
  }, [totals.totalDeficit, totals.totalBuffer, CAPACITY, assumptions.variableCost, assumptions.holdingCost, assumptions.changeoverCost, assumptions.marginPerL]);

  const alerts = DECISION_ALERTS.filter(a => a.screen === 'production' || a.screen === 'demand');

  const fmtL = v => `${Math.round(v).toLocaleString('en-IN')} L`;
  const fmtINR = v => `₹${Math.round(v).toLocaleString('en-IN')}`;
  const fmtPct = v => `${v.toFixed(1)}%`;

  return (
    <div className="prod-decision-container">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="screen-header">
        <div className="screen-header-row">
          <div>
            <h1>🎯 Production Decision — {monthLabel}</h1>
            <p>
              Decide: produce the deficit only (A), run full capacity (B),
              or produce deficit + safety buffer (C). Based on forecast, opening stock and statistical forecast error (Z=1.65 × σ, 15% CV).
            </p>
          </div>
          <div className="month-selector">
            <label htmlFor="month-select">Planning month:</label>
            <select
              id="month-select"
              value={monthIdx}
              onChange={e => setMonthIdx(Number(e.target.value))}
            >
              {MONTH_LABELS.map((label, i) => (
                <option key={i} value={i}>
                  {label} ({MONTH_TYPE[i]})
                </option>
              ))}
            </select>
            <span className={`month-type-pill month-type-${monthType.toLowerCase()}`}>{monthType}</span>
          </div>
        </div>
      </header>

      {/* ── ALERT STRIP ────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="alert-strip">
          <div className="alert-strip-title">What Needs Attention</div>
          <div className="alert-strip-cards">
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} className={`alert-card alert-${a.priority}`}>
                <div className="alert-card-title">{a.emoji} {a.title}</div>
                <div className="alert-card-action">{a.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTEXT CARD ───────────────────────────────────── */}
      <div className="context-card">
        <div className="context-title">Context · {monthLabel}</div>
        <div className="context-grid">
          <div className="context-item">
            <div className="context-label">Forecast Demand</div>
            <div className="context-value">{fmtL(totals.totalDemand)}</div>
          </div>
          <div className="context-item">
            <div className="context-label">Opening FG Inventory</div>
            <div className="context-value">{fmtL(totals.totalOpening)}</div>
            <div className="context-hint">{Math.round(OPENING_RATIO * 100)}% of monthly demand</div>
          </div>
          <div className="context-item">
            <div className="context-label">Net Deficit</div>
            <div className="context-value context-deficit">{fmtL(totals.totalDeficit)}</div>
            <div className="context-hint">Demand − Opening</div>
          </div>
          <div className="context-item">
            <div className="context-label">Monthly Capacity</div>
            <div className="context-value">{fmtL(CAPACITY)}</div>
          </div>
          <div className="context-item">
            <div className="context-label">Spare Capacity</div>
            <div className={`context-value ${totals.spareCapacity < 0 ? 'context-deficit' : 'context-ok'}`}>
              {fmtL(totals.spareCapacity)}
            </div>
            <div className="context-hint">Capacity − Deficit</div>
          </div>
        </div>
      </div>

      {/* ── SKU TABLE ──────────────────────────────────────── */}
      <div className="section-card">
        <h2 className="section-title">SKU-Level Breakdown</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th className="num">Forecast Demand</th>
                <th className="num">Opening FG</th>
                <th className="num">Deficit</th>
                <th className="num">Option A</th>
                <th className="num">Option B</th>
                <th className="num col-highlight">Option C ✓</th>
              </tr>
            </thead>
            <tbody>
              {skuRows.map(r => (
                <tr key={r.sku}>
                  <td className="sku-cell">{r.sku}</td>
                  <td className="num">{r.demand.toLocaleString('en-IN')}</td>
                  <td className="num">{r.opening.toLocaleString('en-IN')}</td>
                  <td className="num">{r.deficit.toLocaleString('en-IN')}</td>
                  <td className="num">{r.optionA.toLocaleString('en-IN')}</td>
                  <td className="num">{r.optionB.toLocaleString('en-IN')}</td>
                  <td className="num col-highlight"><strong>{r.optionC.toLocaleString('en-IN')}</strong></td>
                </tr>
              ))}
              <tr className="totals-row">
                <td>TOTAL</td>
                <td className="num">{totals.totalDemand.toLocaleString('en-IN')}</td>
                <td className="num">{totals.totalOpening.toLocaleString('en-IN')}</td>
                <td className="num">{totals.totalDeficit.toLocaleString('en-IN')}</td>
                <td className="num">{optionA.production.toLocaleString('en-IN')}</td>
                <td className="num">{optionB.production.toLocaleString('en-IN')}</td>
                <td className="num col-highlight"><strong>{optionC.production.toLocaleString('en-IN')}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="table-note">
          SKU weights: Vanilla 55% · Caramel 22% · Mint 18% · Chocolate 5%.
          Option B allocates full monthly capacity pro-rata.
        </p>
      </div>

      {/* ── MONTHLY PRODUCTION PLAN BY SKU ──────────────────── */}
      <div className="section-card">
        <h2 className="section-title">📅 Monthly Production Plan (Option C) — Demand vs Production</h2>
        <p className="section-subtitle">Shows what each SKU should produce each month to meet demand + safety buffer.</p>

        <div className="prod-plan-grid">
          {['Vanilla', 'Caramel', 'Mint', 'Chocolate'].map(sku => (
            <div key={sku} className="prod-plan-card">
              <div className="prod-plan-header">{sku}</div>
              <div className="table-wrap">
                <table className="prod-plan-table">
                  <thead>
                    <tr>
                      <th className="month-col">Month</th>
                      <th className="num">Demand (L)</th>
                      <th className="num">Production (L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyProductionPlan.map((row, idx) => (
                      <tr key={idx} className={idx === monthIdx ? 'current-month' : ''}>
                        <td className="month-col">{row.month}</td>
                        <td className="num">{(row[`${sku}_demand`] || 0).toLocaleString('en-IN')}</td>
                        <td className="num"><strong>{(row[`${sku}_prod`] || 0).toLocaleString('en-IN')}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OPTION CARDS ───────────────────────────────────── */}
      <div className="option-grid">
        {[optionA, optionB, { ...optionC, recommended: true }].map((opt, i) => (
          <div key={i} className={`option-card ${opt.recommended ? 'option-recommended' : ''}`}>
            {opt.recommended && <div className="recommended-badge">✓ RECOMMENDED</div>}
            <div className="option-label">{opt.label}</div>
            <div className="option-metrics">
              <div className="option-metric">
                <div className="option-metric-label">Total Production</div>
                <div className="option-metric-value">{fmtL(opt.production)}</div>
              </div>
              <div className="option-metric">
                <div className="option-metric-label">Capacity Utilization</div>
                <div className="option-metric-value">{fmtPct(opt.utilization)}</div>
              </div>
              <div className="option-metric">
                <div className="option-metric-label">Estimated Total Cost</div>
                <div className="option-metric-value">{fmtINR(opt.total)}</div>
              </div>
              <div className="option-metric">
                <div className="option-metric-label">Service Level</div>
                <div className="option-metric-value">{opt.serviceLevel}</div>
              </div>
            </div>
            <p className="option-reasoning">{opt.reasoning}</p>
          </div>
        ))}
      </div>

      {/* ── COST BREAKDOWN TABLE ───────────────────────────── */}
      <div className="section-card">
        <h2 className="section-title">Cost Breakdown Comparison</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cost Line</th>
                <th className="num">A — Deficit</th>
                <th className="num">B — Full Capacity</th>
                <th className="num col-highlight">C — Deficit + Buffer ✓</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Production ({fmtINR(assumptions.variableCost)}/L)</td>
                <td className="num">{fmtINR(optionA.prodCost)}</td>
                <td className="num">{fmtINR(optionB.prodCost)}</td>
                <td className="num col-highlight">{fmtINR(optionC.prodCost)}</td>
              </tr>
              <tr>
                <td>Changeover</td>
                <td className="num">{fmtINR(optionA.changeoverCost)}</td>
                <td className="num">{fmtINR(optionB.changeoverCost)}</td>
                <td className="num col-highlight">{fmtINR(optionC.changeoverCost)}</td>
              </tr>
              <tr>
                <td>Holding</td>
                <td className="num">{fmtINR(optionA.holdingCost)}</td>
                <td className="num">{fmtINR(optionB.holdingCost)}</td>
                <td className="num col-highlight">{fmtINR(optionC.holdingCost)}</td>
              </tr>
              <tr>
                <td>Capital Tie-up (1%/mo)</td>
                <td className="num">{fmtINR(optionA.capitalCost)}</td>
                <td className="num">{fmtINR(optionB.capitalCost)}</td>
                <td className="num col-highlight">{fmtINR(optionC.capitalCost)}</td>
              </tr>
              <tr>
                <td>Stockout Risk</td>
                <td className="num">{fmtINR(optionA.stockoutCost)}</td>
                <td className="num">{fmtINR(optionB.stockoutCost)}</td>
                <td className="num col-highlight">{fmtINR(optionC.stockoutCost)}</td>
              </tr>
              <tr>
                <td>Next-month CO Saved</td>
                <td className="num">−{fmtINR(optionA.nextMoSaved)}</td>
                <td className="num">−{fmtINR(optionB.nextMoSaved)}</td>
                <td className="num col-highlight">−{fmtINR(optionC.nextMoSaved)}</td>
              </tr>
              <tr className="totals-row">
                <td>TOTAL</td>
                <td className="num">{fmtINR(optionA.total)}</td>
                <td className="num">{fmtINR(optionB.total)}</td>
                <td className="num col-highlight"><strong>{fmtINR(optionC.total)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RECOMMENDATION BANNER ──────────────────────────── */}
      <div className="recommendation-banner">
        <div className="recommendation-badge">RECOMMENDATION</div>
        <div className="recommendation-title">
          Produce Option C — {fmtL(optionC.production)} total ({fmtPct(optionC.utilization)} capacity)
        </div>
        {optionC.capacityConstrained && (
          <div className="recommendation-warning">
            ⚠ Capacity-constrained this month. Full buffer target was {fmtL(optionC.targetProduction)}
            ({fmtL(optionC.shortfall)} short). Pre-build from prior months or plan 3PL overflow.
          </div>
        )}
        <ul className="recommendation-list">
          {skuRows.map(r => (
            <li key={r.sku}>
              <strong>{r.sku}:</strong> deficit {r.deficit.toLocaleString('en-IN')} L + buffer {r.buffer.toLocaleString('en-IN')} L
              &nbsp;→ target {r.optionC.toLocaleString('en-IN')} L
            </li>
          ))}
          <li><strong>Estimated cost:</strong> {fmtINR(optionC.total)}</li>
          <li><strong>Service level:</strong> {optionC.serviceLevel}</li>
          <li><strong>Reasoning:</strong> Covers demand + 1.65σ forecast error at balanced cost.</li>
        </ul>
        <div className="recommendation-override">
          Override to Option B if: peak-season demand spike confirmed and cold storage is available to hold carry-over.
          Drop to Option A only if working capital is severely constrained this month.
        </div>
      </div>

      {/* ── DECISION RULE BOX ──────────────────────────────── */}
      <div className="decision-rule-box">
        <div className="decision-rule-label">Decision Rule</div>
        <div className="decision-rule-text">
          Produce extra only if:&nbsp;
          <em>Expected Stockout Cost Avoided + Future Changeover Saved &gt; Holding Cost + Capital Tie-up + Spoilage Risk</em>
        </div>
      </div>

    </div>
  );
};

export default ProductionDecision;
