/**
 * REALISTIC SAMPLE DATA — Baskin-Robbins India (Graviss Foods)
 *
 * DETERMINISTIC: No Math.random() — every situation is guaranteed to appear.
 * All screens import from here. If you change something here, it reflects everywhere.
 *
 * Planning period: Oct 2025 – Sep 2026 (12 months)
 * Today (simulated): 23 Apr 2026  ← production planner's "today"
 *
 * Cities : Bangalore (40%), Hyderabad (30%), Chennai (20%), Pune (10%)
 * SKUs   : Vanilla (55%), Caramel (22%), Mint (18%), Chocolate (5%)
 * Channels: Parlor (50%), Retail (35%), HoReCa (10%), E-Commerce (5%)
 * Lines  : Line 1 = 30 L/day, Line 2 = 25 L/day, Line 3 = 20 L/day
 * Total  : 75 L/day × 20 working days = 1,500 L/month capacity
 */

export const TODAY = new Date('2026-04-23');

// ─────────────────────────────────────────────────────────────────
// 1. MONTH LABELS  (always show Month + Year)
// ─────────────────────────────────────────────────────────────────
export const MONTH_LABELS = [
  'Oct 2025', 'Nov 2025', 'Dec 2025',
  'Jan 2026', 'Feb 2026', 'Mar 2026',
  'Apr 2026', 'May 2026', 'Jun 2026',
  'Jul 2026', 'Aug 2026', 'Sep 2026',
];

// Abbreviated for chart axes only (where space is tight)
export const MONTH_SHORT = [
  'Oct 25', 'Nov 25', 'Dec 25',
  'Jan 26', 'Feb 26', 'Mar 26',
  'Apr 26', 'May 26', 'Jun 26',
  'Jul 26', 'Aug 26', 'Sep 26',
];

// ─────────────────────────────────────────────────────────────────
// 2. MONTHLY DEMAND BASELINE  (all cities + SKUs + channels combined)
// ─────────────────────────────────────────────────────────────────
// Seasonality: Indian ice cream peaks Apr–Aug (summer heat).
// Oct–Mar are historical actuals; Apr–Sep are forecasts.
// Calibrated to plant scale (capacity = 1,500 L/month).
// Oct–Mar: 72–94% util (manageable).   Apr–Sep: 112–141% util (pre-build required).
export const MONTHLY_DEMAND = [
  1250,  // Oct 2025 — Actual   —  83% util — post-monsoon, moderate
  1120,  // Nov 2025 — Actual   —  75% util — cooling weather, demand falls
  1080,  // Dec 2025 — Actual   —  72% util — winter, lowest month
  1150,  // Jan 2026 — Actual   —  77% util — Republic Day festival lift
  1220,  // Feb 2026 — Actual   —  81% util — late winter, slight recovery
  1410,  // Mar 2026 — Actual   —  94% util — pre-summer warming, rising (TIGHT)
  1850,  // Apr 2026 — Forecast — 123% util — summer STARTS  ⚠ OVER CAPACITY
  1980,  // May 2026 — Forecast — 132% util — full summer     ⚠ OVER CAPACITY
  2120,  // Jun 2026 — Forecast — 141% util — PEAK MONTH      ⚠ PRE-BUILD
  2050,  // Jul 2026 — Forecast — 137% util — sustained peak  ⚠ OVER CAPACITY
  1930,  // Aug 2026 — Forecast — 129% util — summer tail-off ⚠ OVER CAPACITY
  1680,  // Sep 2026 — Forecast — 112% util — transition to winter
];

// Months that are Actual vs Forecast (first 6 = actual, next 6 = forecast)
export const MONTH_TYPE = [
  'Actual','Actual','Actual','Actual','Actual','Actual',
  'Forecast','Forecast','Forecast','Forecast','Forecast','Forecast',
];

// ─────────────────────────────────────────────────────────────────
// 3. DISTRIBUTION WEIGHTS
// ─────────────────────────────────────────────────────────────────

// Parlor peaks in summer (people visit scoop shops more when hot)
export const CHANNEL_WEIGHTS = {
  'Parlor':     [0.48, 0.47, 0.45, 0.46, 0.47, 0.48, 0.52, 0.54, 0.55, 0.54, 0.53, 0.50],
  'Retail':     [0.36, 0.36, 0.38, 0.37, 0.37, 0.36, 0.34, 0.33, 0.32, 0.33, 0.34, 0.36],
  'HoReCa':     [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10],
  'E-Commerce': [0.06, 0.07, 0.07, 0.07, 0.06, 0.06, 0.04, 0.03, 0.03, 0.03, 0.03, 0.04],
};

export const CITY_WEIGHTS = {
  'Bangalore': 0.40,
  'Hyderabad': 0.30,
  'Chennai':   0.20,
  'Pune':      0.10,
};

export const SKU_WEIGHTS = {
  'Vanilla':   0.55,
  'Caramel':   0.22,
  'Mint':      0.18,
  'Chocolate': 0.05,
};

// ─────────────────────────────────────────────────────────────────
// 4. PRODUCTION CAPACITY
// ─────────────────────────────────────────────────────────────────
export const PRODUCTION_LINES = {
  'Line 1': { capacityPerDay: 30, skus: ['Vanilla', 'Caramel'] },
  'Line 2': { capacityPerDay: 25, skus: ['Mint', 'Chocolate'] },
  'Line 3': { capacityPerDay: 20, skus: ['Vanilla', 'Caramel'] },
};

export const PRODUCTION_STANDARDS = {
  totalDailyCapacity: 75,    // L/day
  workingDaysPerMonth: 20,
  monthlyCapacity: 1500,     // L/month (75 × 20)
};

// ─────────────────────────────────────────────────────────────────
// 5. INVENTORY RULES
// ─────────────────────────────────────────────────────────────────
export const INVENTORY_RULES = {
  safetyStockDays: 10,
  minBatchSize: 50,            // L
  maxWarehouseCapacity: 8000,  // L per city
  targetTurnoverDays: 45,
};

// ─────────────────────────────────────────────────────────────────
// 6. SHELF LIFE BY SKU  (days at −18°C)
// ─────────────────────────────────────────────────────────────────
export const SHELF_LIFE = {
  'Vanilla':   720,   // 24 months — stable formula
  'Caramel':   600,   // 20 months — caramel can crystallize
  'Mint':      540,   // 18 months — mint flavor degrades faster
  'Chocolate': 600,   // 20 months — cocoa butter stable
};

// ─────────────────────────────────────────────────────────────────
// 7. FORECAST CONFIDENCE INTERVALS
// ─────────────────────────────────────────────────────────────────
export const FORECAST_CI = {
  months1_3:  { lower: 0.92, upper: 1.08 },   // ±8%  near-term
  months4_6:  { lower: 0.88, upper: 1.12 },   // ±12% mid-term
  months7_9:  { lower: 0.82, upper: 1.18 },   // ±18% far-term
  months10_12:{ lower: 0.75, upper: 1.25 },   // ±25% very far
};

// ─────────────────────────────────────────────────────────────────
// 8. DETERMINISTIC BATCH INVENTORY
// ─────────────────────────────────────────────────────────────────
// Every situation a production planner needs to see is represented.
// daysOld is relative to TODAY (2026-04-23).
// expiryDate = productionDate + SHELF_LIFE[sku]
// daysToExpiry = (expiryDate - today)

const RAW_BATCHES = [
  // ── EXPIRED (2 batches) ──────────────────────────────────────────
  { id:'BR-CHE-MIN-00001', sku:'Mint',      city:'Chennai',   qty:180,  daysOld:545, tempC:-18.1, abusHrs:0 },
  { id:'BR-HYD-CHO-00002', sku:'Chocolate', city:'Hyderabad', qty:95,   daysOld:610, tempC:-17.9, abusHrs:1 },

  // ── CRITICAL  (<30 days to expiry) ─────────────────────────────
  { id:'BR-CHE-VAN-00003', sku:'Vanilla',   city:'Chennai',   qty:650,  daysOld:700, tempC:-16.2, abusHrs:5 },  // large, temp abuse!
  { id:'BR-BLR-CAR-00004', sku:'Caramel',   city:'Bangalore', qty:320,  daysOld:578, tempC:-18.0, abusHrs:0 },
  { id:'BR-PUN-MIN-00005', sku:'Mint',      city:'Pune',      qty:210,  daysOld:519, tempC:-17.8, abusHrs:2 },

  // ── AT RISK  (30–90 days to expiry) ────────────────────────────
  { id:'BR-HYD-VAN-00006', sku:'Vanilla',   city:'Hyderabad', qty:480,  daysOld:668, tempC:-18.2, abusHrs:0 },
  { id:'BR-BLR-MIN-00007', sku:'Mint',      city:'Bangalore', qty:260,  daysOld:470, tempC:-18.0, abusHrs:1 },
  { id:'BR-CHE-CAR-00008', sku:'Caramel',   city:'Chennai',   qty:420,  daysOld:555, tempC:-16.8, abusHrs:3 },  // temp alert
  { id:'BR-HYD-CHO-00009', sku:'Chocolate', city:'Hyderabad', qty:140,  daysOld:555, tempC:-17.5, abusHrs:2 },
  { id:'BR-PUN-VAN-00010', sku:'Vanilla',   city:'Pune',      qty:190,  daysOld:672, tempC:-18.1, abusHrs:0 },
  { id:'BR-BLR-CAR-00011', sku:'Caramel',   city:'Bangalore', qty:380,  daysOld:548, tempC:-18.3, abusHrs:0 },

  // ── NORMAL / SAFE batches (>90 days to expiry) ─────────────────
  // Bangalore
  { id:'BR-BLR-VAN-00012', sku:'Vanilla',   city:'Bangalore', qty:720,  daysOld:30,  tempC:-18.2, abusHrs:0 },
  { id:'BR-BLR-VAN-00013', sku:'Vanilla',   city:'Bangalore', qty:450,  daysOld:65,  tempC:-18.0, abusHrs:0 },
  { id:'BR-BLR-VAN-00014', sku:'Vanilla',   city:'Bangalore', qty:510,  daysOld:110, tempC:-17.9, abusHrs:0 },
  { id:'BR-BLR-CAR-00015', sku:'Caramel',   city:'Bangalore', qty:280,  daysOld:45,  tempC:-18.1, abusHrs:0 },
  { id:'BR-BLR-CAR-00016', sku:'Caramel',   city:'Bangalore', qty:360,  daysOld:90,  tempC:-18.0, abusHrs:0 },
  { id:'BR-BLR-MIN-00017', sku:'Mint',      city:'Bangalore', qty:230,  daysOld:50,  tempC:-18.2, abusHrs:0 },
  { id:'BR-BLR-MIN-00018', sku:'Mint',      city:'Bangalore', qty:310,  daysOld:100, tempC:-18.0, abusHrs:1 },
  { id:'BR-BLR-CHO-00019', sku:'Chocolate', city:'Bangalore', qty:120,  daysOld:40,  tempC:-18.1, abusHrs:0 },
  { id:'BR-BLR-CHO-00020', sku:'Chocolate', city:'Bangalore', qty:85,   daysOld:80,  tempC:-18.0, abusHrs:0 },
  // Hyderabad
  { id:'BR-HYD-VAN-00021', sku:'Vanilla',   city:'Hyderabad', qty:530,  daysOld:35,  tempC:-17.8, abusHrs:1 },
  { id:'BR-HYD-VAN-00022', sku:'Vanilla',   city:'Hyderabad', qty:390,  daysOld:75,  tempC:-18.0, abusHrs:0 },
  { id:'BR-HYD-VAN-00023', sku:'Vanilla',   city:'Hyderabad', qty:480,  daysOld:120, tempC:-17.9, abusHrs:0 },
  { id:'BR-HYD-CAR-00024', sku:'Caramel',   city:'Hyderabad', qty:240,  daysOld:55,  tempC:-17.7, abusHrs:2 },
  { id:'BR-HYD-CAR-00025', sku:'Caramel',   city:'Hyderabad', qty:315,  daysOld:95,  tempC:-18.1, abusHrs:0 },
  { id:'BR-HYD-MIN-00026', sku:'Mint',      city:'Hyderabad', qty:200,  daysOld:60,  tempC:-17.8, abusHrs:1 },
  { id:'BR-HYD-MIN-00027', sku:'Mint',      city:'Hyderabad', qty:175,  daysOld:130, tempC:-18.0, abusHrs:0 },
  { id:'BR-HYD-CHO-00028', sku:'Chocolate', city:'Hyderabad', qty:90,   daysOld:50,  tempC:-18.2, abusHrs:0 },
  // Chennai
  { id:'BR-CHE-VAN-00029', sku:'Vanilla',   city:'Chennai',   qty:350,  daysOld:40,  tempC:-17.5, abusHrs:2 },
  { id:'BR-CHE-VAN-00030', sku:'Vanilla',   city:'Chennai',   qty:280,  daysOld:85,  tempC:-17.8, abusHrs:1 },
  { id:'BR-CHE-VAN-00031', sku:'Vanilla',   city:'Chennai',   qty:410,  daysOld:150, tempC:-18.0, abusHrs:0 },
  { id:'BR-CHE-CAR-00032', sku:'Caramel',   city:'Chennai',   qty:180,  daysOld:55,  tempC:-17.6, abusHrs:2 },
  { id:'BR-CHE-CAR-00033', sku:'Caramel',   city:'Chennai',   qty:210,  daysOld:110, tempC:-17.9, abusHrs:0 },
  { id:'BR-CHE-MIN-00034', sku:'Mint',      city:'Chennai',   qty:155,  daysOld:70,  tempC:-17.4, abusHrs:3 },
  { id:'BR-CHE-CHO-00035', sku:'Chocolate', city:'Chennai',   qty:70,   daysOld:45,  tempC:-17.7, abusHrs:1 },
  // Pune
  { id:'BR-PUN-VAN-00036', sku:'Vanilla',   city:'Pune',      qty:260,  daysOld:30,  tempC:-18.3, abusHrs:0 },
  { id:'BR-PUN-VAN-00037', sku:'Vanilla',   city:'Pune',      qty:190,  daysOld:75,  tempC:-18.1, abusHrs:0 },
  { id:'BR-PUN-CAR-00038', sku:'Caramel',   city:'Pune',      qty:120,  daysOld:50,  tempC:-18.2, abusHrs:0 },
  { id:'BR-PUN-MIN-00039', sku:'Mint',      city:'Pune',      qty:95,   daysOld:90,  tempC:-18.0, abusHrs:0 },
  { id:'BR-PUN-CHO-00040', sku:'Chocolate', city:'Pune',      qty:55,   daysOld:60,  tempC:-18.1, abusHrs:0 },
];

export const generateRealisticBatches = () => {
  return RAW_BATCHES.map(b => {
    const productionDate = new Date(TODAY);
    productionDate.setDate(productionDate.getDate() - b.daysOld);

    const shelfLifeDays = SHELF_LIFE[b.sku];
    const expiryDate = new Date(productionDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

    const daysToExpiry = Math.floor((expiryDate - TODAY) / (1000 * 60 * 60 * 24));

    let fifoStatus;
    let riskScore;
    if (daysToExpiry < 0) {
      fifoStatus = 'EXPIRED';   riskScore = 5;
    } else if (daysToExpiry < 30) {
      fifoStatus = 'CRITICAL';  riskScore = 5;
    } else if (daysToExpiry < 90) {
      fifoStatus = 'AT_RISK';   riskScore = b.abusHrs > 3 ? 4 : 3;
    } else {
      fifoStatus = 'OK';        riskScore = b.abusHrs > 3 ? 3 : b.abusHrs > 1 ? 2 : 1;
    }
    // Temperature abuse bumps up risk
    if (b.tempC > -17) riskScore = Math.min(5, riskScore + 1);

    const action =
      fifoStatus === 'EXPIRED'  ? '🚨 Remove from cold store today' :
      fifoStatus === 'CRITICAL' && b.qty > 300 ? '⚡ Move to Parlor channel — high volume dispatch' :
      fifoStatus === 'CRITICAL' ? '⚠ Allocate to nearest outlet this week' :
      fifoStatus === 'AT_RISK' && b.tempC > -17 ? '🌡 Alert cold store manager + plan dispatch' :
      fifoStatus === 'AT_RISK'  ? '📋 Schedule for next week dispatch' :
      b.tempC > -17             ? '🌡 Check temperature — slight deviation' :
                                   '✅ Normal rotation (FIFO)';

    return {
      batchId: b.id,
      sku: b.sku,
      city: b.city,
      quantity: b.qty,
      productionDate: productionDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      daysToExpiry,
      storageTemp: b.tempC,
      tempAbuseHours: b.abusHrs,
      fifoStatus,
      riskScore,
      storageCostPerMonth: Math.round(b.qty * 60),
      recommendedAction: action,
    };
  });
};

// ─────────────────────────────────────────────────────────────────
// 9. WEEKLY PRODUCTION SCHEDULE  (8-week rolling from Apr 21 2026)
// ─────────────────────────────────────────────────────────────────
// SKU allocations are L/day. 5 working days per week.
export const WEEKLY_SCHEDULE_TEMPLATE = {
  skuAllocation: {
    'Vanilla':   [45, 48, 52, 55, 60, 58, 52, 48],
    'Caramel':   [20, 21, 22, 24, 26, 25, 23, 20],
    'Mint':      [18, 19, 20, 22, 24, 23, 21, 18],
    'Chocolate': [ 8,  8,  8,  9, 10, 10,  9,  8],
  },
  lineAssignment: {
    'Vanilla':   ['Line 1', 'Line 3'],
    'Caramel':   ['Line 1'],
    'Mint':      ['Line 2'],
    'Chocolate': ['Line 2'],
  },
};

// ─────────────────────────────────────────────────────────────────
// 10. PRICING DATA
// ─────────────────────────────────────────────────────────────────
export const PRICING = {
  'Vanilla':   { cost: 320, parlor: 450, retail: 480, horeca: 420, ecom: 550 },
  'Caramel':   { cost: 380, parlor: 520, retail: 550, horeca: 490, ecom: 620 },
  'Mint':      { cost: 360, parlor: 500, retail: 530, horeca: 470, ecom: 600 },
  'Chocolate': { cost: 350, parlor: 480, retail: 510, horeca: 450, ecom: 580 },
};

// ─────────────────────────────────────────────────────────────────
// 11. DECISION ALERTS  (pre-computed, used by alert strips on every screen)
// ─────────────────────────────────────────────────────────────────
// Derived from the fixed data above — no random, always the same.
export const DECISION_ALERTS = [
  {
    id: 'alert-001',
    priority: 'critical',
    screen: 'cold-chain',
    emoji: '🚨',
    title: '2 Batches EXPIRED in Storage',
    description: 'BR-CHE-MIN-00001 (180L Mint, Chennai) and BR-HYD-CHO-00002 (95L Chocolate, Hyderabad) have passed their expiry date. Remove immediately to prevent regulatory issues.',
    action: 'Go to Cold Chain screen → filter by EXPIRED',
  },
  {
    id: 'alert-002',
    priority: 'critical',
    screen: 'cold-chain',
    emoji: '⚡',
    title: '650L Vanilla Expires in 22 Days — Chennai',
    description: 'Batch BR-CHE-VAN-00003: 650 litres of Vanilla, Chennai warehouse. This is also showing temperature abuse (−16.2°C, 5 abuse hrs). Urgent dispatch to high-volume Parlor outlets.',
    action: 'Contact Chennai Parlor distributors for immediate allocation',
  },
  {
    id: 'alert-003',
    priority: 'critical',
    screen: 'production',
    emoji: '📊',
    title: 'Jun 2026 Demand (2,120 L) Exceeds Monthly Capacity (1,500 L)',
    description: 'Peak summer demand in June is 1.41× our monthly production capacity — a 620 L shortfall. This cannot be met from production alone. Start pre-building inventory now (Apr/May) using spare capacity from low-season months.',
    action: 'Go to Manufacturing screen → check Jun, Jul, Aug rows',
  },
  {
    id: 'alert-004',
    priority: 'warning',
    screen: 'cold-chain',
    emoji: '🌡',
    title: 'Temperature Alert — Chennai & Hyderabad Cold Stores',
    description: '3 batches showing storage temperature above −17°C: BR-CHE-VAN-00003 (−16.2°C), BR-CHE-CAR-00008 (−16.8°C), BR-HYD-VAN-00006 (−18.2°C OK). Chennai cold store needs maintenance check.',
    action: 'Alert cold store manager. Check compressor status.',
  },
  {
    id: 'alert-005',
    priority: 'warning',
    screen: 'production',
    emoji: '📅',
    title: 'Peak Season Ramp-Up Starts This Week',
    description: 'Apr 2026 demand (1,850 L) is 31% higher than March and already 123% of monthly capacity. Production must run at full allocation this week. Vanilla and Caramel lines should be at peak.',
    action: 'Approve this week\'s production plan for Line 1, 2, 3',
  },
  {
    id: 'alert-006',
    priority: 'info',
    screen: 'demand',
    emoji: '📈',
    title: 'Annual Demand Peak: Jun 2026 at 2,120 L',
    description: 'Forecast confidence interval for Jun: ±12% (±254 L). Confirm pre-build plan across Jan–May spare capacity. Storage must be available to hold carry-over.',
    action: 'Share 12-month forecast with procurement team',
  },
];

// ─────────────────────────────────────────────────────────────────
// 12. FG INVENTORY — current stock by SKU (as of TODAY)
// ─────────────────────────────────────────────────────────────────
// qty is in litres; warehouses are national-aggregate for now (city dim = future).
export const FG_INVENTORY = {
  'Vanilla':   { qty: 310, batches: 4, warehouse: 'Main Cold Store', lastCounted: '2026-04-23T06:00:00' },
  'Caramel':   { qty: 124, batches: 2, warehouse: 'Main Cold Store', lastCounted: '2026-04-23T06:00:00' },
  'Mint':      { qty: 102, batches: 3, warehouse: 'Main Cold Store', lastCounted: '2026-04-23T06:00:00' },
  'Chocolate': { qty:  28, batches: 1, warehouse: 'Main Cold Store', lastCounted: '2026-04-23T06:00:00' },
};

// ─────────────────────────────────────────────────────────────────
// 13. LIVE LINE STATUS — shop floor view (as of TODAY 10:45 AM)
// ─────────────────────────────────────────────────────────────────
// shiftStart = 08:00, shiftEnd = 17:00 (9h shift incl 1h lunch)
export const LIVE_LINE_STATUS = [
  {
    lineId: 'Line 1',
    status: 'running',
    currentSku: 'Vanilla',
    shiftStartTime: '08:00',
    startedAt: '2026-04-23T08:15:00',
    expectedEndAt: '2026-04-23T14:00:00',
    producedSoFarL: 16.5,
    targetTotalL: 30,
    progressPct: 55,
    nextSku: 'Caramel',
    changeoverStartTime: '14:00',
    changeoverDuration: 45, // minutes
    operator: 'A. Kumar',
  },
  {
    lineId: 'Line 2',
    status: 'running',
    currentSku: 'Mint',
    shiftStartTime: '08:00',
    startedAt: '2026-04-23T08:30:00',
    expectedEndAt: '2026-04-23T13:30:00',
    producedSoFarL: 13.0,
    targetTotalL: 25,
    progressPct: 52,
    nextSku: 'Chocolate',
    changeoverStartTime: '13:30',
    changeoverDuration: 60,
    operator: 'P. Reddy',
  },
  {
    lineId: 'Line 3',
    status: 'down',
    currentSku: null,
    shiftStartTime: '08:00',
    startedAt: null,
    expectedEndAt: null,
    producedSoFarL: 6.0, // ran briefly before breakdown
    targetTotalL: 20,
    progressPct: 30,
    nextSku: 'Vanilla',
    changeoverStartTime: null,
    changeoverDuration: 0,
    operator: 'R. Singh',
    downtimeReason: 'Compressor maintenance — unplanned',
    downtimeSince: '2026-04-23T09:15:00',
    expectedResumeAt: '2026-04-23T12:30:00',
  },
];

// ─────────────────────────────────────────────────────────────────
// 14. DOWNTIME EVENTS — rolling 48h log
// ─────────────────────────────────────────────────────────────────
export const DOWNTIME_EVENTS = [
  { id: 'DT-003', line: 'Line 3', reason: 'Compressor maintenance', type: 'unplanned', status: 'active',    startedAt: '2026-04-23T09:15:00', expectedResumeAt: '2026-04-23T12:30:00', durationMin: 195 },
  { id: 'DT-004', line: 'Line 1', reason: 'Changeover (Vanilla → Caramel)', type: 'planned',   status: 'scheduled', startedAt: '2026-04-23T14:00:00', expectedResumeAt: '2026-04-23T14:45:00', durationMin:  45 },
  { id: 'DT-005', line: 'Line 2', reason: 'Changeover (Mint → Chocolate)',  type: 'planned',   status: 'scheduled', startedAt: '2026-04-23T13:30:00', expectedResumeAt: '2026-04-23T14:30:00', durationMin:  60 },
  { id: 'DT-002', line: 'Line 2', reason: 'Filling station jam', type: 'unplanned', status: 'resolved',  startedAt: '2026-04-22T15:30:00', expectedResumeAt: '2026-04-22T16:15:00', durationMin:  45 },
  { id: 'DT-001', line: 'Line 1', reason: 'End-of-day CIP',      type: 'planned',   status: 'resolved',  startedAt: '2026-04-22T17:00:00', expectedResumeAt: '2026-04-22T18:00:00', durationMin:  60 },
];

// ─────────────────────────────────────────────────────────────────
// 15. LINE CONFIGS — extended PRODUCTION_LINES for CRUD
// ─────────────────────────────────────────────────────────────────
export const LINE_CONFIGS = [
  { id: 'line-1', name: 'Line 1', capacityPerDay: 30, supportedSkus: ['Vanilla', 'Caramel'],   shiftPattern: '8h × 1 shift', operator: 'A. Kumar', status: 'active', installedDate: '2019-06-15' },
  { id: 'line-2', name: 'Line 2', capacityPerDay: 25, supportedSkus: ['Mint', 'Chocolate'],    shiftPattern: '8h × 1 shift', operator: 'P. Reddy', status: 'active', installedDate: '2020-03-10' },
  { id: 'line-3', name: 'Line 3', capacityPerDay: 20, supportedSkus: ['Vanilla', 'Caramel'],   shiftPattern: '8h × 1 shift', operator: 'R. Singh', status: 'active', installedDate: '2022-11-22' },
];

export const SIMULATED_TODAY = '2026-04-23T10:45:00';

// ─────────────────────────────────────────────────────────────────
// 16. RAW MATERIAL BILL OF MATERIALS  (per SKU, per 100 L produced)
// ─────────────────────────────────────────────────────────────────
export const RAW_MATERIAL_BOM = {
  'Vanilla': {
    'Milk Powder':     { qty: 22,  unit: 'kg' },
    'Fresh Cream':     { qty: 55,  unit: 'L'  },
    'Sugar':           { qty: 10,  unit: 'kg' },
    'Vanilla Essence': { qty: 0.8, unit: 'L'  },
    'Stabilizer Mix':  { qty: 0.3, unit: 'kg' },
  },
  'Caramel': {
    'Milk Powder':     { qty: 22,  unit: 'kg' },
    'Fresh Cream':     { qty: 50,  unit: 'L'  },
    'Sugar':           { qty: 12,  unit: 'kg' },
    'Caramel Syrup':   { qty: 5,   unit: 'L'  },
    'Stabilizer Mix':  { qty: 0.3, unit: 'kg' },
  },
  'Mint': {
    'Milk Powder':     { qty: 22,  unit: 'kg' },
    'Fresh Cream':     { qty: 52,  unit: 'L'  },
    'Sugar':           { qty: 10,  unit: 'kg' },
    'Mint Flavor':     { qty: 1,   unit: 'L'  },
    'Stabilizer Mix':  { qty: 0.3, unit: 'kg' },
  },
  'Chocolate': {
    'Milk Powder':     { qty: 20,  unit: 'kg' },
    'Fresh Cream':     { qty: 48,  unit: 'L'  },
    'Sugar':           { qty: 11,  unit: 'kg' },
    'Cocoa Powder':    { qty: 3,   unit: 'kg' },
    'Stabilizer Mix':  { qty: 0.3, unit: 'kg' },
  },
};

// ─────────────────────────────────────────────────────────────────
// 17. RAW MATERIAL INVENTORY — current stock (as of TODAY)
// ─────────────────────────────────────────────────────────────────
// Stock levels intentionally set so Sugar and Caramel Syrup show
// shortfalls at Apr 2026 default view. All others sufficient.
export const RAW_MATERIAL_INVENTORY = [
  { name: 'Milk Powder',     unit: 'kg', currentStock: 450, supplier: 'Amul Dairy',      leadTimeDays: 3  },
  { name: 'Fresh Cream',     unit: 'L',  currentStock: 800, supplier: 'Amul Dairy',      leadTimeDays: 1  },
  { name: 'Sugar',           unit: 'kg', currentStock: 100, supplier: 'EID Parry',       leadTimeDays: 7  },
  { name: 'Vanilla Essence', unit: 'L',  currentStock: 8,   supplier: 'Givaudan',        leadTimeDays: 14 },
  { name: 'Caramel Syrup',   unit: 'L',  currentStock: 10,  supplier: 'Sethness',        leadTimeDays: 10 },
  { name: 'Mint Flavor',     unit: 'L',  currentStock: 6,   supplier: 'Givaudan',        leadTimeDays: 14 },
  { name: 'Cocoa Powder',    unit: 'kg', currentStock: 12,  supplier: 'Barry Callebaut', leadTimeDays: 21 },
  { name: 'Stabilizer Mix',  unit: 'kg', currentStock: 5,   supplier: 'Kerry Group',     leadTimeDays: 7  },
];

// ─────────────────────────────────────────────────────────────────
// LEGACY EXPORT  (keeps old screens that haven't been updated working)
// ─────────────────────────────────────────────────────────────────
export const REALISTIC_MONTHLY_BASELINE = {
  months: MONTH_LABELS,
  monthlyDemand: MONTHLY_DEMAND,
  channelDistribution: CHANNEL_WEIGHTS,
  cityDistribution: CITY_WEIGHTS,
  skuDistribution: SKU_WEIGHTS,
  shelfLife: SHELF_LIFE,
};

export const FORECAST_CI_LEGACY = FORECAST_CI;

export default {
  TODAY,
  MONTH_LABELS,
  MONTH_SHORT,
  MONTHLY_DEMAND,
  MONTH_TYPE,
  CHANNEL_WEIGHTS,
  CITY_WEIGHTS,
  SKU_WEIGHTS,
  SHELF_LIFE,
  PRODUCTION_LINES,
  PRODUCTION_STANDARDS,
  INVENTORY_RULES,
  FORECAST_CI,
  WEEKLY_SCHEDULE_TEMPLATE,
  PRICING,
  DECISION_ALERTS,
  FG_INVENTORY,
  LIVE_LINE_STATUS,
  DOWNTIME_EVENTS,
  LINE_CONFIGS,
  SIMULATED_TODAY,
  REALISTIC_MONTHLY_BASELINE,
  generateRealisticBatches,
  RAW_MATERIAL_BOM,
  RAW_MATERIAL_INVENTORY,
};
