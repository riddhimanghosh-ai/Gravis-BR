# Cold Chain & Expiry Management System Requirements

## Business Context

As an ice cream manufacturer with perishable products, you face:

### **Challenge 1: Cold Chain Costs**
- Frozen storage electricity: ~₹50-75/L/month
- Refrigerated transport: ₹15-25/L
- Cold storage facility maintenance: ₹100K+/month
- **Total monthly cost**: ₹8-12 lakhs for typical inventory

### **Challenge 2: Temperature Abuse Risks**
- Transport temperature spike (35°C outside, truck interior can reach 45°C)
- Loading dock delays (10-15 min exposure)
- Last-mile delivery (open container, summer temperature)
- **Risk**: Product quality degradation, customer complaints

### **Challenge 3: SKU Expiry Management**
- Ice cream shelf life: 18-24 months (varies by SKU)
- Vanilla: 24 months (highest demand, FIFO easier)
- Caramel: 20 months (medium shelf life)
- Mint: 18 months (pigment stability concern)
- Chocolate: 20 months (fat oxidation risk)
- **Problem**: Inefficient FIFO rotation = spoilage

### **Challenge 4: Waste & Spoilage**
- Current spoilage rate: 2-3% of production
- Main causes: Expired stock, temperature abuse, inventory excess
- **Cost**: ₹15-30 L/month waste

---

## Solution: Cold Chain & Expiry Management System

### **Component 1: Inventory Expiry Tracking**

**What to Track**:
```
For each SKU in each location:
├─ Current quantity (L)
├─ Production date (batch)
├─ Expiry date (batch)
├─ Days until expiry
├─ Storage temperature (current)
├─ Cumulative temperature abuse hours
├─ FIFO status (on track / at risk)
└─ Spoilage risk score (1-5)
```

**Data Structure**:
```javascript
{
  skuId: 'vanilla',
  location: 'Bangalore-Cold-Store-1',
  batch: 'BATCH-2026-04-15-001',
  quantity: 500, // liters
  productionDate: '2026-04-15',
  expiryDate: '2028-04-15', // 24 months for Vanilla
  daysToExpiry: 695,
  temperatureNow: -18°C,
  temperatureAbusedHours: 2, // times temp > -15°C
  fifoStatus: 'OK', // OK / AT_RISK / EXPIRED
  spoilageRiskScore: 1, // 1=safe, 5=imminent spoilage
  lastInventoryCheck: '2026-04-23 14:30',
  location: 'Bangalore-Store-1',
}
```

---

### **Component 2: Cold Chain Cost Optimization**

**What to Optimize**:

1. **Storage Cost Reduction**
   - Current: 500L Vanilla in storage = 500 × ₹60/L/month = ₹30K/month
   - Target: Optimal stock level = min(safety stock + monthly demand, max capacity)
   - Savings: Reduce overstock by 20% = ₹6K/month per SKU

2. **Transport Cost Optimization**
   - Current: Full trucks (300L) at ₹15/L = ₹4.5K per shipment
   - Optimize: Consolidate shipments, better route planning
   - Savings: 10% better utilization = ₹450/shipment

3. **Spoilage Reduction**
   - Current: 2-3% spoilage = ₹15-30L/month
   - Target: < 1% spoilage with FIFO discipline
   - Savings: ₹7.5-22.5L/month

**Example Dashboard**:
```
Cold Chain Cost Analysis
├─ Monthly Storage Cost: ₹8.5L
│  ├─ Vanilla (120L @ ₹60/L): ₹7.2L
│  ├─ Caramel (85L @ ₹60/L): ₹5.1L  
│  ├─ Mint (55L @ ₹60/L): ₹3.3L
│  └─ Chocolate (28L @ ₹60/L): ₹1.7L
│
├─ Optimization Opportunities: -₹2.1L/month possible
│  ├─ Reduce Vanilla overstock: -₹1.2L
│  ├─ Better shelf rotation: -₹600K (reduce spoilage)
│  └─ Consolidate transport: -₹300K
│
└─ Projected Annual Savings: ₹25.2L
```

---

### **Component 3: FIFO Rotation Strategy**

**Current Problem**: 
- No systematic tracking of "older" stock
- Newer batches used before older ones (LIFO instead of FIFO)
- Expiry dates approach → forced discarding

**Solution: FIFO Tracking**
```
Shelf Layout (FIFO example):

┌─────────────────────────────────┐
│ FIFO Order (Oldest → Newest)   │
├─────────────────────────────────┤
│ Batch 2024-05-01 (expires 2026) │ ← Pick FIRST
│ Batch 2024-06-15 (expires 2026) │
│ Batch 2025-03-20 (expires 2027) │
│ Batch 2026-04-01 (expires 2028) │ ← Pick LAST
└─────────────────────────────────┘

Monitoring:
- Is oldest batch being picked? (✓ YES = FIFO working)
- How old is oldest batch? (if > 20 months for Mint → risk)
- Days to expiry? (if < 60 days → accelerate pickup)
```

**Alert Triggers**:
```
✓ Green (Safe):    Days to expiry > 180 days
🟡 Yellow (Warn):  Days to expiry 60-180 days
🔴 Red (Critical): Days to expiry < 60 days
⚫ Black (Expired): Days to expiry < 0 (should not happen!)
```

---

### **Component 4: Temperature Monitoring & Abuse Detection**

**What to Track**:

1. **Cold Store Temperature**
   - Target: -18°C ± 2°C
   - Current temp sensor reading
   - Temperature logs (24-hour history)
   - Alert if temp > -15°C for >30 min

2. **Transport Temperature**
   - Temp at loading: -18°C
   - Temp at delivery point
   - Cumulative hours > -15°C
   - Calculate "temperature abuse index" (TAI)

3. **Risk Scoring**
```
Temperature Abuse Index (TAI):
├─ 0h > -15°C    → Safe (no abuse)
├─ 0-2h > -15°C  → Minor (acceptable)
├─ 2-4h > -15°C  → Moderate (quality risk)
└─ >4h > -15°C   → Severe (spoilage risk)

Example:
- Summer transport Bangalore→Pune (3 hours, 35°C outside)
- Truck interior temp: +2°C at hour 1, -10°C at hour 3
- TAI score: 2.5 hours (moderate risk)
- Recommendation: Use only for sale within 2 weeks
```

---

### **Component 5: Spoilage Risk Prediction**

**Factors**:
```
Spoilage Risk = f(Expiry Days, Temperature Abuse, Age)

Vanilla (shelf life: 24 months):
├─ Expiry in 360+ days: Risk = 1 (safe)
├─ Expiry in 180-360d: Risk = 1 + temp abuse
├─ Expiry in 60-180d: Risk = 2 + temp abuse  
└─ Expiry < 60d: Risk = 3-5 (urgent action)

Example:
- Batch BATCH-2024-05-01 (vanilla)
  - Days to expiry: 40 days (critical)
  - Temperature abuse hours: 6 (severe)
  - Spoilage Risk Score: 5 (imminent)
  - Action: PICK FIRST! Or write off.
```

---

## Implementation Plan

### **Screen 1: Inventory Expiry Dashboard**

**4 Views**:

1. **📦 Expiry Timeline**
   - Gantt chart: Y-axis = SKUs, X-axis = Expiry dates
   - Color: Red (expire < 30d), Yellow (30-60d), Green (>60d)
   - Click batch to see details

2. **📋 Batch Inventory Table**
   - Show all batches in all locations
   - Columns: SKU, Batch, Quantity, Production Date, Expiry Date, Days to Expiry, FIFO Status, Temp Abuse, Risk Score
   - Filter: SKU, Location, Status (All/At-Risk/Expired)
   - Sort: By Expiry Date (oldest first)

3. **🌡️ Temperature Monitoring**
   - Cold store temp: Current + 24h history
   - Transport temp: Last 10 shipments
   - Alert log: All temperature excursions

4. **💰 Cold Chain Cost Analysis**
   - Monthly storage cost breakdown
   - Spoilage cost trending
   - Optimization opportunities

### **Screen 2: FIFO Rotation Planner**

**Features**:
- Current shelf layout by location
- Oldest batches highlighted
- Pick recommendations (oldest first)
- Alert if newer batch picked before older

### **Screen 3: Spoilage Risk Manager**

**Alerts & Actions**:
- Red alert: Batches expiring < 30 days
- Recommendations:
  - Pick for immediate sale
  - Allocate to high-volume channels
  - Discount pricing to accelerate sales
  - Write off if no option

---

## Dashboard Metrics (Real Numbers)

**Typical January Snapshot** (after implementing system):

```
EXPIRY STATUS
├─ Total Inventory: 1,250 L
├─ Safe (>60 days): 980 L (78%)
├─ At Risk (30-60d): 200 L (16%) ⚠️
├─ Critical (<30d): 70 L (6%) 🔴
└─ Expired: 0 L ✓

TEMPERATURE MONITORING
├─ Cold Store Temp: -18.2°C ✓
├─ Temp Excursions (24h): 0 ✓
└─ Transport Abuse Incidents (30d): 2 ⚠️

FIFO ROTATION
├─ FIFO Compliance: 94% ✓
├─ Oldest Batch Age: 16 months ✓
├─ Batches at Risk: 3 (Mint, >18 months) ⚠️
└─ Picked Out of Order: 2 batches (flagged) 🔴

COLD CHAIN COSTS (Jan)
├─ Storage Cost: ₹75K
├─ Transport Cost: ₹45K
├─ Spoilage Cost: ₹18K (1.4%)
├─ TOTAL: ₹138K
└─ Optimization Opportunity: -₹35K/month (25%)

TARGETS MET
├─ Zero expired stock: ✓
├─ Temperature stable: ✓
├─ FIFO compliance > 90%: ✓ (94%)
└─ Spoilage < 1.5%: ⚠️ (1.4%, slightly above)
```

---

## Integration with Production Planning

```
Manufacturing Execution Planning
            ↓
Determines: What to produce, When, How much
            ↓
            ↓
Cold Chain & Expiry Management
            ↓
Ensures: Right inventory levels to:
├─ Minimize cold storage costs
├─ Maximize FIFO compliance
├─ Minimize spoilage risk
└─ Optimize shelf space utilization
            ↓
            ↓
Output to Sales & Distribution:
├─ Pick instructions (oldest first)
├─ Discount triggers (approaching expiry)
├─ Location recommendations (move if needed)
└─ Write-off notifications
```

---

## Business Impact

### **Cost Savings**
| Item | Current | Target | Savings |
|------|---------|--------|---------|
| Storage Cost | ₹102K/month | ₹80K/month | -22% |
| Transport Cost | ₹60K/month | ₹54K/month | -10% |
| Spoilage Cost | ₹30K/month | ₹10K/month | -67% |
| **Total** | **₹192K/month** | **₹144K/month** | **-25%** |

### **Quality Improvements**
- FIFO compliance: 50% → 95%
- Spoilage rate: 2.5% → 0.8%
- Temperature abuse incidents: Monitored & logged
- Expired stock: Eliminated (zero tolerance)

### **Operational Efficiency**
- Faster picking (FIFO is systematic)
- Better shelf space management
- Reduced manual inventory checks
- Automated alerts for action items

---

## Next Steps

1. ✅ Design database schema for batch tracking
2. ✅ Create Expiry Dashboard screens
3. ✅ Integrate with SAP inventory data
4. ✅ Set up temperature sensors (IoT)
5. ✅ Build alert notification system
6. ✅ Train operations team on FIFO process

---

**Status**: Requirements documented. Ready for implementation.
