# Production Planning Workflow: Manufacturing Execution Planning System

## Overview
This document shows step-by-step how Production Planner **Rajesh** uses the Manufacturing Execution Planning (MEP) system to create and optimize monthly production schedules.

---

## **Scenario: April Planning Session**

**Date**: Last Friday of March 2026  
**Duration**: 2 hours  
**Goal**: Plan production for April-May (8 weeks ahead) with confidence  
**Participants**: Rajesh (Planner), Line Manager Vikram, Quality Lead Neha

---

## **STEP 1: Open Manufacturing Execution Planning Dashboard**

**Time: 9:00 AM**

Rajesh logs into the GSI Platform and clicks on **Production Planning → Manufacturing Execution Planning**

### **Dashboard loads with 4 key sections:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🏭 Manufacturing Execution Planning                              │
│  Integrated demand forecast, inventory analysis, production scheduling
└─────────────────────────────────────────────────────────────────┘

📊 KEY METRICS (Filtered for All Cities, All Channels, All SKUs)
├─ Total Demand (12M):        32,500 L
├─ Production Required:        18,750 L  (after current inventory)
├─ Feasibility Issues:         2        (out of 64 SKU-Channel combos)
└─ Avg Line Utilization:       68%      (healthy, room for surge)

🎯 VIEW OPTIONS
├─ 📊 Monthly Plan by SKU      ← START HERE
├─ 📋 Production Requirements   
├─ 📦 Inventory vs Forecast    
└─ 🏭 Line Capacity
```

**Rajesh's observation**: 
> "Good baseline. 68% utilization means we have 32% buffer capacity. But those 2 feasibility issues need investigation. Let me see what they are."

---

## **STEP 2: Filter for Specific Insights**

**Time: 9:05 AM**

Rajesh opens the **FilterPanel** to zoom in on specific business questions:

### **Question 1: "What should we produce for Vanilla across all channels?"**

**Filter Actions**:
- Cities: All 4 (Bangalore, Hyderabad, Chennai, Pune)
- Channels: All 4 (Parlor, Retail, HoReCa, E-Commerce)
- SKUs: **Select only Vanilla** ✓

**Updated Metrics** (Vanilla only):
```
Total Demand (12M):       17,875 L    (55% of total - confirms dominance)
Production Required:       9,450 L    
Feasibility Issues:        0          (Vanilla is safe)
Avg Line Utilization:      72%        (3 lines can produce Vanilla)
```

> "Perfect. Vanilla is healthy across all channels and cities. No constraints."

---

## **STEP 3: Investigate the 2 Feasibility Issues**

**Time: 9:10 AM**

Rajesh switches to **📋 Production Requirements** view (Table)

**Filters remain**: All cities, all channels, all SKUs

**Table shows all month-SKU-Channel combinations:**

```
Month | SKU       | Channel    | Monthly  | Current | Safety | Production | Capacity  | Status
      |           |            | Demand   | Inv     | Stock  | Needed     | Available |
──────────────────────────────────────────────────────────────────────────────────────────────
Apr   | Vanilla   | Parlor     | 1,050 L  | 120 L   | 90 L   | 1,020 L    | 1,800 L   | ✓ OK
Apr   | Vanilla   | Retail     | 735 L    | 85 L    | 64 L   | 713 L      | 1,800 L   | ✓ OK
Apr   | Vanilla   | HoReCa     | 210 L    | 35 L    | 26 L   | 201 L      | 1,800 L   | ✓ OK
Apr   | Vanilla   | E-Comm     | 105 L    | 15 L    | 11 L   | 101 L      | 1,800 L   | ✓ OK
Apr   | Caramel   | Parlor     | 420 L    | 95 L    | 71 L   | 396 L      | 1,200 L   | ✓ OK
Apr   | Caramel   | Retail     | 294 L    | 42 L    | 31 L   | 283 L      | 1,200 L   | ✓ OK
Apr   | Mint      | Retail     | 240 L    | 55 L    | 41 L   | 226 L      | 1,200 L   | ✓ OK
Apr   | Chocolate | HoReCa     | 21 L     | 10 L    | 7 L    | 18 L       | 1,200 L   | ✓ OK
...
May   | Vanilla   | Parlor     | 1,400 L  | 80 L    | 60 L   | 1,380 L    | 1,800 L   | ✓ OK
May   | Vanilla   | Retail     | 980 L    | 65 L    | 49 L   | 964 L      | 1,800 L   | ✓ OK
May   | Caramel   | Parlor     | 560 L    | 70 L    | 52 L   | 542 L      | 1,200 L   | ✓ OK
Jun   | Vanilla   | Parlor     | 1,680 L  | 45 L    | 33 L   | 1,668 L    | 1,800 L   | ✓ OK  ← TIGHT!
Jun   | Vanilla   | Retail     | 1,176 L  | 35 L    | 26 L   | 1,167 L    | 1,800 L   | ⚠ WARNING ← ISSUE #1
Jun   | Vanilla   | HoReCa     | 336 L    | 18 L    | 13 L   | 335 L      | 1,800 L   | ⚠ WARNING ← ISSUE #2
Jun   | Caramel   | Retail     | 412 L    | 28 L    | 21 L   | 403 L      | 1,200 L   | ✓ OK
...
```

**Rajesh identifies the 2 issues:**
1. **Jun | Vanilla | Retail**: Needs 1,167 L but Vanilla capacity is maxed → Requires external sourcing or earlier production
2. **Jun | Vanilla | HoReCa**: Peak summer tourism season → demand spike → capacity pinch

> "June is the crunch. Both Vanilla channels will compete for line capacity. I need to shift April/May production forward to build buffer stock."

---

## **STEP 4: Check Current Inventory Levels**

**Time: 9:20 AM**

Rajesh switches to **📦 Inventory vs Forecast** view

**Filters for June risk items**:
- Cities: All
- Channels: **Retail, HoReCa**
- SKUs: **Vanilla**

**Current Inventory Results**:

```
SKU     | Channel | Current | Safety | Reorder | Days of Supply | Status
        |         | Stock   | Stock  | Point   |                |
─────────────────────────────────────────────────────────────────────────
Vanilla | Retail  | 85 L    | 64 L   | 51 L    | 11 days        | OK ✓
Vanilla | HoReCa  | 35 L    | 26 L   | 20 L    | 10 days        | OK ✓
```

> "Current inventory is OK for April-May normal demand, but June will drain it. I need to plan ahead."

---

## **STEP 5: Review Line Capacity & Configuration**

**Time: 9:30 AM**

Rajesh switches to **🏭 Line Capacity** view

**This shows the production line specifications:**

```
┌─────────────────────────────────────────────────────────────────┐
│ L1: Vanilla Specialist                                           │
├─────────────────────────────────────────────────────────────────┤
│ Daily Capacity: 30 L/day (600 L/month)                          │
│ Setup Time: 1.5h | Run Time: 6h per batch                       │
│ Currently Running: Vanilla                                       │
│ Can Produce: Vanilla, Caramel, Mint, Chocolate                  │
│ Status: ✓ Running                                                │
│                                                                  │
│ 💡 Optimization: Dedicated to Vanilla due to high demand         │
│    Minimize changeovers (already on Vanilla)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ L2: Flexible Line                                               │
├─────────────────────────────────────────────────────────────────┤
│ Daily Capacity: 25 L/day (500 L/month)                          │
│ Setup Time: 1.5h | Run Time: 5h per batch                       │
│ Currently Running: Caramel                                       │
│ Can Produce: Vanilla, Caramel, Mint                              │
│ Status: ✓ Running                                                │
│                                                                  │
│ 💡 Optimization: Best for Caramel (current product) + Vanilla    │
│    Changeover to Vanilla in May for summer ramp-up               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ L3: Niche Products                                              │
├─────────────────────────────────────────────────────────────────┤
│ Daily Capacity: 20 L/day (400 L/month)                          │
│ Setup Time: 2h | Run Time: 4h per batch (longest changeover)    │
│ Currently Running: Mint                                          │
│ Can Produce: Vanilla, Mint, Chocolate                            │
│ Status: ✓ Running                                                │
│                                                                  │
│ 💡 Optimization: Dedicate to Mint (slower changeover)            │
│    Minimize product switches due to 2h setup time                │
└─────────────────────────────────────────────────────────────────┘

TOTAL CAPACITY ACROSS 3 LINES: 75 L/day = 1,500 L/month
```

**Key Insight**:
```
Current Configuration:
└─ L1 (30L): Vanilla
└─ L2 (25L): Caramel  
└─ L3 (20L): Mint
   Total: 75 L/day

June Vanilla Demand: 1,680 + 1,176 + 336 = 3,192 L/month
÷ 20 working days = 160 L/day NEEDED

Current Vanilla Capacity: 30 L/day (L1 only)
⚠️ SHORTFALL: 160 - 30 = 130 L/day DEFICIT
```

> "I see the problem now. In June, Vanilla alone needs 160 L/day but I can only produce 30 L/day on L1. I need to reconfigure."

---

## **STEP 6: Create the April-May Production Plan**

**Time: 9:50 AM**

**Rajesh's Strategy Decision:**

### **The Plan:**

**📅 APRIL (Normal Season)**
```
L1 → Vanilla: 30 L/day (900 L total)
L2 → Caramel: 25 L/day (750 L total)  
L3 → Mint:    20 L/day (600 L total)
Total: 75 L/day

Focus: Build buffer stock for summer
Action: Produce 10% extra Vanilla to pre-position for May/June
```

**📅 MAY (Ramp-up Season)**
```
L1 → Vanilla: 30 L/day (900 L total)
L2 → Vanilla: 25 L/day (750 L total) ← SHIFT from Caramel
L3 → Mint:    20 L/day (600 L total)
Total: 75 L/day (75% going to Vanilla!)

Changeover L2 from Caramel → Vanilla (May 1)
Action: Build Vanilla buffer for June peak
Caramel: Reduce from 750 L to 400 L (from L3 time-sharing)
```

**📅 JUNE (Peak Season)**
```
L1 → Vanilla: 30 L/day (600 L)
L2 → Vanilla: 25 L/day (500 L)
L3 → Vanilla: 20 L/day (400 L)  ← SHIFT from Mint
Total: 75 L/day (100% to Vanilla!)

Expected June Vanilla Demand: 3,192 L
Production:                   1,500 L
Buffer from May:              1,200 L (built in advance)
Total Available:              2,700 L
Gap:                          492 L ← Order from backup supplier
```

---

## **STEP 7: Validate the Plan Using MEP System**

**Time: 10:10 AM**

Rajesh updates the filters to show the adjusted production plan:

### **Question: "What if we dedicate L2 to Vanilla in May-June?"**

**Filter Actions:**
- Month: May
- SKU: Vanilla
- Channels: All

**Updated Production Table shows:**
```
May | Vanilla | Parlor    | 1,400 L demand | 1,020 L production (Vanilla+extra) | ✓ OK
May | Vanilla | Retail    | 980 L demand   | 1,020 L production                 | ✓ OK  
May | Vanilla | HoReCa    | 280 L demand   | 1,020 L production                 | ✓ OK
May | Vanilla | E-Commerce| 140 L demand   | 1,020 L production                 | ✓ OK

Total May Vanilla: 2,800 L needed, 1,620 L produced (L1+L2 combined)
Buffer created: 1,180 L
```

> "Perfect! By May, I'll have built a 1,180 L Vanilla buffer. That should carry us through early June."

---

## **STEP 8: Document the Final Schedule**

**Time: 10:30 AM**

Rajesh creates a summary document by clicking **Export** (future feature):

```
MONTHLY PRODUCTION SCHEDULE - APRIL/MAY/JUNE 2026
Production Planner: Rajesh Kumar
Validated: April 23, 2026 | 10:30 AM

═══════════════════════════════════════════════════════════════

APRIL 2026
─────────────────────────────────────────────────────────────
L1: Vanilla   | 30 L/day × 20 days = 600 L   | ✓ No changeover
L2: Caramel   | 25 L/day × 20 days = 500 L   | ✓ No changeover  
L3: Mint      | 20 L/day × 20 days = 400 L   | ✓ No changeover
─────────────────────────────────────────────────────────────
Total: 1,500 L | Utilization: 100% | Buffer build: +100 L Vanilla

Action Items:
□ Confirm Vanilla raw material supply for May ramp-up
□ Schedule preventive maintenance on L1 (early May)
□ Notify Caramel channel that May volume reduced by 15%

═══════════════════════════════════════════════════════════════

MAY 2026
─────────────────────────────────────────────────────────────
L1: Vanilla   | 30 L/day × 20 days = 600 L   | ✓ No changeover
L2: Vanilla   | 25 L/day × 20 days = 500 L   | ⚠ Changeover 5/1 (Caramel→Vanilla)
L3: Mint      | 20 L/day × 20 days = 400 L   | ✓ No changeover
─────────────────────────────────────────────────────────────
Total: 1,500 L | Utilization: 100% | Buffer build: +1,180 L Vanilla

Changeover: Caramel → Vanilla on L2
Setup Time: 1.5h
Expected Loss: 0.3 L production (1.5h ÷ 8h shift × 25 L/day)
Buffer Impact: Absorbed in production overflow

Action Items:
□ Changeover planning: Caramel → Vanilla (L2) on May 1
□ Raw material: 1,100 L Vanilla needed for May production
□ Caramel channels: Proactive communication (reduce to 300 L/month)
□ Confirm June backup supplier contract

═══════════════════════════════════════════════════════════════

JUNE 2026 (Peak Season - Execute with Precision)
─────────────────────────────────────────────────────────────
L1: Vanilla   | 30 L/day × 20 days = 600 L   | ✓ No changeover
L2: Vanilla   | 25 L/day × 20 days = 500 L   | ✓ No changeover
L3: Vanilla   | 20 L/day × 20 days = 400 L   | ⚠ Changeover 6/1 (Mint→Vanilla)
─────────────────────────────────────────────────────────────
Total: 1,500 L | Utilization: 100% | Peak buffer deployment

Changeover: Mint → Vanilla on L3 (June 1)
Setup Time: 2h
Expected Loss: 0.5 L production (2h ÷ 8h shift × 20 L/day)

Demand Forecast:
├─ Vanilla (all channels): 3,192 L
├─ Available from June production: 1,500 L
├─ Available from May buffer: 1,180 L
├─ Total Available: 2,680 L
└─ Gap to cover: 512 L (17% gap)

Action Items:
□ Backup supplier: Order 512 L Vanilla (delivery by June 15)
□ Line efficiency: Target 98% OEE (vs 95%) to gain 20 L
□ Mint channels: Suspend production, resume July 1
□ Customer communication: Allocate 3,192 L across channels fairly
```

---

## **STEP 9: Communicate the Plan**

**Time: 11:00 AM**

Rajesh shares the plan with stakeholders:

### **Email to Line Manager Vikram:**
```
Subject: April/May/June Production Schedule - Approval Needed

Hi Vikram,

I've finalized the April-May production plan using the new Manufacturing 
Execution Planning system. Key changes:

1. APRIL: Standard run (L1=Vanilla, L2=Caramel, L3=Mint)
2. MAY: Start ramp-up (shift L2 from Caramel to Vanilla)
   - Changeover scheduled May 1 morning (1.5h setup time)
   - Expect 0.3 L loss during changeover
   
3. JUNE: Peak season (all 3 lines on Vanilla)
   - Changeover L3 from Mint to Vanilla on June 1
   - Total 1,500 L Vanilla/month but need 3,192 L
   - Backup supplier will cover 512 L gap

Request:
- Can you prepare L2 changeover plan for May 1?
- Confirm L3 can go 100% Vanilla by June 1?
- Any maintenance scheduled that conflicts?

Also, preventive maintenance on L1 should be early May (not late May 
when we're ramping up).

Attached: Full production schedule + line utilization chart

Rajesh
```

### **Email to Regional Managers (Priya, Arun, etc.):**
```
Subject: June Production Alert - Vanilla Supply Constrained

Hi Team,

Our 12-month production plan shows June will be tight for Vanilla:

📊 DEMAND vs SUPPLY
├─ Vanilla Demand (June): 3,192 L (all channels combined)
│  ├─ Parlor: 1,680 L (+35% vs April)
│  ├─ Retail: 1,176 L (+50% vs April) 
│  ├─ HoReCa: 336 L (seasonal spike)
│  └─ E-commerce: UNKNOWN (demand growing)
│
└─ Vanilla Available (June): 2,680 L
   ├─ Production: 1,500 L (all 3 lines)
   └─ Buffer: 1,180 L (built in May)

⚠️ ALLOCATION PLAN
We have a 512 L gap. To ensure fairness:
├─ Parlor: Guaranteed 1,500 L (priority: branded outlet experience)
├─ Retail: Allocated 800 L (reduced 32% vs demand)
├─ HoReCa: Allocated 250 L (premium accounts only)
└─ E-Commerce: TBD (depends on May forecast update)

REQUEST
Please confirm your June demand forecast by May 1 so I can optimize 
allocation. If E-commerce demand is >200 L, we may need to reduce 
Retail allocation further.

Plan: Continue May for June planning meeting.

Rajesh
```

---

## **STEP 10: Monthly Review (May 15)**

**Time: 5:00 PM (Mid-May checkpoint)**

Rajesh opens the MEP system again to track actual vs. planned:

### **May 15 Status Check:**

**Updated Filters:**
- Month: May
- All cities, channels, SKUs

**Results:**
```
May Production (Actual vs Plan)

L1 Vanilla:
  Planned:  600 L (30 L/day × 20 days)
  Actual:  300 L (first 10 days)
  OEE: 100% ✓
  On Track: YES ✓

L2 Vanilla:
  Planned:  500 L (after changeover May 1)
  Actual:  245 L (first 10 days, including changeover)
  OEE: 98% ✓ (1.5h changeover loss = 0.3L)
  On Track: YES ✓

L3 Mint:
  Planned:  400 L
  Actual:  210 L (first 10 days)
  OEE: 105% 🎉 (better than expected!)
  On Track: YES ✓

May Buffer Status: 
  Target: +1,180 L Vanilla buffer
  Actual build (to date): +545 L (on track)
  Projected Month-end: +1,190 L ✓ GOOD

Inventory Position:
  Current Vanilla: 120 L + 545 L buffer = 665 L
  Safe for June ramp? YES ✓
  
Next Action: 
  Continue current plan. Adjust June if E-commerce demand changes.
```

> "Excellent! Everything is tracking perfectly. L3 even exceeded expectations, which gives us additional buffer. May changeover was seamless."

---

## **Key Insights from the MEP System**

### **What the Production Planner Gains:**

1. **Visibility Across All Dimensions**
   - Demand by SKU, Channel, City, Month
   - Current inventory vs. forecast needs
   - Line capacity constraints
   - Production requirements calculated automatically

2. **Scenario Planning**
   - "What if we run L2 Vanilla in May?" → See impact immediately
   - "What if June demand spikes 20%?" → Calculate gap
   - "Can we meet all channels?" → Yes/No with specific shortfall

3. **Data-Driven Decisions**
   - No more guesswork: demand forecast + inventory = production needed
   - Line capacity limits understood upfront
   - Changeover costs accounted for (setup time, product loss)

4. **Proactive Communication**
   - Clear handoffs to line managers (what to produce, when to changeover)
   - Transparency to regional managers (what we can supply in each month)
   - Confidence in commitments (backed by production plan)

5. **Risk Management**
   - Feasibility warnings flag problems early
   - Buffer stock strategy absorbs forecast variations
   - Backup supplier trigger points identified

---

## **How MEP System Solves the 3 Requirements**

### **1. ✅ "Production planner should know how much of what SKU to produce each month"**

**MEP provides:**
- **Monthly Production Requirements** table: Shows for each month-SKU-Channel combo exactly how much production is needed
- Factors in: Demand forecast + Current inventory - Safety stock buffer
- Example: "Apr Vanilla Parlor: Produce 1,020 L"

---

### **2. ✅ "Production planner should see it for each channel"**

**MEP provides:**
- **Filtered Production Plan** by channel: Can view Vanilla demand/production for Parlor only, or Retail only, or all
- Shows demand differs by channel (Parlor 50% of total, Retail 35%, etc.)
- Allows channel-specific allocation decisions
- Example: "May Vanilla Retail needs 980 L, Parlor needs 1,400 L"

---

### **3. ✅ "Manufacturing Execution Planning: Demand + Inventory + Scheduling + Line Capacity + SAP Integration"**

**MEP provides all 5 components in one view:**

| Component | What MEP Shows | How Used |
|-----------|----------------|----------|
| **Demand Forecast** | 12-month demand by SKU, channel, month | Determines production requirements |
| **Inventory Analysis** | Current stock, safety stock, days of supply | Calculates production needed gap |
| **Production Schedule** | What to produce each month to meet demand | Input to line scheduling |
| **Line Capacity** | Each line's daily capacity, changeover times, capable SKUs | Validates if demand is feasible |
| **SAP Integration** (ready) | Current inventory, production history, SKU specs | Feeds actual data into forecast |

---

## **Integration Points (Future Enhancement)**

The system is structured to integrate with SAP:

```
SAP ERP
  ├─ Material Master (SKU specs)
  ├─ Inventory (Current stock by location/SKU)
  ├─ Production Orders (Actual line runs)
  ├─ Sales Orders (Actual customer demand)
  └─ Equipment Master (Line capacity specs)
            ↓
Manufacturing Execution Planning System
  ├─ Real-time inventory sync
  ├─ Actual vs. forecast variance
  ├─ Line utilization tracking
  └─ Production order generation (auto-create POs based on plan)
            ↓
Dashboard provides
  ├─ Recommended production quantities
  ├─ Feasibility validation
  ├─ Changeover scheduling
  └─ Buffer stock management
            ↓
Output to Plant Systems
  ├─ Production schedule (MES)
  ├─ Material requisitions
  ├─ Quality specs by batch
  └─ Forecast variance alerts
```

---

## **Summary: Why MEP Changes Production Planning**

### **Before (Manual Process)**
- ❌ Excel spreadsheets with demand, inventory, line capacity in separate sheets
- ❌ 4+ hours to create monthly plan
- ❌ Manual calculation errors (forgot to subtract inventory, didn't account for changeovers)
- ❌ Difficult to see "what if" scenarios
- ❌ Late decisions due to data gathering time

### **After (MEP System)**
- ✅ All data in one integrated system
- ✅ 1-2 hours to create and validate plan
- ✅ Automatic calculations (demand - inventory + safety stock = production needed)
- ✅ Instant "what if" filtering (select SKU, see impact)
- ✅ Early decisions with confidence (data-driven, not guesswork)

---

**Result**: Production Planner Rajesh went from a firefighter (reacting to issues) to a strategist (planning ahead with confidence). April/May/June is locked in, buffer stock is built, and the team knows exactly what to produce and when.
