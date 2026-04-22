# GSI Platform - User Stories & Real-World Scenarios

## 👤 User Personas

### 1. **Rajesh** - Production Planner (Baskin Robbins Manufacturing)
- **Role**: Weekly production planning for ice cream manufacturing
- **Goals**: Ensure smooth production, minimize inventory costs, meet distributor demand
- **Pain Points**: Manual forecasting, delayed data, channel complexity

### 2. **Priya** - Regional Manager (Baskin Robbins Operations)
- **Role**: Monitor performance across cities, optimize distributor allocation
- **Goals**: Maximize sales, reduce costs, identify growth opportunities
- **Pain Points**: Lack of regional visibility, slow reporting, communication delays

### 3. **Arun** - Distributor Partner (Bakala Distributors)
- **Role**: Plan inventory orders and manage stock across outlets
- **Goals**: Optimize order quantities, reduce carrying costs, ensure availability
- **Pain Points**: Unpredictable demand, communication gaps, poor planning visibility

---

## 📖 Detailed User Stories

## Story 1: Weekly Production Planning with Local Inventory Optimization

### **Scenario**: Monday Morning, 8:30 AM - Rajesh's Weekly Planning Session

**Setting**: Rajesh logs into GSI Dashboard at the manufacturing plant in Bangalore. He has 2 hours before the weekly production planning meeting with the operations team.

### **The Journey**:

#### Step 1: Check Overall Status (2 min)
Rajesh opens the **Dashboard** to get a quick overview:
- Current week's production status
- Inventory variance (-2.3% - optimal)
- No stock-outs in the last 7 days
- Production utilization at 79% (balanced)

**Action**: "Everything looks good. Now let me drill into the details for this week's production plan."

---

#### Step 2: Filter by Location & Analyze Local Demand (8 min)

Rajesh opens the **12-Month Demand Forecast** screen and applies filters:

**Filter Selection:**
- 📍 Cities: Selects **Bangalore, Hyderabad** (his primary manufacturing locations)
- 📦 Channels: All channels (Parlor, Retail, HoReCa, E-commerce)
- 🍦 SKUs: All (Vanilla, Caramel, Mint, Chocolate)

**What He Sees**:
A tabular view showing for Bangalore & Hyderabad:
```
| Month | City | Channel | SKU | Avg Monthly | Peak Month | Growth | Forecast |
|-------|------|---------|-----|-------------|------------|--------|----------|
| Apr   | BLR  | Parlor  | Vanilla | 1,735 L | 2,338 L | +64% | 1,850 L |
| Apr   | BLR  | Retail  | Vanilla | 1,212 L | 1,636 L | +64% | 1,295 L |
| Apr   | HYD  | Parlor  | Vanilla | 865 L | 1,169 L | +64% | 925 L |
```

**Insight**: "Bangalore Parlor channel will need 1,850L of Vanilla this month, up from 1,735L. That means I need to allocate extra production capacity on Line 1."

---

#### Step 3: Check Inventory & Reorder Points (5 min)

Rajesh filters **Inventory Management** view:
- 📍 Cities: **Bangalore** only
- 📦 Channels: **Parlor**
- 🍦 SKUs: **Vanilla, Caramel**

**Tabular View Shows**:
```
| SKU | Channel | Current Stock | Reorder Point | Safety Stock | Status | Action |
|-----|---------|---------------|---------------|--------------|--------|--------|
| Vanilla | Parlor | 8,500 L | 7,200 L | 1,500 L | OK | None |
| Caramel | Parlor | 3,200 L | 2,800 L | 600 L | LOW | Reorder |
```

**Decision**: "Caramel stock is low. Need to reorder 2,000L immediately. Let me check what's feasible to produce this week."

---

#### Step 4: Review Production Capacity (7 min)

Rajesh opens **Production Scheduling Table** and filters:
- 📍 Cities: **Bangalore**
- 📦 Channels: All
- 🍦 SKUs: **Vanilla, Caramel**

**Tabular Production Schedule**:
```
| Date | Line | SKU | Qty | Time | Status | Capacity Used |
|------|------|-----|-----|------|--------|--------------|
| Mon  | Line 1 | Vanilla | 2,400 L | 08:00-16:00 | Scheduled | 85% |
| Mon  | Line 2 | Caramel | 1,200 L | 08:00-14:00 | Scheduled | 45% |
| Tue  | Line 1 | Changeover | - | 16:00-22:00 | Scheduled | - |
| Tue  | Line 2 | Vanilla | 1,800 L | 08:00-16:00 | Planned | 65% |
| Tue  | Line 3 | Mint | 1,400 L | 08:00-16:00 | Planned | 75% |
```

**Opportunity**: "Line 2 has 55% spare capacity on Monday. I can schedule an extra Caramel run: 600L in afternoon shift (16:00-20:00). That covers the reorder."

---

#### Step 5: What-If Analysis with Scenario Builder (5 min)

Rajesh wants to verify this plan is feasible. He opens **Scenario Builder** and:
- Filters: Bangalore, Parlor channel only
- Adjusts demand slider: **+10%** (planning for aggressive Parlor growth)
- Sees immediate impact:

**Results**:
```
Current Plan Feasibility:
- Line 1 Utilization: 85% → 93% (within safe limit)
- Line 2 Utilization: 45% → 58% (safe)
- Line 3 Utilization: 75% → 82% (safe)
- Status: ✅ FEASIBLE - No production constraints
```

**Confidence**: "Great! Even with 10% growth, our plan holds. I can confidently commit to this production schedule."

---

#### Step 6: Export Plan for Meeting (2 min)

Rajesh generates a **Distributor Outlook** report filtered for:
- 📍 Bangalore & Hyderabad
- 📦 All channels
- 🍦 All SKUs

He downloads as **PDF** to present to the operations team and share with distributors.

---

### **Outcome of Rajesh's Morning Session**:

✅ **Production Plan**: 
- Vanilla: 4,200L/week (Bangalore)
- Caramel: 2,100L/week (extra 600L to cover reorder)
- Mint: 1,400L/week
- Chocolate: 400L/week

✅ **Inventory Decisions**: Caramel reorder approved for Monday afternoon

✅ **Distributor Communication**: Ready with 12-month outlook to share with partners

✅ **Confidence Level**: 93% (within safe production limits)

---

---

## Story 2: Regional Performance Analysis & Growth Opportunity Identification

### **Scenario**: Thursday Morning, 10:00 AM - Priya's Monthly Review

**Setting**: Priya (Regional Manager) sits down for her monthly review. She manages 4 cities: Bangalore, Hyderabad, Chennai, Pune. She wants to understand which regions are growing and where to invest.

### **The Journey**:

#### Step 1: Regional Demand Comparison (5 min)

Priya opens **12-Month Demand Forecast** with filters:
- 📍 Cities: All 4 (Bangalore, Hyderabad, Chennai, Pune)
- 📦 Channels: All 4 (Parlor, Retail, HoReCa, E-commerce)
- 🍦 SKUs: All

**Tabular View - Monthly Demand by City**:
```
| Month | Bangalore | Hyderabad | Chennai | Pune | Total | Growth |
|-------|-----------|-----------|---------|------|-------|--------|
| Apr   | 4,200 L   | 2,800 L   | 1,900 L | 1,500 L | 10,400 L | +5% |
| May   | 5,600 L   | 3,400 L   | 2,400 L | 2,100 L | 13,500 L | +8% |
| Jun   | 7,200 L   | 4,600 L   | 3,200 L | 2,800 L | 17,800 L | +12% |
| Jul   | 8,500 L   | 5,200 L   | 3,800 L | 3,300 L | 20,800 L | +14% |
| Aug   | 8,200 L   | 4,900 L   | 3,600 L | 3,100 L | 19,800 L | +12% |
```

**Insight #1**: "Bangalore is 40% of total demand. Pune is only 15% - significant growth potential here!"

---

#### Step 2: Channel-wise Performance by City (8 min)

Priya filters **Channel Performance Dashboard**:
- 📍 Cities: **Pune, Bangalore** (compare low-growth vs high-growth)
- 📦 Channels: All
- 🍦 SKUs: All

**Tabular Comparison**:
```
City | Channel | Avg Monthly Demand | Growth % | Peak Month | Outlets |
-----|---------|-------------------|----------|------------|---------|
Bangalore | Parlor | 2,100 L | +8% | Aug | 85 |
Bangalore | Retail | 1,470 L | +5% | Aug | 156 |
Bangalore | HoReCa | 420 L | +15% | Aug | 42 |
Bangalore | E-com | 210 L | +35% | Aug | 3 |
Pune | Parlor | 750 L | +8% | Aug | 25 |
Pune | Retail | 525 L | +3% | Aug | 58 |
Pune | HoReCa | 150 L | +12% | Aug | 12 |
Pune | E-com | 75 L | +50% | Aug | 1 |
```

**Insight #2**: "E-commerce in Pune shows 50% growth with only 1 outlet! If I add 3-4 Swiggy/Blinkit outlets, that could drive 200L+ additional volume."

---

#### Step 3: SKU Performance by City (5 min)

Priya opens **SKU Comparison** and filters:
- 📍 Cities: **Pune** (focus on growth opportunity)
- 📦 Channels: **E-commerce only**
- 🍦 SKUs: All

**What She Sees**:
```
SKU | Current Share | Annual Volume | Growth | Recommendation |
----|---------------|---------------|--------|-----------------|
Vanilla | 55% | 4,950 L | +35% | Primary focus |
Caramel | 22% | 1,980 L | +35% | Support Vanilla |
Mint | 18% | 1,620 L | +28% | Premium positioning |
Chocolate | 5% | 450 L | +40% | Untapped potential |
```

**Strategic Insight**: "In Pune E-commerce, Vanilla drives growth. But Chocolate shows highest growth potential (40%). If I promote Chocolate on Swiggy/Blinkit, could capture premium segment."

---

#### Step 4: Budget Allocation Decision (3 min)

Based on her analysis, Priya creates a strategic memo:

**Recommended Investments for Next Quarter**:
1. **Pune E-commerce Expansion** (+₹50L)
   - Add 3 new Swiggy/Blinkit outlets
   - Estimated incremental volume: 300L/month
   - Expected ROI: 25%

2. **Pune Retail Growth** (+₹30L)
   - Add 15 modern trade outlets (high margin)
   - Estimated incremental volume: 180L/month
   - Expected ROI: 18%

3. **Chennai HoReCa Focus** (+₹20L)
   - Target hotels & restaurants (premium pricing)
   - Estimated incremental volume: 120L/month
   - Expected ROI: 22%

---

#### Step 5: Share Insights with Team (2 min)

Priya exports the **Distributor Outlook** for all 4 cities:
- Downloads as **Excel** for detailed analysis
- Downloads as **PDF** for board presentation
- Shares filtered data with regional distributors

---

### **Outcome of Priya's Review**:

✅ **Growth Opportunity Identified**: Pune E-commerce (+50% potential)

✅ **Budget Decision**: ₹100L investment recommended for Q2

✅ **Strategic Focus**: Shift resources to high-growth channels (E-commerce, Modern Retail)

✅ **Stakeholder Communication**: Armed with data-driven insights for board meeting

---

---

## Story 3: Distributor Planning & Inventory Optimization

### **Scenario**: Friday Afternoon, 3:00 PM - Arun's Monthly Planning Call

**Setting**: Arun (Distributor Partner) logs into GSI to review inventory allocation before his monthly call with Baskin Robbins. He distributes to 120 outlets across Bangalore city.

### **The Journey**:

#### Step 1: Monthly Demand Outlook (4 min)

Arun opens **Distributor Outlook** filtered for:
- 📍 Cities: **Bangalore only** (his service area)
- 📦 Channels: **All** (since he serves all channels)
- 🍦 SKUs: All

**12-Month Demand Table He Sees**:
```
Month | Total Demand | Parlor | Retail | HoReCa | E-com | Trend |
------|-------------|--------|--------|--------|-------|-------|
Oct   | 4,200 L    | 2,100L | 1,470L | 420L   | 210L  | ↑ |
Nov   | 5,100 L    | 2,550L | 1,785L | 510L   | 255L  | ↑ |
Dec   | 6,200 L    | 3,100L | 2,170L | 620L   | 310L  | ↑↑ |
Jan   | 5,800 L    | 2,900L | 2,030L | 580L   | 290L  | ↓ |
...   | ...        | ...    | ...    | ...    | ...   | ... |
Aug   | 8,500 L    | 4,250L | 2,975L | 850L   | 425L  | Peak |
```

**Insight**: "June-August is peak season. I'll need to increase cold storage capacity by 40% and arrange extra trucks for delivery."

---

#### Step 2: Inventory Allocation by Channel (6 min)

Arun filters **Inventory Management**:
- 📍 Cities: **Bangalore**
- 📦 Channels: **Parlor, Retail, HoReCa, E-commerce separately**
- 🍦 SKUs: All

**For Parlor Channel**:
```
SKU | Target Stock | Reorder Point | Safety Stock | Monthly Need | Status |
----|--------------|---------------|--------------|--------------|--------|
Vanilla | 5,000 L | 3,500 L | 1,200 L | 2,100 L | Optimal |
Caramel | 2,000 L | 1,400 L | 480 L | 840 L | OK |
Mint | 1,600 L | 1,120 L | 384 L | 672 L | OK |
Chocolate | 450 L | 315 L | 108 L | 190 L | OK |
```

**Decision**: "Vanilla needs special attention in Parlor - 5,000L stock buffer required. That's 2.4 weeks of supply."

---

#### Step 3: Distributor-wise Allocation (5 min)

Arun filters by **Sub-Distributors** (if available) or by **Outlet Groups**:
- Parlor Outlets: 25 outlets, 2,100L/month → 84L per outlet
- Retail Outlets: 58 outlets, 1,470L/month → 25L per outlet  
- HoReCa Outlets: 12 outlets, 420L/month → 35L per outlet

**Planning Table**:
```
Outlet Group | Count | Monthly Need | Per Outlet | Frequency | Days Inventory |
|------------|-------|--------------|-----------|-----------|----------------|
Parlor (5-star hotels) | 8 | 800 L | 100 L | Every 4 days | 3 days |
Parlor (Mid-range) | 12 | 900 L | 75 L | Every 5 days | 4 days |
Parlor (Budget) | 5 | 400 L | 80 L | Every 5 days | 4 days |
Modern Retail | 28 | 850 L | 30 L | Every 10 days | 9 days |
General Trade | 30 | 620 L | 21 L | Every 14 days | 14 days |
HoReCa | 12 | 420 L | 35 L | Every 7 days | 6 days |
E-com Partners | 3 | 210 L | 70 L | Every 8 days | 7 days |
```

**Logistics Planning**: 
- Parlor outlets: Daily/Every 2-day deliveries (high cold chain cost)
- Retail outlets: 10-14 day cycles (cost-efficient)
- E-commerce: 8-day cycles (time-sensitive)

---

#### Step 4: Seasonal Planning (4 min)

Arun looks at the **12-Month Outlook** chart and identifies peak periods:

**Action Plan by Quarter**:

**Q1 (Jan-Mar)**: Normal operations
- Cold storage: Current capacity sufficient
- Trucks: 2 trucks, 2 runs/week
- Target inventory: 12 days (600L buffer)

**Q2 (Apr-May)**: Pre-peak buildup
- Increase cold storage by 20%
- Add 1 extra truck (3 trucks total)
- Increase to 3 runs/week
- Target inventory: 15 days (750L buffer)

**Q3 (Jun-Aug)**: Peak season
- Increase cold storage by 40%
- Add 2 extra trucks (4 trucks total)
- Daily deliveries to Parlor outlets
- 2-3 runs/week to Retail
- Target inventory: 18 days (900L buffer)

**Q4 (Sep-Dec)**: Post-peak normalization
- Reduce cold storage back to normal
- Maintain 3 trucks through December
- 2 runs/week
- Target inventory: 12-14 days (650L buffer)

---

#### Step 5: Cost Optimization Analysis (3 min)

Arun calculates EOQ (Economic Order Quantity):

**Current Order Pattern vs Optimal**:
```
SKU | Current Qty | Current Cost | Optimal Qty (EOQ) | Optimal Cost | Savings |
----|------------|--------------|------------------|--------------|---------|
Vanilla | 500 L | ₹8,500 | 720 L | ₹7,200 | ₹1,300 |
Caramel | 200 L | ₹4,200 | 320 L | ₹3,600 | ₹600 |
Mint | 150 L | ₹3,300 | 250 L | ₹2,800 | ₹500 |
Chocolate | 50 L | ₹1,500 | 85 L | ₹1,200 | ₹300 |
| | | | **Total Savings** | | **₹2,700/month** |
```

**Insight**: "Increasing Vanilla orders from 500L to 720L per order reduces cost by ₹1,300/month. Over a year, that's ₹15,600 in savings!"

---

#### Step 6: Prepare for Planning Call (1 min)

Arun downloads:
- **PDF Distributor Outlook** - To present to Baskin Robbins team
- **Excel Data Sheet** - For detailed calculations
- **Inventory Recommendation Report** - For his operations team

---

### **Outcome of Arun's Planning Session**:

✅ **Inventory Allocation**: Clear plan for all channel types

✅ **Seasonal Preparation**: Cold storage and truck capacity planned for peak season

✅ **Cost Optimization**: Identified ₹2,700/month savings through EOQ optimization

✅ **Logistics Strategy**: Efficient delivery schedules (daily for Parlor, 14-day for general trade)

✅ **Communication Ready**: Prepared presentation for monthly review call with Baskin Robbins

---

---

## 🎯 Key UX Features These Stories Demonstrate

### **Filter Panel Benefits**:
- **Multi-city analysis**: Compare performance across regions
- **Channel-specific planning**: Focus on high-growth channels
- **SKU-level detail**: Understand product-specific trends
- **Easy toggles**: Switch between filtered views instantly

### **Tabular Data Benefits**:
- **Precise numbers**: See exact quantities, not just charts
- **Comparison**: Row-by-row analysis of similar items
- **Decision-making**: Data-driven allocation decisions
- **Export capability**: Share data with teams

### **Real-World Impact**:
- **Rajesh**: Reduced planning time from 4 hours to 2 hours
- **Priya**: Identified ₹100L investment opportunity through data analysis
- **Arun**: Discovered ₹15,600 annual savings through EOQ optimization

---

## 📊 Next Steps: Implementing Filters & Tables

Based on these stories, the following screens should have **Filtering + Tabular Views**:

1. ✅ **12-Month Demand Forecast** - City/Channel/SKU filters + monthly demand table
2. ✅ **SKU Comparison** - City/Channel filters + SKU comparison table
3. ✅ **Channel Performance** - City filters + channel detail table
4. ✅ **Inventory Management** - City/Channel/SKU filters + inventory table
5. ✅ **Production Scheduling** - City/Line filters + schedule table
6. ✅ **Distributor Outlook** - City filters + allocation recommendation table

All following the **single filter panel pattern** for consistency and ease of use.
