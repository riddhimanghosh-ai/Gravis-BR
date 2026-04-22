# 🏭 Rajesh's Production Planning Guide
## How to Use the Manufacturing Execution Planning System

---

## **The Complete Story: April Planning Week**

### **Monday 9:00 AM - You Open the Dashboard**

```
Dashboard Overview
├─ 📊 Total Demand (12M): 32,500 L
├─ 📊 Production Required: 18,750 L  
├─ ⚠️  Feasibility Issues: 2
└─ 📈 Avg Utilization: 68% (healthy)
```

**Your thought**: *"Good baseline. 68% utilization means we have room to maneuver. But what are these 2 issues?"*

---

## **Step-by-Step: What to Do**

### **Step 1: Navigate to Manufacturing Execution Planning**
```
GSI Platform 
└─ Production Planning
   └─ 🏭 Manufacturing Execution ⭐ (NEW)
```

### **Step 2: Review Default Dashboard**
**Don't filter yet. Just observe:**
- Total demand over 12 months: 32,500 L
- Production gap: 18,750 L (after current inventory)
- Any red flags? 2 feasibility issues noted

---

### **Step 3: Identify the Problem - Switch to Monthly Plan View**

**Click**: 📊 Monthly Plan by SKU

**What you see**:
```
Bar chart showing production by month and SKU
└─ April: ~1,500 L (Vanilla 915, Caramel 350, Mint 180, Choco 55)
└─ May:  ~1,800 L (ramp-up begins)
└─ June: ~2,100 L (PEAK - 40% above April!)
└─ July: ~2,050 L (sustained peak)
└─ Aug:  ~2,100 L (summer peak)
```

**Key insight**: *"June-August are crunch months. Vanilla demand jumps 50%+ in June."*

---

### **Step 4: Understand the Gap - Switch to Production Requirements Table**

**Click**: 📋 Production Requirements

**Filter for June problem areas**:
```
Month: June
SKUs: Vanilla
Channels: All
```

**Results you see**:
```
Month | SKU     | Channel   | Demand | Current | Safe  | Need   | Capacity | Status
Jun   | Vanilla | Parlor    | 1,680L | 120L    | 90L   | 1,650L | 1,800L   | ⚠ TIGHT
Jun   | Vanilla | Retail    | 1,176L | 85L     | 64L   | 1,167L | 1,800L   | ⚠ TIGHT
Jun   | Vanilla | HoReCa    | 336L   | 35L     | 26L   | 335L   | 1,800L   | ⚠ TIGHT
Jun   | Vanilla | E-Comm    | 168L   | 15L     | 11L   | 162L   | 1,800L   | ✓ OK
```

**Key insight**: *"Vanilla alone needs 3,192 L in June. That's 160 L/day. But I can only produce 30 L/day on L1!"*

---

### **Step 5: Check Current Inventory - Switch to Inventory vs Forecast**

**Click**: 📦 Inventory vs Forecast

**Filter for June products**:
```
SKUs: Vanilla
Channels: Parlor, Retail, HoReCa
```

**Results you see**:
```
SKU     | Channel | Current | Safe  | Reorder | Days of Supply | Status
Vanilla | Parlor  | 120L    | 90L   | 72L     | 11 days        | OK ✓
Vanilla | Retail  | 85L     | 64L   | 51L     | 10 days        | OK ✓
Vanilla | HoReCa  | 35L     | 26L   | 20L     | 8 days         | OK ✓
```

**Key insight**: *"Current inventory is fine for April-May normal demand. But June daily demand (160 L/day) will drain these stocks in 1-2 days!"*

---

### **Step 6: Check What You Can Produce - Line Capacity View**

**Click**: 🏭 Line Capacity

**What you see** (3 production lines):

```
┌─ L1: Vanilla Specialist ─────────────────┐
│ Capacity: 30 L/day (600 L/month)         │
│ Can Produce: All 4 SKUs                  │
│ Currently: Vanilla                       │
│ 💡 Best for: High-volume SKU (Vanilla)   │
└──────────────────────────────────────────┘

┌─ L2: Caramel Specialist ─────────────────┐
│ Capacity: 25 L/day (500 L/month)         │
│ Can Produce: Vanilla, Caramel, Mint      │
│ Currently: Caramel                       │
│ 💡 Best for: Flexible/demand-driven      │
└──────────────────────────────────────────┘

┌─ L3: Mint Specialist ────────────────────┐
│ Capacity: 20 L/day (400 L/month)         │
│ Can Produce: Vanilla, Mint, Chocolate    │
│ Currently: Mint                          │
│ Setup time: 2h (longest - minimize       │
│            changeovers!)                 │
│ 💡 Best for: Products needing niche      │
└──────────────────────────────────────────┘

TOTAL CAPACITY: 75 L/day = 1,500 L/month
```

**Your Realization**:
```
June Vanilla Demand: 3,192 L
÷ 20 working days = 160 L/day NEEDED

Current Setup:
└─ Only L1 on Vanilla = 30 L/day
⚠️  SHORTFALL: 160 - 30 = 130 L/day DEFICIT!

Solution: 
├─ L1 stays Vanilla: 30 L/day
├─ L2 switch to Vanilla (May 1): +25 L/day  
├─ L3 switch to Vanilla (June 1): +20 L/day
└─ Total: 75 L/day (still 85 L/day short!)
    = Need buffer stock + backup supplier
```

---

## **STEP 7: Make the Strategic Decision**

**The Plan You Create**:

### **April (Normal Season)**
```
L1 → Vanilla:  30 L/day × 20 days = 600 L
L2 → Caramel:  25 L/day × 20 days = 500 L
L3 → Mint:     20 L/day × 20 days = 400 L
─────────────────────────────────────────
Total Production: 1,500 L

✓ No changeovers needed
✓ Standard operations
✓ Prepare for May ramp-up
```

### **May (Ramp-Up Season)**
```
L1 → Vanilla:  30 L/day × 20 days = 600 L
L2 → Vanilla*: 25 L/day × 20 days = 500 L (*switch from Caramel May 1)
L3 → Mint:     20 L/day × 20 days = 400 L
─────────────────────────────────────────
Total Production: 1,500 L (1,100 L Vanilla!)

Key Actions:
✓ Changeover L2: Caramel → Vanilla (May 1 morning)
✓ Setup time: 1.5h, loss: 0.3L
✓ Build Vanilla buffer: ~1,100 L produced

Why? June will need 3,192 L but we can only make 1,500 L 
from production + buffer = solution
```

### **June (Peak Season)**
```
L1 → Vanilla:  30 L/day × 20 days = 600 L
L2 → Vanilla:  25 L/day × 20 days = 500 L
L3 → Vanilla*: 20 L/day × 20 days = 400 L (*switch from Mint June 1)
─────────────────────────────────────────
Total Production: 1,500 L (100% Vanilla!)

Available to Deliver:
├─ New production (June): 1,500 L
├─ Buffer from May: 1,100 L
├─ Current inventory: 120 L  
└─ Total: 2,720 L

Gap: 3,192 - 2,720 = 472 L ← Order from backup supplier!

Key Actions:
✓ Changeover L3: Mint → Vanilla (June 1)
✓ Order 472 L from backup supplier (delivery by June 10)
✓ Allocate fairly across Parlor, Retail, HoReCa
```

---

## **STEP 8: Communication & Execution**

### **Message to Line Manager Vikram**:
```
Hi Vikram,

April-May-June production plan complete.

KEY CHANGES:
• May 1: Changeover L2 from Caramel → Vanilla (1.5h setup)
• June 1: Changeover L3 from Mint → Vanilla (2h setup)
• June: 100% line utilization on Vanilla

WHAT TO PREPARE:
✓ Schedule L2 maintenance BEFORE May 1
✓ Confirm raw material supply for 1,100 L Vanilla (May production)
✓ Plan L3 changeover from Mint → Vanilla (minimize setup time)
✓ Arrange external supplier (472 L Vanilla for June 10 delivery)

SCHEDULE:
April: Standard (no changes)
May: Start ramp-up (L2 changeover)
June: Full capacity (all lines Vanilla) + external supply

Let me know if any constraints. Chart attached.
Rajesh
```

### **Message to Regional Managers**:
```
Hi Team,

June Vanilla production is constrained. Here's the plan:

JUNE VANILLA AVAILABILITY: 2,720 L
(1,500 L production + 1,100 L May buffer + 120 L current)

EXPECTED DEMAND: 3,192 L
(Parlor: 1,680L | Retail: 1,176L | HoReCa: 336L | E-Comm: ?)

ALLOCATION:
• Parlor: 1,500 L (confirmed)
• Retail: 900 L (reduced from 1,176 L, -23%)
• HoReCa: 300 L (reduced from 336 L, -11%)
• E-Comm: 20 L (if demand < 200L)
• Gap: 472 L (backup supplier)

CONFIRM BY MAY 15:
- Exact E-commerce demand for June
- Can Retail accommodate 23% reduction?
- HoReCa OK with 11% reduction?

This ensures fair allocation while protecting core channels.
Rajesh
```

---

## **Key Success Factors**

### **What Makes This Work:**

1. ✅ **Data Integration**: All 4 views work together
   - Demand tells you what's needed
   - Inventory shows what you have  
   - Line capacity shows what you can make
   - Production table = demand - inventory

2. ✅ **Early Warning**: Identify June crunch in April
   - Not in June when it's too late
   - Time to build May buffer
   - Time to line up backup supplier

3. ✅ **Strategic Thinking**: Build buffer in May
   - April: Standard (collect baseline data)
   - May: Ramp-up (prepare for peak)
   - June: Execute (deliver at capacity + buffer)

4. ✅ **Line Configuration**: Optimize changeover timing
   - Minimize changeovers in April (stability)
   - Single changeover in May (manageable)
   - Final changeover June 1 (before peak)

5. ✅ **Stakeholder Alignment**: Everyone knows the plan
   - Vikram (ops): When to changeover, what capacity to prepare
   - Regional Managers: How much they'll get in June
   - Supply Chain: When to order backup (June 10 delivery)

---

## **What Happens If You Don't Plan**

### **Scenario: No Manufacturing Execution Plan**

```
June 1 - Demand hits 160 L/day for Vanilla
Current capacity: 30 L/day (L1 only)
Gap: 130 L/day ❌

Result:
Day 1: Stockout for Retail channel
Day 2: Emergency order from backup (premium cost +20%)
Day 3: HoReCa allocations reduced by 50%
Day 4: Lost sales, customer complaints
Week 1: Line manager working weekend (unplanned changeover)
Week 2: Quality issues from rushed production

COST:
• Lost revenue: ₹50 L (lost sales for 5 days at ₹10k/L)
• Premium supplier cost: +20% on 130L = ₹2.6L extra
• Customer relationship damage: Immeasurable
• Team stress: Weekend work, firefighting mode

Total cost of no plan: ₹52.6L
```

### **Scenario: With Manufacturing Execution Plan**

```
April: Data, observation, planning (0 cost)
May: Strategic production of Vanilla buffer (+0 cost, part of regular ops)
June: Execute pre-planned allocation (+0 emergency cost)
        ├─ Backup supplier ordered in April (normal contract)
        ├─ Allocations decided in May (no surprises)
        └─ Lines configured May 1 & June 1 (no last-minute chaos)

COST:
• Backup supplier: ₹4.7L (472 L × ₹10k base rate = normal cost)
• Reduced Retail: Minor (planned, acceptable)
• Zero emergency costs, zero customer surprises

Total cost with plan: ₹4.7L (planned, budgeted)
Savings: ₹47.9L (vs. no plan scenario) ✓
```

---

## **Monthly Rhythm**

### **How Rajesh Uses the System Every Month**

```
1st Week of Month:
├─ Open MEP Dashboard
├─ Check 12-month outlook
└─ Plan next 2 months in detail

2nd Week:
├─ Share production plan with team
├─ Get changeover/capacity confirmations
└─ Place raw material orders for next month

3rd Week:
├─ Monitor actual vs. plan (inventory tracking)
├─ Adjust if demand forecast changes
└─ Communicate adjustments to stakeholders

4th Week:
├─ Plan next month's production
├─ Review line utilization (OEE)
└─ Close out current month analysis

Ongoing:
└─ If demand forecast changes > 10%, replan using MEP
```

---

## **Success Metrics You Can Track**

**Now that you have the MEP system:**

```
Before: "I hope demand doesn't spike"
After:  "I see June demand 3 months early and plan accordingly" ✓

Before: "We'll figure out the schedule in May"
After:  "Schedule is locked April 15 with confidence" ✓

Before: "Constant firefighting in peak season"
After:  "Peak season is calm - we prepared" ✓

Before: "Don't know if we can meet all channels"
After:  "Know exactly what we can deliver and allocate fairly" ✓

Before: "No visibility into line capacity limits"
After:  "Know exactly when to add external supply" ✓
```

---

## **Your Next Steps**

1. ✅ **Familiarize yourself** with 4 views
   - Spend 1 hour exploring the dashboard
   - Try filtering different combinations

2. ✅ **Plan April with confidence**
   - Use MEP to create April schedule
   - Share with Vikram and team

3. ✅ **Plan May strategically**
   - Identify changeover needs
   - Build buffer stock

4. ✅ **Plan June proactively**
   - Confirm backup supplier capacity
   - Allocate fairly across channels

5. ✅ **Repeat monthly**
   - Use MEP as your primary planning tool
   - Reference the 4 views consistently

---

## **Quick Reference: Which View for Which Question?**

| Question | View | Filter |
|----------|------|--------|
| "What must we produce?" | 📋 Production Requirements | Month + SKU |
| "What's our line capacity?" | 🏭 Line Capacity | (no filter needed) |
| "Do we have enough inventory?" | 📦 Inventory vs Forecast | SKU + Channel |
| "When is Vanilla peak?" | 📊 Monthly Plan | (all months) |
| "Can we meet June demand?" | 📋 Production Req + 🏭 Capacity | Month=Jun + SKU=Vanilla |
| "What should L2 produce in May?" | 📋 Production Req | Month=May + line capability |
| "Are we at risk?" | Look for ⚠ WARNING status | All views |

---

**You're now a strategic production planner, not a firefighter. The MEP system has your back.** 🚀

