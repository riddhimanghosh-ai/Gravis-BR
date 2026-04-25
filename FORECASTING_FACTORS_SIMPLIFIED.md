# Ice Cream Demand Forecasting — Key Factors (Business Version)

**Purpose:** Understand what drives ice cream demand at Graviss Foods so we can predict sales 6-12 months ahead.

---

## SECTION 1: What We Sold Before (Historical Sales Data)

### 1.1 Past Sales Records
**What it is:** Last 2 years of actual sales by flavor, store location, and how it was sold (parlour, retail shop, restaurant, app delivery).  
**Why it matters:** Shows us patterns — which flavors sold well in which seasons, which stores are busy.  
**Source:** Our order system and billing records.

### 1.2 What Customers Ordered
**What it is:** The actual orders customers placed, not just what we shipped (important when we run out of stock).  
**Why it matters:** If we ran out of Vanilla ice cream, the sales look lower than the real demand. We need to find the "hidden" lost sales.  
**Source:** Our order management system.

### 1.3 Promotions We Ran
**What it is:** When we lowered prices, offered discounts, or ran "Buy 1 Get 1" campaigns, and how much they boosted sales.  
**Why it matters:** A sales spike during a promotion isn't real demand — it's temporary. We need to separate "normal" demand from "promo-driven" demand.  
**Source:** Marketing team records, trade promotions database.

### 1.4 Times We Ran Out of Stock
**What it is:** Dates and locations where we didn't have enough ice cream to fulfill customer orders.  
**Why it matters:** When we're out of stock, we lose sales that look like "no demand" but are actually "we couldn't supply." This distorts our forecasts.  
**Source:** Warehouse records, customer complaints, E-commerce "out of stock" logs.

### 1.5 What We Made vs. What We Had
**What it is:** Daily production volumes, inventory levels in cold stores, and any ice cream we had to throw away due to expiry or spoilage.  
**Why it matters:** Tells us the true supply picture — if demand was high but we couldn't produce enough, or if we made too much and wasted it.  
**Source:** Production logs, cold storage temperature records.

---

## SECTION 2: Weather & Temperature

### 2.1 Daily Temperature
**What it is:** Maximum and average daily temperature in cities where we sell (Mumbai, Delhi, Bangalore, Chennai, etc.).  
**Why it matters:** THIS IS THE #1 FACTOR. When it's hot (above 35°C), ice cream demand shoots up by 30-40%. When it's cool (below 25°C), demand drops by 25-40%.  
**Source:** Indian Meteorological Department (IMD) website, weather apps.

### 2.2 Heat Waves & Extreme Heat Days
**What it is:** Alerts when temperature is forecast to exceed 38°C.  
**Why it matters:** During heat waves, people panic-buy ice cream. We see a spike 2-3 days in advance and for 1-2 weeks after.  
**Source:** IMD heat wave alerts, weather forecasts.

### 2.3 Rainfall & Monsoon
**What it is:** Days with rain, humidity levels, and when monsoon season starts/ends.  
**Why it matters:** Heavy rain keeps people indoors, so parlour sales drop 20-30%. But e-commerce (Swiggy, Blinkit) delivery orders go UP because people order from home.  
**Source:** Weather APIs, IMD rainfall data.

---

## SECTION 3: School Holidays & Festivals

### 3.1 School & College Holidays
**What it is:** Summer vacations (April-May), Diwali break, Christmas break, exam periods.  
**Why it matters:** School holidays are our BIGGEST demand driver after temperature. Summer holidays boost sales 40-60% because families go out, kids want ice cream, and parlours get crowded.  
**Source:** Education department holiday calendar, school association publications.

### 3.2 Major Indian Festivals
**What it is:** Diwali, Holi, Navratri, Onam, Eid, Christmas — dates shift each year on the lunar calendar.  
**Why it matters:** Before/after festivals, retail sales spike 15-25% from gift boxes and family celebrations. Different regions celebrate different festivals.  
**Source:** Festival calendars, regional government notifications.

### 3.3 Long Weekends
**What it is:** Public holidays that create 3-4 day breaks (Republic Day, Independence Day, etc.).  
**Why it matters:** People travel and go to tourist spots, parlours near highways/malls see 10-15% sales lift.  
**Source:** Government holiday calendar.

### 3.4 Sports Events (IPL, World Cup)
**What it is:** Cricket matches, especially tournament finals and India matches.  
**Why it matters:** Restaurants and bars (HoReCa channel) see 15-25% spike on match days. E-commerce delivery surges on finals nights.  
**Source:** Cricket schedule, sports calendars.

---

## SECTION 4: Channel-Specific Factors

### 4.1 PARLOUR CHANNEL (Ice Cream Shops)

**Customer footfall:** Daily count of people visiting our ice cream shops.  
Why: More visitors = more potential sales. We track this via POS systems.

**New shop openings & closures:** When we open a new parlour, how many months to reach full capacity?  
Why: A new shop ramps up slowly (first month 30% of normal sales, month 2 = 60%, month 3 = 100%).

**Shop location quality:** Is it near a school, mall, park, or busy street?  
Why: A shop near a college will be busier (higher baseline sales) than a shop in a quiet residential area.

---

### 4.2 RETAIL CHANNEL (Supermarkets & Small Shops)

**Shelf space:** How many positions/spots does our ice cream get on the freezer shelf?  
Why: More shelf space = more visibility = more sales. When we lose shelf space, sales drop 20-30%.

**New store listings:** When we enter a new supermarket chain or get listed in a new shop.  
Why: Each new store adds incremental sales. We track the "ramp-up curve" — how fast sales grow in that store.

**Retailer's own discounts:** When the supermarket runs a promotion on our brand.  
Why: Creates artificial spike. We need to separate "our brand promotion" from "retailer's discount."

---

### 4.3 HORECA CHANNEL (Restaurants, Hotels, Catering)

**Hotel occupancy rates:** What % of hotel rooms are booked each month.  
Why: Higher occupancy = more guests = more ice cream desserts sold.

**Wedding season:** Which months have peak weddings and catering events.  
Why: Weddings drive big bulk orders. June-July and Nov-Dec have peak weddings, boosting HoReCa sales by 20-30%.

**Contract volumes:** Agreements with airlines, corporate offices, wedding caterers for fixed monthly supplies.  
Why: These are guaranteed volumes — easier to forecast than retail.

---

### 4.4 E-COMMERCE CHANNEL (Swiggy, Blinkit, Zomato)

**Delivery coverage:** Which pin codes can we deliver to on each app.  
Why: If Blinkit expands to 50 new pin codes, we pick up those incremental sales.

**Product visibility:** Where our flavor appears in the app's search results and recommendations.  
Why: If Swiggy bumps us to "Featured" category, sales of that flavor rise 30-50%.

**Out-of-stock frequency:** How often customers see "out of stock" on Blinkit/Swiggy.  
Why: More stockouts = lost sales. We track app-level inventory carefully.

**Competitor pricing:** What prices are Amul and other brands charging on the app.  
Why: If we're 20% more expensive than Amul, customers switch. Price elasticity is high on e-commerce.

---

## SECTION 5: Flavor-Specific Factors

### 5.1 Which Flavors Are Seasonal

**Vanilla:** Available year-round, steady demand, slight summer dip (people want more exotic flavors in heat).

**Mint:** Peaks May-July (people perceive it as "cooling"), drops sharply Oct-Feb.

**Caramel:** Peaks around festivals (Diwali, Christmas) when gifting happens.

**Mango (seasonal):** Only April-July (real mango season), disappears rest of year.

---

### 5.2 New Product Launches

**What it is:** When we launch a new flavor or pack size.  
**Why it matters:** Initial surge due to novelty (week 1-4 = +50%). Then demand settles to normal level.

**Cannibalization:** Will a new vanilla variant steal sales from the original vanilla flavor?  
**Why it matters:** New product doesn't add 100% new sales — some comes from existing products.

---

## SECTION 6: Consumer Trends & Sentiment

### 6.1 Social Media Popularity
**What it is:** Mentions, hashtags, ratings for each flavor on Instagram, Twitter, Zomato.  
**Why it matters:** A flavor trending on Instagram can drive 10-15% sales spike among younger customers.

### 6.2 Zomato & Google Reviews
**What it is:** Ratings, reviews, and sentiment about our flavors on food platforms.  
**Why it matters:** High ratings boost sales 5-10%. Bad reviews (e.g., "too sweet," "tastes artificial") suppress demand.

---

## SECTION 7: Market & Competition

### 7.1 Competitor New Stores
**What it is:** When Amul or Walls opens a new outlet or expands distribution near us.  
**Why it matters:** We lose 5-10% market share locally when a strong competitor enters.

### 7.2 Competitor Price Changes
**What it is:** When rivals drop prices or launch cheaper products.  
**Why it matters:** If Amul drops prices 10%, we see 8-12% sales decline unless we match.

### 7.3 Overall Market Growth
**What it is:** Percentage growth of the organized ice cream market in India (~15% annual).  
**Why it matters:** The overall market is growing. We forecast our share of that growth.

---

## SECTION 8: Supply Constraints (What We CAN'T Control)

### 8.1 Production Capacity
**What it is:** Maximum litres we can produce per month (capacity = 1,500 L/month with all 3 lines running).  
**Why it matters:** Even if demand is 2,000 L, we can only supply 1,500 L. Forecast must account for capacity limits.

### 8.2 Planned Maintenance Shutdowns
**What it is:** When we close a production line for cleaning, repairs, or equipment servicing (typically 2-3 days/month).  
**Why it matters:** During shutdown, production = 0 for that line. We must pre-produce and stockpile before shutdown.

### 8.3 Cold Storage Capacity
**What it is:** Total litres we can store in cold rooms (Mumbai, Delhi, Bangalore warehouses).  
**Why it matters:** Can't store more than capacity. This limits "pre-build" strategies for peak season.

### 8.4 Raw Material Supply
**What it is:** Availability of milk powder, cream, sugar, flavourings (any can have supply delays).  
**Why it matters:** If milk powder supplier is delayed, we can't produce even if demand is high.

---

## SECTION 9: How We Use All This To Forecast

### The Simple Formula:
```
DEMAND = Base Demand 
         × Temperature Effect 
         × Holiday/Festival Effect 
         × Channel Effect 
         × Competitor Effect 
         × Trend Effect
```

### What Each Factor Does:

**Temperature:** If it's hot, multiply base demand by 1.3 (30% increase). If cold, multiply by 0.7 (30% decrease).

**Holidays:** During school holidays, multiply by 1.4-1.6 (40-60% increase). During rainy monsoon, multiply by 0.8 (20% decrease).

**Channel:** E-commerce during monsoon? Multiply by 1.1 (10% increase). Parlour during monsoon? Multiply by 0.8 (20% decrease).

**Stockouts in past:** If we ran out of Mint last summer, add back the "lost demand" to show true demand was higher.

---

## SECTION 10: Example: Predicting May 2026 Demand

**Vanilla flavor, all channels combined:**

| Factor | Multiplier | Reason |
|---|---|---|
| Base demand (avg. month) | 1,000 L | Starting point |
| **Temperature effect** | × 1.35 | May has 34-36°C heat |
| **School holidays** | × 1.50 | Summer vacations start |
| **No major festivals** | × 1.0 | No Diwali/Holi |
| **E-commerce surge** | × 1.10 | Heat = more delivery orders |
| **Competitor activity** | × 0.95 | Amul running promotion |
| **No stockouts last year** | × 1.0 | Demand is real |
| | | |
| **FORECAST** | **1,000 × 1.35 × 1.50 × 1.0 × 1.10 × 0.95 × 1.0** | **= 2,110 L** |

---

## CHECKLIST: Data We Need Every Month

- [ ] Temperature data (past & forecast) for all 8 cities
- [ ] Holiday/festival calendar (updated annually)
- [ ] School holiday dates
- [ ] Actual sales by SKU × Channel (previous month)
- [ ] Stockout events (when we ran out)
- [ ] Promotions we ran and their dates
- [ ] New store openings / closures
- [ ] Competitor price changes
- [ ] E-commerce platform visibility changes
- [ ] Production downtime scheduled

---

**Bottom Line:** Ice cream demand is driven 60% by weather, 20% by holidays/events, 10% by marketing/promotions, and 10% by channel-specific factors. By tracking these factors systematically, we can forecast demand 6-12 months ahead with 85%+ accuracy.
