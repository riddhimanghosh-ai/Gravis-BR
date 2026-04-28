# ML Demand Forecasting — Implementation Guide
## Graviss Foods (Baskin-Robbins India) · GSI Platform

**Audience:** Data Science & Engineering team  
**Purpose:** End-to-end blueprint for building the ML forecasting engine that powers the GSI Demand Forecast screen  
**Forecast scope:** 6-month forward forecast per SKU per channel per city, refreshed monthly

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Data Requirements](#2-data-requirements)
3. [Data Sources & Ingestion](#3-data-sources--ingestion)
4. [Feature Engineering](#4-feature-engineering)
5. [Model Selection & Training](#5-model-selection--training)
6. [Channel-Wise Forecasting](#6-channel-wise-forecasting)
7. [Confidence Intervals](#7-confidence-intervals)
8. [Model Evaluation](#8-model-evaluation)
9. [Deployment & Integration with GSI](#9-deployment--integration-with-gsi)
10. [Retraining & Monitoring](#10-retraining--monitoring)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (ingestion + storage)                 │
│  ERP Sales DB  │  Weather API  │  Festival Calendar  │  E-Comm API  │
└────────────────────────────────┬────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 FEATURE STORE  (BigQuery / Redshift)                │
│  Cleaned time series  │  Engineered features  │  Stockout flags     │
└────────────────────────────────┬────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MODEL TRAINING PIPELINE                          │
│  Prophet (trend + seasonality)  │  LightGBM (external regressors)  │
│              Ensemble (weighted average)                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                FORECAST SERVING API  (FastAPI / Flask)              │
│  /forecast?sku=Vanilla&channel=Parlor&city=Bangalore&months=6       │
└────────────────────────────────┬────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              GSI FRONTEND  (React — DemandForecast12Month.js)       │
└─────────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **Hierarchical forecasting:** Train separate models per (SKU, Channel, City) triplet, then reconcile top-down
- **Two-model ensemble:** Prophet handles trend/seasonality well; LightGBM handles external regressors (weather, festivals) better. Combine both.
- **Minimum 24 months** of historical data needed to capture two full seasonal cycles
- **Monthly granularity** for 6-month forecasts; daily granularity model for weekly production plan screen

---

## 2. Data Requirements

### 2.1 Primary Dataset — Historical Sales

| Field | Type | Description | Minimum History |
|---|---|---|---|
| `date` | date | Transaction date (daily) | 24 months |
| `sku` | string | Vanilla / Caramel / Mint / Chocolate | — |
| `channel` | string | Parlor / Retail / HoReCa / E-Commerce | — |
| `city` | string | Bangalore / Hyderabad / Chennai / Pune | — |
| `sales_qty_l` | float | Actual litres sold | — |
| `order_qty_l` | float | Customer-ordered litres (incl. unfulfilled) | — |
| `stockout_flag` | bool | 1 = ran out of stock that day | — |
| `promo_flag` | bool | 1 = promotion active | — |
| `promo_discount_pct` | float | Discount % during promotion | — |
| `price_per_l` | float | Selling price (for elasticity) | — |

> **Critical:** Use `order_qty_l` (demand signal), not `sales_qty_l` (supply-constrained) during stockout periods. When `stockout_flag = 1`, impute demand using a stockout correction multiplier (~1.3× average non-stockout day demand for that SKU/channel).

---

### 2.2 Weather Data

| Field | Type | Description |
|---|---|---|
| `date` | date | Daily |
| `city` | string | City name |
| `temp_max_c` | float | Maximum daily temperature (°C) |
| `temp_avg_c` | float | Average daily temperature (°C) |
| `rainfall_mm` | float | Daily rainfall in mm |
| `humidity_pct` | float | Average relative humidity (%) |
| `heatwave_flag` | bool | 1 = IMD declared heat wave alert |
| `monsoon_active` | bool | 1 = monsoon season active |

---

### 2.3 Calendar & Event Data

| Field | Type | Description |
|---|---|---|
| `date` | date | Daily |
| `school_holiday` | bool | 1 = schools closed (all boards) |
| `summer_vacation` | bool | 1 = peak summer holiday window (Apr–May) |
| `festival_name` | string | "Diwali", "Holi", "Eid", etc. (null if none) |
| `days_to_festival` | int | Days until nearest major festival (0–30) |
| `days_after_festival` | int | Days since last major festival (0–14) |
| `public_holiday` | bool | 1 = national/state public holiday |
| `long_weekend` | bool | 1 = 3+ day weekend |
| `ipl_match_day` | bool | 1 = IPL match scheduled (HoReCa driver) |
| `ipl_final` | bool | 1 = IPL/WC final day |

---

### 2.4 Channel-Specific Data

**Parlor Channel:**
| Field | Description |
|---|---|
| `parlor_id` | Unique outlet ID |
| `daily_footfall` | Customer count (from POS system) |
| `outlet_age_months` | Months since opening (ramp-up curve) |
| `location_type` | mall / school-adjacent / highway / residential |
| `nearby_competitor_opened` | 1 = competitor opened within 500m in last 30 days |

**Retail Channel:**
| Field | Description |
|---|---|
| `store_id` | Supermarket/kirana store ID |
| `shelf_facings` | Number of product facings in freezer |
| `shelf_position` | eye-level / mid / bottom |
| `retailer_promo_flag` | 1 = retailer running their own promotion on us |

**HoReCa Channel:**
| Field | Description |
|---|---|
| `account_id` | Hotel/restaurant account ID |
| `hotel_occupancy_pct` | City-level hotel occupancy rate (STR data) |
| `wedding_season_flag` | 1 = peak wedding season (Jun–Jul, Nov–Dec) |
| `contract_vol_l` | Guaranteed monthly volume from fixed contracts |

**E-Commerce Channel:**
| Field | Description |
|---|---|
| `platform` | Swiggy / Blinkit / Zomato |
| `pincode_coverage` | Count of pincodes we can deliver to |
| `app_rank` | Search rank position for "ice cream" keyword |
| `featured_flag` | 1 = shown in featured/promoted section |
| `competitor_price_index` | Our price / Amul price ratio (1.0 = parity) |
| `platform_stockout_pct` | % of SKU-hours showing "out of stock" |

---

### 2.5 Competitor Data

| Field | Description |
|---|---|
| `competitor_name` | Amul / Walls / Naturals |
| `new_outlet_opened_500m` | 1 = competitor opened store near our Parlor |
| `competitor_price_change_pct` | % change in competitor's price vs last month |
| `competitor_promo_flag` | 1 = major competitor running promotion |

---

### 2.6 Macro / Consumer Sentiment

| Field | Description |
|---|---|
| `social_media_mentions` | Weekly Instagram/Twitter mentions for each SKU |
| `zomato_rating` | Monthly average Zomato rating per SKU |
| `google_trends_index` | Weekly Google Trends score for "ice cream" in each city |

---

## 3. Data Sources & Ingestion

### 3.1 Internal Sources (Pull from existing systems)

| Source System | Data | Frequency | Integration Method |
|---|---|---|---|
| **ERP / SAP** | Sales orders, production, inventory | Daily batch | JDBC connector / REST API |
| **POS System** | Parlor footfall, transaction data | Daily | POS vendor API |
| **WMS (Warehouse)** | Stockout events, cold store levels | Real-time | Webhook |
| **Marketing DB** | Promotion calendar, discount history | Monthly | CSV upload / shared DB |
| **E-comm Partner Portal** | Swiggy/Blinkit visibility, stockout rates | Weekly | Platform API (Swiggy Partner API) |

---

### 3.2 External Sources (Third-party APIs)

| Provider | Data | API / Method | Cost |
|---|---|---|---|
| **OpenWeatherMap** | Historical + 7-day forecast temperature, rainfall, humidity for all cities | REST API — `api.openweathermap.org/data/2.5` | Free tier: 1,000 calls/day; Paid: ₹2,500/month |
| **IMD (govt.in)** | Official weather, monsoon onset/withdrawal dates, heat wave alerts | `mausam.imd.gov.in` (scraping or RSS alerts) | Free |
| **Weatherstack** | Alternative weather source for redundancy | REST API | $10/month |
| **Google Calendar API** | Public holidays for all Indian states | `googleapis.com/calendar/v3` | Free |
| **School Holiday DB** | CBSE, ICSE, State board calendars | Annual scrape from board websites | Free |
| **Hindu Calendar / Drik Panchang** | Festival dates (Diwali, Holi, etc.) — lunar calendar | `https://www.drikpanchang.com` scrape or `HinduCalendar API` | Free |
| **STR / HotelAnalytix** | City-level hotel occupancy rates | Monthly CSV or REST API | ~$500/month (negotiable) |
| **Cricbuzz / ESPNCricinfo** | IPL/WC match schedule | REST API | Free |
| **Google Trends API (pytrends)** | Weekly search interest for "ice cream" by city | `pytrends` Python library | Free |
| **Zomato/Swiggy Public Pages** | Competitor pricing, ratings | Web scraping (monthly) | Free (with scraper infra) |

---

### 3.3 Ingestion Pipeline Architecture

```python
# Airflow DAG — runs daily at 06:00 IST
from airflow import DAG
from airflow.operators.python import PythonOperator

# Tasks:
# 1. pull_erp_sales()       — JDBC query to SAP, write to BigQuery
# 2. pull_weather()         — OpenWeatherMap API for 8 cities, write to BQ
# 3. pull_ecomm_data()      — Swiggy/Blinkit API, write to BQ
# 4. build_calendar_flags() — Festival/holiday feature table refresh
# 5. run_stockout_correction() — Impute demand on stockout days
# 6. trigger_feature_store_refresh() — Rebuild ML features table
# 7. trigger_model_scoring()  — Score forecast for next 6 months
```

**Storage:** Google BigQuery (recommended) or AWS Redshift  
**Orchestration:** Apache Airflow (Cloud Composer on GCP)  
**Format:** Parquet for large tables, JSON for API responses  

---

## 4. Feature Engineering

### 4.1 Demand Signal Cleaning

```python
def clean_demand(df):
    """
    Replace sales_qty with order_qty on stockout days.
    Then apply stockout correction multiplier.
    """
    df['true_demand'] = df['sales_qty_l']
    
    # Step 1: Use order quantity where stockout occurred
    mask = df['stockout_flag'] == 1
    df.loc[mask, 'true_demand'] = df.loc[mask, 'order_qty_l']
    
    # Step 2: Estimate lost demand (orders > shipped = partial stockout)
    # Use rolling 30-day average for the same sku/channel/dow as baseline
    df['baseline_demand'] = df.groupby(
        ['sku', 'channel', df['date'].dt.dayofweek]
    )['true_demand'].transform(
        lambda x: x.rolling(30, min_periods=7).mean()
    )
    
    # Step 3: For complete stockouts (order_qty = 0), impute from baseline
    full_stockout = mask & (df['order_qty_l'] == 0)
    df.loc[full_stockout, 'true_demand'] = (
        df.loc[full_stockout, 'baseline_demand'] * 1.25  # uplift assumption
    )
    
    return df
```

---

### 4.2 Temporal Features

```python
def add_temporal_features(df):
    df['month']          = df['date'].dt.month
    df['month_sin']      = np.sin(2 * np.pi * df['month'] / 12)  # cyclical
    df['month_cos']      = np.cos(2 * np.pi * df['month'] / 12)
    df['day_of_week']    = df['date'].dt.dayofweek
    df['is_weekend']     = df['day_of_week'].isin([5, 6]).astype(int)
    df['quarter']        = df['date'].dt.quarter
    df['week_of_year']   = df['date'].dt.isocalendar().week
    return df
```

---

### 4.3 Weather Features

```python
def add_weather_features(df):
    # Heat index buckets (ice cream demand is non-linear above 32°C)
    df['heat_bucket'] = pd.cut(df['temp_max_c'],
        bins=[0, 25, 30, 33, 36, 38, 50],
        labels=['cold', 'mild', 'warm', 'hot', 'very_hot', 'extreme']
    )
    df['heat_hot_flag']    = (df['temp_max_c'] >= 33).astype(int)
    df['heat_extreme_flag']= (df['temp_max_c'] >= 38).astype(int)
    
    # Lag effects: demand spikes 2-3 days after heat wave starts
    df['temp_lag1'] = df.groupby('city')['temp_max_c'].shift(1)
    df['temp_lag2'] = df.groupby('city')['temp_max_c'].shift(2)
    df['temp_rolling7'] = df.groupby('city')['temp_max_c'].transform(
        lambda x: x.rolling(7).mean()
    )
    
    # Monsoon interaction: rain suppresses Parlor, lifts E-Commerce
    df['rain_heavy'] = (df['rainfall_mm'] > 20).astype(int)
    df['monsoon_x_channel_parlor']    = df['monsoon_active'] * (df['channel'] == 'Parlor')
    df['monsoon_x_channel_ecommerce'] = df['monsoon_active'] * (df['channel'] == 'E-Commerce')
    
    return df
```

---

### 4.4 Festival & Event Features

```python
def add_festival_features(df):
    # Proximity-to-festival (demand rises 5–7 days before big festivals)
    df['pre_festival']  = (df['days_to_festival'] <= 7).astype(int)
    df['post_festival'] = (df['days_after_festival'] <= 3).astype(int)
    
    # School holiday effects
    df['summer_vacation_week'] = (
        (df['summer_vacation'] == 1) & 
        (df['date'].dt.month.isin([4, 5]))
    ).astype(int)
    
    # IPL multiplier (only meaningful for HoReCa and E-Commerce)
    df['ipl_horeca'] = df['ipl_match_day'] * (df['channel'] == 'HoReCa')
    
    return df
```

---

### 4.5 Promo Adjustment (Remove Promo Spike for Baseline)

```python
def remove_promo_effects(df):
    """
    Deseasonalize promo-lifted demand to find the true baseline.
    Store promo_lift_factor separately — add back in forecast with planned promos.
    """
    promo_avg    = df[df['promo_flag']==1]['true_demand'].mean()
    non_promo_avg= df[df['promo_flag']==0]['true_demand'].mean()
    lift_factor  = promo_avg / non_promo_avg  # e.g. 1.28 = 28% lift
    
    df['demand_baseline'] = df['true_demand'].copy()
    df.loc[df['promo_flag']==1, 'demand_baseline'] = (
        df.loc[df['promo_flag']==1, 'true_demand'] / lift_factor
    )
    return df, lift_factor
```

---

## 5. Model Selection & Training

### 5.1 Why Two Models?

| Model | Strength | Weakness |
|---|---|---|
| **Facebook Prophet** | Captures trend + annual/weekly seasonality automatically. Handles missing data. Easy to add holidays. | Poor at incorporating many external regressors (weather, competitors). |
| **LightGBM** | Excellent at learning complex interactions between features (weather × festival × channel). Fast training. | Doesn't natively handle temporal structure; needs manual lag features. |
| **Ensemble (60% Prophet + 40% LightGBM)** | Best of both worlds: structural seasonality + external driver effects | Needs more tuning; harder to explain to stakeholders |

---

### 5.2 Prophet Model

```python
from prophet import Prophet
import pandas as pd

def train_prophet_model(df_sku_channel, future_periods=180):
    """
    Train Prophet for one (sku, channel, city) triplet.
    """
    # Prophet requires 'ds' (date) and 'y' (target)
    prophet_df = df_sku_channel.rename(columns={
        'date': 'ds', 
        'demand_baseline': 'y'
    })[['ds', 'y']]
    
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode='multiplicative',   # ice cream seasonality is multiplicative
        changepoint_prior_scale=0.1,         # conservative trend changes
        seasonality_prior_scale=10,
        interval_width=0.80,                 # 80% confidence interval
    )
    
    # Add Indian holidays as special events
    indian_holidays = pd.DataFrame({
        'holiday': ['Diwali', 'Holi', 'Navratri', 'Eid', 'Christmas',
                    'Summer_Vacation_Start', 'Summer_Vacation_End'],
        'ds': pd.to_datetime([...]),  # actual dates per year
        'lower_window': [-5, -3, -3, -2, -3, 0, 0],
        'upper_window': [ 2,  2,  5,  2,  2, 40, 3],
    })
    model.add_country_holidays(country_name='IN')
    
    # Add temperature as regressor
    model.add_regressor('temp_max_c', mode='multiplicative')
    model.add_regressor('rain_heavy')
    model.add_regressor('school_holiday')
    
    model.fit(prophet_df)
    
    future = model.make_future_dataframe(periods=future_periods, freq='D')
    # Add regressor values for future (from weather forecast API)
    future = merge_future_regressors(future)
    
    forecast = model.predict(future)
    return model, forecast
```

---

### 5.3 LightGBM Model

```python
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit

FEATURES = [
    # Temporal
    'month', 'month_sin', 'month_cos', 'week_of_year', 'is_weekend',
    # Lags (demand from previous months)
    'demand_lag1m', 'demand_lag2m', 'demand_lag3m', 'demand_lag12m',
    # Rolling stats
    'demand_rolling3m_mean', 'demand_rolling3m_std',
    # Weather
    'temp_max_c', 'temp_lag1', 'temp_rolling7', 'heat_hot_flag',
    'rain_heavy', 'humidity_pct', 'heatwave_flag', 'monsoon_active',
    # Calendar
    'pre_festival', 'post_festival', 'summer_vacation_week',
    'school_holiday', 'long_weekend', 'ipl_horeca',
    # Channel-specific
    'shelf_facings',         # Retail only
    'outlet_age_months',     # Parlor only  
    'hotel_occupancy_pct',   # HoReCa only
    'competitor_price_index',# E-Commerce only
    'app_rank',              # E-Commerce only
    # Promo
    'promo_flag', 'promo_discount_pct',
]

def train_lgbm_model(df, features=FEATURES):
    # Create monthly aggregates (or keep daily and aggregate forecast)
    df_monthly = df.groupby(['year_month', 'sku', 'channel', 'city']).agg(
        demand=('demand_baseline', 'sum'),
        **{f: (f, 'mean') for f in features if f in df.columns}
    ).reset_index()
    
    X = df_monthly[features]
    y = df_monthly['demand']
    
    # Time-series cross validation — always use past to predict future
    tscv = TimeSeriesSplit(n_splits=6, gap=1)
    
    params = {
        'objective': 'regression_l1',   # MAE loss (robust to outliers)
        'metric': 'mape',
        'learning_rate': 0.05,
        'num_leaves': 31,
        'min_data_in_leaf': 10,
        'feature_fraction': 0.8,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1,
    }
    
    model = lgb.train(
        params, 
        lgb.Dataset(X, y),
        num_boost_round=300,
        valid_sets=[lgb.Dataset(X_val, y_val) for X_train, X_val, y_train, y_val 
                    in [(X.iloc[ti], X.iloc[vi], y.iloc[ti], y.iloc[vi]) 
                        for ti, vi in tscv.split(X)]],
        callbacks=[lgb.early_stopping(30), lgb.log_evaluation(50)],
    )
    return model
```

---

### 5.4 Ensemble Combination

```python
def ensemble_forecast(prophet_forecast, lgbm_forecast, alpha=0.60):
    """
    Weighted average: alpha × Prophet + (1-alpha) × LightGBM
    Default alpha=0.60 — Prophet given more weight for seasonal structure.
    Tune alpha on validation set using MAPE minimization.
    """
    final = alpha * prophet_forecast['yhat'] + (1 - alpha) * lgbm_forecast
    ci_lower = prophet_forecast['yhat_lower'] * 0.9   # widen slightly for ensemble
    ci_upper = prophet_forecast['yhat_upper'] * 1.1
    return final, ci_lower, ci_upper
```

---

## 6. Channel-Wise Forecasting

### 6.1 Architecture: Hierarchical Forecasting

Ice cream demand has a natural hierarchy. We forecast at the bottom level and aggregate up:

```
Total Demand
├── Parlor Channel
│   ├── Vanilla
│   │   ├── Bangalore
│   │   ├── Hyderabad
│   │   ├── Chennai
│   │   └── Pune
│   ├── Caramel
│   ├── Mint
│   └── Chocolate
├── Retail Channel
│   └── [same SKU × City structure]
├── HoReCa Channel
│   └── ...
└── E-Commerce Channel
    ├── Swiggy
    ├── Blinkit
    └── Zomato
```

**Method: Bottom-Up Reconciliation**  
Train individual models at `(SKU, Channel, City)` level → sum forecasts up to get `(SKU, Channel)` → sum further to get total. This is more accurate than top-down splitting because each channel has distinct drivers.

---

### 6.2 Channel-Specific Feature Sets

Each channel gets its own model with a tailored feature set:

#### Parlor Channel Model
```python
PARLOR_FEATURES = [
    # Strong drivers
    'temp_max_c', 'heat_hot_flag',          # Hot weather → more walk-ins
    'school_holiday', 'summer_vacation_week',# Kids out → more visits
    'is_weekend', 'long_weekend',            # Weekend outings
    'rainfall_mm', 'rain_heavy',             # Rain suppresses footfall (-25%)
    # Outlet-level features
    'outlet_age_months',                     # Ramp-up curve (new outlets)
    'daily_footfall_lag1',                   # Yesterday's footfall predicts today
    'location_type_mall',                    # Mall outlets have higher baseline
    'nearby_competitor_opened',              # Competitive impact
    # Standard
    'month_sin', 'month_cos', 'pre_festival', 'promo_flag',
]
```

#### Retail Channel Model
```python
RETAIL_FEATURES = [
    # Shelf placement is the biggest driver after temperature
    'shelf_facings',
    'shelf_position_eye_level',
    'retailer_promo_flag',                   # Store-level promotions
    'competitor_price_index',                # Price parity vs Amul in stores
    # Weather (moderate effect; people buy at store anyway)
    'temp_max_c', 'month_sin', 'month_cos',
    'pre_festival', 'post_festival',
    'promo_flag', 'promo_discount_pct',
    # Distribution
    'store_count_active',                    # Newly listed stores add baseline
]
```

#### HoReCa Channel Model
```python
HORECA_FEATURES = [
    'hotel_occupancy_pct',                   # #1 driver
    'wedding_season_flag',                   # Jun–Jul, Nov–Dec spike
    'ipl_match_day', 'ipl_final',            # Match day orders
    'contract_vol_l',                        # Known fixed-volume accounts
    # Seasonality (HoReCa is less temperature-sensitive than Parlor)
    'month_sin', 'month_cos', 'is_weekend',
    'pre_festival',
]
```

#### E-Commerce Channel Model
```python
ECOMM_FEATURES = [
    'rain_heavy', 'monsoon_active',          # Rain → delivery orders spike
    'app_rank',                              # Platform visibility is critical
    'featured_flag',                         # 30-50% uplift when featured
    'pincode_coverage',                      # Distribution expansion
    'competitor_price_index',                # High price sensitivity
    'platform_stockout_pct',                 # Self-fulfilling: OOS kills rank
    'temp_max_c',                            # Hot weather also drives delivery
    'is_weekend', 'school_holiday',
    'promo_flag',
]
```

---

### 6.3 Monsoon Channel Crossover Effect

A critical interaction: monsoon suppresses Parlor but lifts E-Commerce. Model this explicitly:

```python
def add_channel_crossover_features(df):
    """
    During monsoon:
    - Parlor footfall drops ~25% (people avoid going out)
    - E-Commerce orders increase ~30% (order from home)
    """
    df['monsoon_parlor_suppression'] = (
        df['monsoon_active'] * (df['channel'] == 'Parlor') * -0.25
    )
    df['monsoon_ecomm_uplift'] = (
        df['monsoon_active'] * (df['channel'] == 'E-Commerce') * 0.30
    )
    return df
```

---

### 6.4 Training One Model Per (SKU, Channel, City)

```python
from itertools import product

SKUS     = ['Vanilla', 'Caramel', 'Mint', 'Chocolate']
CHANNELS = ['Parlor', 'Retail', 'HoReCa', 'E-Commerce']
CITIES   = ['Bangalore', 'Hyderabad', 'Chennai', 'Pune']

CHANNEL_FEATURES = {
    'Parlor':     PARLOR_FEATURES,
    'Retail':     RETAIL_FEATURES,
    'HoReCa':     HORECA_FEATURES,
    'E-Commerce': ECOMM_FEATURES,
}

models = {}

for sku, channel, city in product(SKUS, CHANNELS, CITIES):
    subset = df[
        (df['sku'] == sku) & 
        (df['channel'] == channel) & 
        (df['city'] == city)
    ]
    
    if len(subset) < 365:  # need at least 1 year of data
        continue
    
    features = CHANNEL_FEATURES[channel]
    prophet_model, prophet_fc = train_prophet_model(subset)
    lgbm_model = train_lgbm_model(subset, features)
    lgbm_fc = lgbm_model.predict(future_X)
    
    final_fc, ci_lower, ci_upper = ensemble_forecast(prophet_fc, lgbm_fc)
    
    models[(sku, channel, city)] = {
        'prophet': prophet_model,
        'lgbm':    lgbm_model,
        'alpha':   0.60,  # tunable per segment
    }

# Total: 4 SKUs × 4 Channels × 4 Cities = 64 models
```

---

## 7. Confidence Intervals

The GSI app shows confidence bands (wider for longer-horizon forecasts). Compute these from the ensemble:

```python
def compute_confidence_intervals(forecast, horizon_months):
    """
    CI widens with forecast horizon:
    - Months 1–2:  ±8%
    - Months 3–4:  ±13%
    - Months 5–6:  ±20%
    """
    base_uncertainty = {1: 0.08, 2: 0.08, 3: 0.13, 4: 0.13, 5: 0.20, 6: 0.20}
    sigma = base_uncertainty.get(horizon_months, 0.20)
    
    return {
        'lower': forecast * (1 - sigma),
        'upper': forecast * (1 + sigma),
        'p10':   forecast * (1 - sigma * 1.5),   # 90% CI
        'p90':   forecast * (1 + sigma * 1.5),
    }
```

---

## 8. Model Evaluation

### 8.1 Metrics

| Metric | Formula | Target Threshold | When to Use |
|---|---|---|---|
| **MAPE** | mean(|actual − forecast| / actual) × 100 | < 15% for 1–3m; < 25% for 4–6m | Primary metric |
| **RMSE** | sqrt(mean((actual − forecast)²)) | — | Penalizes large errors more |
| **Bias** | mean(forecast − actual) | Close to 0 | Detect systematic over/under-forecast |
| **Forecast vs Actual Hit Rate** | % months where actual falls within CI | > 80% | Confidence interval accuracy |

---

### 8.2 Backtesting Protocol

Always use **walk-forward validation** — never random splits on time series:

```python
def walk_forward_backtest(df, model_fn, n_test_months=6):
    """
    Train on all data up to month T, predict T+1 through T+6.
    Move forward 1 month at a time. Never peek at future data.
    """
    results = []
    months = sorted(df['year_month'].unique())
    
    for i in range(len(months) - n_test_months - 12):  # need 12m training min
        train_months = months[:i + 12]
        test_months  = months[i + 12 : i + 12 + n_test_months]
        
        train = df[df['year_month'].isin(train_months)]
        test  = df[df['year_month'].isin(test_months)]
        
        model = model_fn(train)
        preds = model.predict(test)
        
        mape = (abs(preds - test['demand']) / test['demand']).mean() * 100
        results.append({'end_train': train_months[-1], 'mape': mape})
    
    return pd.DataFrame(results)
```

---

### 8.3 Evaluation by Channel

Run separate MAPE scores per channel to identify where the model is weakest:

| Channel | Expected MAPE | Hardest to Forecast Because |
|---|---|---|
| Parlor | 10–15% | Footfall highly weather-dependent; outlet-level variance |
| Retail | 8–12% | More stable; shelf space is controllable |
| HoReCa | 12–18% | Contract volumes predictable; catering events lumpy |
| E-Commerce | 15–25% | Platform algorithm changes affect rank unpredictably |

---

## 9. Deployment & Integration with GSI

### 9.1 Forecast Serving API

```python
# FastAPI endpoint — called by GSI React frontend
from fastapi import FastAPI
app = FastAPI()

@app.get("/forecast")
def get_forecast(
    sku: str,          # e.g. "Vanilla"
    channel: str,      # e.g. "Parlor"
    city: str,         # e.g. "Bangalore"
    months: int = 6,   # 1–6
):
    model_key = (sku, channel, city)
    model     = load_model(model_key)      # load from model registry
    features  = build_future_features(months)
    
    point_forecast = model.predict(features)
    ci = compute_confidence_intervals(point_forecast, months)
    
    return {
        "sku": sku,
        "channel": channel,
        "city": city,
        "forecast": [
            {
                "month": m,
                "demand_l": round(point_forecast[i], 1),
                "lower_l":  round(ci['lower'][i], 1),
                "upper_l":  round(ci['upper'][i], 1),
            }
            for i, m in enumerate(future_months)
        ],
        "model_version": "v2.1",
        "last_trained":  "2026-04-01",
    }
```

---

### 9.2 Replacing Sample Data in the GSI React App

Currently `DemandForecast12Month.js` uses `MONTHLY_DEMAND` from `realisticSampleData.js`. Replace with live API calls:

```javascript
// src/hooks/useForecast.js
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_FORECAST_API_URL;

export const useForecast = (sku, selectedChannels, forecastMonths) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const promises = selectedChannels.map(channel =>
        fetch(`${API_BASE}/forecast?sku=${sku}&channel=${channel}&months=${forecastMonths}`)
          .then(r => r.json())
      );
      const results = await Promise.all(promises);
      // Merge channel results into monthly rows
      setData(mergeChannelForecasts(results));
      setLoading(false);
    };
    fetchAll();
  }, [sku, selectedChannels, forecastMonths]);

  return { data, loading };
};
```

---

## 10. Retraining & Monitoring

### 10.1 Retraining Schedule

| Trigger | Action | Frequency |
|---|---|---|
| **Scheduled** | Full retrain on new month's actuals | Monthly (1st of each month) |
| **Drift alert** | MAPE exceeds 20% for 2+ consecutive months | Ad-hoc |
| **Data change** | New city/channel added; promotion calendar updated | Immediate |
| **Major event** | COVID-like disruption; new competitor enters market | Immediate + human review |

---

### 10.2 Model Monitoring Dashboard (Add to GSI)

Track these metrics in a `Model Health` screen (future feature):

```
┌─────────────────────────────────────────────────────────┐
│  FORECAST ACCURACY — Rolling 6 months                   │
│  Vanilla / Parlor / Bangalore:  MAPE = 11.2%  ✅        │
│  Caramel / E-Commerce / Chennai: MAPE = 22.8% ⚠️        │
│  Mint / HoReCa / Hyderabad:     MAPE = 18.5%  ✅        │
│                                                         │
│  Bias: +3.2% (slight over-forecast) — review in Q3     │
│  Last retrained: 1 Apr 2026                             │
│  Next scheduled retrain: 1 May 2026                     │
└─────────────────────────────────────────────────────────┘
```

---

### 10.3 Planner Override Mechanism

Always give planners the ability to adjust ML forecasts:

```javascript
// Allow planners to add manual adjustments in GSI
// e.g., "We know Jun 2026 has a large corporate event — add 200L"
const [overrides, setOverrides] = useState({});

const adjustedForecast = monthlyRows.map(row => ({
  ...row,
  demand: row.demand + (overrides[row.label] || 0),
}));
```

Store overrides in DB with `created_by`, `reason`, and `approved_by` fields for audit trail.

---

## Summary: Implementation Sequence

| Phase | Duration | Deliverable |
|---|---|---|
| **Phase 1** — Data Infrastructure | 4 weeks | Airflow DAGs for ERP, Weather, E-Comm ingestion; BigQuery schema live |
| **Phase 2** — Feature Engineering | 2 weeks | Feature store with all 40+ features; stockout correction applied |
| **Phase 3** — Model Training (Prophet + LightGBM) | 3 weeks | 64 trained models (4 SKU × 4 Channel × 4 City); backtested MAPE reported |
| **Phase 4** — Forecast API | 2 weeks | FastAPI service deployed; `/forecast` endpoint live |
| **Phase 5** — GSI Integration | 2 weeks | React frontend calling live API; sample data replaced |
| **Phase 6** — Monitoring & Retrain Pipeline | 2 weeks | Monthly retrain DAG; accuracy dashboard in GSI |
| **Total** | **~15 weeks** | Production ML forecasting replacing sample data |

---

*Document version: 1.0 · April 2026 · Graviss Foods GSI Platform*
