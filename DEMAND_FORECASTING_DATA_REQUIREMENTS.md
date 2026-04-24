# Demand Forecasting — Data Requirements & Factors
**Graviss Foods | Baskin-Robbins India**
*Version 1.0 | April 2026*

---

## Overview

This document defines every data point and factor required to build an accurate 12-month demand forecast for Graviss Foods' ice cream portfolio across all SKUs and channels. It covers what data is needed, at what granularity, where to source it, and how it feeds into the forecasting model.

**Forecast output:** Demand in Litres per SKU × Channel × Month, with confidence intervals.

---

## 1. Internal Historical Data

These are the foundation inputs — without clean historical data, no model will be reliable.

### 1.1 Sales & Order History

| Data Point | Minimum Granularity | Minimum History | Source System |
|---|---|---|---|
| Actual sales volume | SKU × Channel × City × Day | 24 months | ERP / SAP |
| Customer orders received | Order line × Date | 24 months | Order Management |
| Shipments dispatched | Batch × Customer × Date | 24 months | WMS / Dispatch |
| Invoice data | SKU × Customer × Value | 24 months | Finance / ERP |
| Returns & rejections | Batch × Reason code × Date | 24 months | Quality / ERP |

> **Key rule:** Use *shipment data* as proxy for demand only when stockouts never occurred. If stockouts happened, use *orders received* and impute lost sales (see Section 1.3).

---

### 1.2 Pricing & Promotions History

| Data Point | Granularity | Why It Matters |
|---|---|---|
| MRP / trade price changes | SKU × Effective date | Demand elasticity — price up = demand down |
| Promotional campaigns | Campaign dates + mechanic + SKU | Separates promo-driven spikes from base demand |
| Trade schemes (distributor) | Discount % × Period | Distributor loading inflates apparent demand |
| Competitor price changes | Competitor × SKU × Date | Cross-elasticity — Amul/Kwality pricing affects share |
| BOGO / combo offers | Offer type × Duration | Typically drives 40–60% uplift on promoted SKU |

---

### 1.3 Stockout & Lost Sales Records

Stockouts are the single biggest source of forecast error — they make demand appear lower than it actually is.

| Data Point | Granularity | Action Required |
|---|---|---|
| Stockout events | SKU × Location × Date range | Impute lost demand using sell-rate before/after event |
| Partial fulfilment | Order qty vs. shipped qty | Gap = lost demand |
| Distributor complaints / backorders | Volume × Date | Additional lost demand signal |
| E-commerce "out of stock" flags | Platform × SKU × Hour | Especially critical for Blinkit/Swiggy |

**Imputation method:** Replace zero/suppressed sales during stockout with the average daily rate from the 14 days before and after the event.

---

### 1.4 Production & Inventory Records

| Data Point | Granularity | Why It Matters |
|---|---|---|
| Actual production volumes | SKU × Line × Day | Validates demand vs. supply separation |
| FG inventory levels | SKU × Cold store × Daily | Opening stock for production planning |
| Production downtime | Line × Date × Reason | Distinguishes supply-constrained periods |
| Wastage / expired stock written off | SKU × Batch × Volume | Reduces net available supply |

---

## 2. External Factors — Weather & Climate

Temperature is the **single strongest external predictor** of ice cream demand in India. A 1°C rise above 30°C baseline corresponds to approximately 3–5% demand increase in key markets.

### 2.1 Temperature Data

| Data Point | Granularity | Source |
|---|---|---|
| Maximum daily temperature | City-level × Day | IMD (India Meteorological Department) |
| Mean daily temperature | City-level × Day | IMD |
| Forecast temperature (30-day) | City-level × Day | IMD / Weather API (OpenWeatherMap, AccuWeather) |
| Historical temperature normals | City × Month (30-year avg.) | IMD climatological tables |

**Key cities to track:** Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad

**Temperature effect reference:**

| Avg. Max Temperature | Demand Index (vs. baseline) |
|---|---|
| Below 25°C | 0.60 — 0.75 |
| 25°C — 30°C | 0.80 — 0.95 |
| 30°C — 35°C | 1.00 (baseline) |
| 35°C — 38°C | 1.15 — 1.30 |
| Above 38°C (heatwave) | 1.35 — 1.60 |

---

### 2.2 Other Weather Variables

| Factor | Granularity | Effect on Demand |
|---|---|---|
| Humidity (%) | City × Day | High humidity amplifies temperature effect |
| Rainfall (mm/day) | City × Day | Reduces parlour footfall and street traffic |
| Heatwave alerts | City × Date | 2–3 day advance demand spike predictor |
| Monsoon onset/withdrawal dates | Region × Year | Defines seasonal demand boundaries |

**Monsoon impact by channel:**
- Parlour: −20 to −30% during heavy rain periods
- Retail: −5 to −10% (less impacted, in-store purchase)
- HoReCa: −10 to −15%
- E-Commerce: +5 to +10% (people order in instead of going out)

---

## 3. Calendar & Event Factors

### 3.1 Indian Festival Calendar

Festivals must be mapped annually since dates shift by the Hindu/Lunar calendar.

| Festival | Typical Month | Channel Impact | Demand Effect |
|---|---|---|---|
| Diwali | Oct — Nov | Retail, HoReCa gift boxes | +15 — 25% in week of |
| Holi | Mar | Parlour, Retail | +10 — 20% |
| Navratri / Garba | Sep — Oct | Parlour, HoReCa | +10 — 15% (Gujarat, Maharashtra) |
| Onam | Aug — Sep | Retail, HoReCa | +15 — 20% (Kerala) |
| Pongal / Makar Sankranti | Jan | Retail | +5 — 10% (South India) |
| Eid | Varies | Parlour, HoReCa | +10 — 15% post-iftar |
| Christmas | Dec | HoReCa, Retail | +10 — 20% |

---

### 3.2 School & College Holidays

The most reliable demand predictor after temperature.

| Period | Dates (approx.) | Demand Impact |
|---|---|---|
| Summer holidays | Mid-April → early June | Peak season — +40 to +60% vs. school-term baseline |
| Diwali break | Oct (1–2 weeks) | Secondary peak — +15 to +25% |
| Christmas / New Year | Dec 25 — Jan 1 | +10 to +20% for parlour |
| State board exam periods | Feb — Mar | Suppresses parlour footfall in some zones |

---

### 3.3 Sports & Entertainment Events

| Event | Frequency | Channel | Effect |
|---|---|---|---|
| IPL (Indian Premier League) | Mar — May (annual) | HoReCa, E-Commerce | +10 — 20% on match days |
| ICC World Cup / bilateral series | Varies | HoReCa | +15 — 25% on final/knockout days |
| Major Bollywood releases | Weekly | Multiplexes (HoReCa) | Local spike |

---

### 3.4 Long Weekends & Public Holidays

Build a full calendar of national + state-level public holidays per year.

| Holiday Type | Advance Booking | Demand Lift |
|---|---|---|
| 3-day long weekend | +2 — 3 days pre-holiday purchase | +10 — 15% |
| Republic / Independence Day | Same day | +5 — 10% |
| Dry days (alcohol ban) | Day before and day of | Negligible direct effect |

---

## 4. Channel-Specific Factors

Each channel has distinct demand drivers that must be modelled separately.

### 4.1 Parlour Channel

| Factor | Data Point Needed | Source |
|---|---|---|
| Footfall | Daily customer count per outlet (POS) | POS system |
| Outlet count | Active outlets × Opening dates | Franchise operations |
| Outlet closures / renovations | Downtime dates × Volume impact | Ops team |
| New outlet ramp-up curve | Sales by week since opening | Historical openings |
| Catchment area profile | Proximity to school / mall / park | Google Maps / GIS |
| Conversion rate | Visitors → transactions | POS system |

---

### 4.2 Retail Channel (Modern Trade + General Trade)

| Factor | Data Point Needed | Source |
|---|---|---|
| Shelf space (facings) | SKU × Store × Date | Trade marketing |
| Planogram changes | Date + before/after facings | Trade marketing |
| Freezer placement | Primary (eye-level) vs. secondary | Field sales |
| New store listings | Store × SKU × Date | Key account team |
| De-listing events | Date × Reason | Key account team |
| Retailer promotions | Retailer × Mechanic × Dates | Trade marketing |
| MT sell-out data | SKU × Store × Week | Nielsen / retailer portal |

---

### 4.3 HoReCa Channel (Hotels, Restaurants, Catering)

| Factor | Data Point Needed | Source |
|---|---|---|
| Hotel occupancy rates | Property × Month | STR / hospitality partners |
| Restaurant covers served | Key accounts × Month | Account managers |
| Event catering pipeline | Event date × Expected qty × SKU | Events/catering team |
| Wedding season bookings | Region × Month pipeline | Sales CRM |
| Corporate / airline contracts | Volume commitment × Period | Contract team |
| Menu inclusions / removals | Account × SKU × Date | Account managers |

---

### 4.4 E-Commerce Channel (Swiggy, Blinkit, Zomato, Amazon)

| Factor | Data Point Needed | Source |
|---|---|---|
| Platform-level sales data | SKU × Platform × Day | Platform seller portal |
| Search ranking / visibility | SKU × Platform × Week | Platform analytics |
| Delivery radius coverage | Serviceable pin codes × Date | Dark store operations |
| Out-of-stock hours | SKU × Platform × Duration | Platform seller portal |
| Competitor pricing | SKU equivalent × Platform × Day | Price monitoring tool |
| Platform-sponsored ads spend | Campaign × SKU × Dates | Marketing team |
| Rating / review scores | Platform × SKU × Month | Platform seller portal |

---

## 5. SKU-Level Factors

### 5.1 Product Portfolio Dynamics

| Factor | Data Point Needed | Notes |
|---|---|---|
| New SKU launch dates | SKU × Date × Channel | Cannibalization modelling required |
| SKU phase-out / discontinuation | Date + substitution SKU | Demand transfer estimation |
| Seasonal SKU availability | SKU × Active months | e.g. Mango Tango only Apr–Jul |
| Pack size changes | SKU × Old vs. new size × Date | Volume conversion required |
| Recipe / formulation changes | SKU × Date | May affect repeat purchase |

---

### 5.2 Flavour Demand Characteristics

| SKU | Seasonality Pattern | Peak Month | Key Driver |
|---|---|---|---|
| Vanilla | Moderate seasonal | June | Universal — always in demand |
| Caramel | Low seasonal | May | Event/gifting driven |
| Mint | High seasonal (summer) | May — June | Heat relief association |
| Chocolate | Moderate seasonal | November | Festival/gifting driven |
| Mango (seasonal) | Extreme seasonal | May | Mango season association |

---

### 5.3 Consumer Preference Signals

| Factor | Source | Refresh Frequency |
|---|---|---|
| Social media sentiment | Instagram / Twitter tags | Weekly |
| Zomato / Swiggy flavour ratings | Platform API | Monthly |
| Consumer panel data | Nielsen / Kantar | Quarterly |
| Google Trends (flavour keywords) | Google Trends API | Weekly |

---

## 6. Supply-Side Constraints

These do not drive consumer demand but shape *fulfilled* demand and must be used to separate demand signals from supply-constrained observations.

| Constraint | Data Needed | Impact |
|---|---|---|
| Production capacity (L/month) | Line × SKU × Working days | Caps what can be shipped |
| Planned maintenance shutdowns | Line × Date range | Zero-production periods |
| Cold storage capacity | Volume (L) × Location | Distribution bottleneck |
| Freezer truck fleet availability | Units × Date | Last-mile constraint |
| Raw material availability | RM × Stock × Lead time | Ingredient stockouts cause FG stockouts |
| Power outages (cold chain) | Location × Duration | Quality loss → write-off |

---

## 7. Macroeconomic & Market Factors

| Factor | Proxy Measure | Source | Refresh |
|---|---|---|---|
| Consumer spending power | RBI Household Expenditure Index | RBI | Quarterly |
| Food & beverages inflation (CPI) | CPI Food sub-index | MOSPI | Monthly |
| Urban population growth | City-level census projections | Census / UIDAI | Annual |
| Organised ice cream market growth | Industry CAGR (~15% India) | Euromonitor / IMARC | Annual |
| Competitor new product launches | SKU tracker | Field sales / Nielsen | Monthly |
| Competitor distribution expansion | New outlet count (Amul, Walls) | Market intelligence | Quarterly |

---

## 8. The Forecasting Model — Input → Output Map

### 8.1 Model Formula (Simplified)

```
Forecast(SKU, Channel, City, Month) =

    Base_Demand(SKU, Channel, City, Month)          ← 24-month rolling avg, deseasoned
  × Seasonal_Index(Month)                           ← month-of-year effect, 3-year avg
  × Temperature_Multiplier(City, Forecast_Temp)     ← regression coefficient per city
  × Calendar_Effect(Festival_Flag, Holiday_Flag)    ← additive lift from event calendar
  × Channel_Trend(Channel, YoY_Growth_Rate)         ← e.g. E-Commerce +25% YoY
  × Promo_Multiplier(if promotion planned)          ← uplift coefficient by mechanic
  × Price_Elasticity_Factor(Price_Change %)         ← −0.4 to −0.8 typical for FMCG
  + Stockout_Imputation(if stockout in history)     ← corrects suppressed signal
  ± Regression_Residual                             ← unexplained variance

Confidence Interval Width:
  Months 1–3   →  ±  5–10%
  Months 4–6   →  ± 15–20%
  Months 7–12  →  ± 20–30%
```

---

### 8.2 Data Requirements Summary Table

| Category | # Data Points | Minimum History | Priority |
|---|---|---|---|
| Historical sales & orders | 5 | 24 months | 🔴 Critical |
| Stockout / lost sales | 3 | 24 months | 🔴 Critical |
| Temperature (historical) | 4 | 36 months | 🔴 Critical |
| Temperature (forecast) | 2 | Rolling 30-day | 🔴 Critical |
| Festival / holiday calendar | 15+ events | Annual refresh | 🔴 Critical |
| School holiday calendar | 3 periods | Annual refresh | 🟠 High |
| Channel-specific factors | 20+ | 12 months | 🟠 High |
| Pricing & promotions | 5 | 24 months | 🟠 High |
| SKU portfolio changes | 4 | As they occur | 🟠 High |
| Macroeconomic indicators | 4 | Quarterly | 🟡 Medium |
| Social sentiment / trends | 3 | 12 months | 🟡 Medium |
| Competitor activity | 4 | 12 months | 🟡 Medium |

---

## 9. What the Current Prototype Models vs. What's Missing

### Currently Modelled (in app)
- ✅ Monthly seasonality (summer peak pattern)
- ✅ Channel weights (static % split by month)
- ✅ SKU mix weights (static)
- ✅ Confidence intervals (3 tiers: months 1–3, 4–6, 7–9)
- ✅ Capacity utilisation flags

### High-Value Additions (not yet modelled)

| Gap | Effort | Demand Impact | Recommendation |
|---|---|---|---|
| 🌡️ Live temperature feeds | Medium | Very High | **Build first** — IMD API or OpenWeatherMap |
| 📅 Dynamic festival calendar | Low | High | **Build second** — JSON calendar file, updated annually |
| 📦 Stockout-adjusted actuals | High | High | Requires POS/order reconciliation |
| 📈 Channel growth trends | Low | Medium | E-Commerce growing 25%+ YoY — static weights underforecast |
| 🗺️ City-level granularity | High | High | Mumbai ≠ Delhi seasonality; different festival calendars |
| 💰 Promo lift coefficients | Medium | Medium | Needs promo history + sales uplift measurement |
| 🏪 HoReCa occupancy input | Medium | Medium | Hotel occupancy API or manual input |

---

## 10. Data Governance & Freshness Requirements

| Data Source | Acceptable Lag | Owner | Update Frequency |
|---|---|---|---|
| Sales actuals | ≤ 3 days | Sales Ops | Daily |
| Production actuals | ≤ 1 day | Plant Manager | Daily |
| FG inventory | Real-time | WMS | Hourly |
| Weather forecast | ≤ 1 day | Auto-API | Daily |
| Festival calendar | ≤ 1 year | Demand Planner | Annual |
| Pricing changes | Same day | Trade Marketing | On change |
| Promo calendar | ≤ 1 week ahead | Marketing | Rolling 8 weeks |
| Nielsen retail audit | ≤ 4 weeks | Category team | Monthly |

---

*Document maintained by: Demand Planning Team, Graviss Foods*
*Last updated: April 2026*
*Next review: October 2026*
