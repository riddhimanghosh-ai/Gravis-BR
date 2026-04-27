import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';

// Import screen components
import DemandForecast12Month from './screens/DemandForecast12Month';
import FGInventory from './screens/FGInventory';
import ManufacturingExecutionPlanning from './screens/ManufacturingExecutionPlanning';
import ProductionDecision from './screens/ProductionDecision';
import WeeklyProductionPlan from './screens/WeeklyProductionPlan';
import ShopFloor from './screens/ShopFloor';
import LineSimulator from './screens/LineSimulator';
import LinesConfiguration from './screens/LinesConfiguration';
import ColdChainExpiryManagement from './screens/ColdChainExpiryManagement';
import RawMaterials from './screens/RawMaterials';
import ScoopBot from './components/ScoopBot';

// ── Accordion nav groups ─────────────────────────────────────
const FORECASTING_ITEMS = [
  { id: 'forecast', label: '📈 Demand Forecast',  path: '/forecast-12month' },
  { id: 'stock',    label: '📦 FG Inventory',     path: '/fg-inventory' },
];

const PRODUCTION_ITEMS = [
  { id: 'shopfloor', label: '⚡ Shop Floor (Live)',       path: '/shop-floor' },
  { id: 'mep',       label: '🏭 Manufacturing Execution', path: '/manufacturing-execution-planning' },
  { id: 'decision',  label: '🎯 Production Decision',    path: '/production-decision' },
  { id: 'weekly',    label: '📅 Weekly Production Plan', path: '/weekly-production-plan' },
  { id: 'lines',     label: '⚙️ Lines Configuration',    path: '/lines-config' },
];

const FUTURE_ITEMS = [
  { id: 'coldchain', label: '❄️ Cold Chain & Expiry',  path: '/cold-chain-expiry' },
  { id: 'rawmat',    label: '🧪 Raw Materials',        path: '/raw-materials' },
  { id: 'simulator', label: '🔧 Line Simulator',       path: '/line-simulator' },
];

// ── Accordion nav section ────────────────────────────────────
function AccordionSection({ label, icon, items, defaultOpen }) {
  const location = useLocation();
  const isActive = items.some(i => location.pathname === i.path);
  const [open, setOpen] = useState(defaultOpen || isActive);

  return (
    <div className="accordion-section">
      <button
        className={`accordion-header${isActive ? ' accordion-header-active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="accordion-icon">{icon}</span>
        <span className="accordion-label">{label}</span>
        <span className={`accordion-chevron${open ? ' open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="accordion-body">
          {items.map(item => (
            <NavLink key={item.id} item={item} level={1} />
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({ item, level = 0 }) {
  const location = useLocation();
  const active = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      className={`menu-item level-${level}${active ? ' menu-item-active' : ''}`}
    >
      <span className="menu-label">{item.label}</span>
    </Link>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app-container">
        {/* HEADER */}
        <header className="app-header">
          <div className="header-content">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1 className="app-title">🍦 Graviss Supply Intelligence</h1>
            <div className="header-right">
              <span className="header-badge">Apr 2026</span>
              <span className="header-icon">🔔</span>
              <span className="header-icon">👤</span>
            </div>
          </div>
        </header>

        <div className="app-body">
          {/* SIDEBAR */}
          <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <nav className="app-menu">

              {/* Forecasting accordion */}
              <AccordionSection
                label="Forecasting"
                icon="📈"
                items={FORECASTING_ITEMS}
                defaultOpen={true}
              />

              {/* Production Plan accordion */}
              <AccordionSection
                label="Production Plan"
                icon="🏭"
                items={PRODUCTION_ITEMS}
                defaultOpen={true}
              />

              {/* FUTURE section */}
              <div className="menu-section-divider" style={{ marginTop: '8px' }}>
                <span className="menu-section-label">FUTURE FEATURES</span>
              </div>
              {FUTURE_ITEMS.map(item => (
                <Link key={item.id} to={item.path} className="menu-item level-0 menu-item-future">
                  <span className="menu-label">{item.label}</span>
                  <span className="coming-soon-badge">Soon</span>
                </Link>
              ))}

            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="app-main">
            <Routes>
              {/* Redirect root to first real screen */}
              <Route path="/"                                element={<Navigate to="/forecast-12month" replace />} />
              <Route path="/forecast-12month"               element={<DemandForecast12Month />} />
              <Route path="/fg-inventory"                   element={<FGInventory />} />
              <Route path="/manufacturing-execution-planning" element={<ManufacturingExecutionPlanning />} />
              <Route path="/production-decision"            element={<ProductionDecision />} />
              <Route path="/weekly-production-plan"         element={<WeeklyProductionPlan />} />
              <Route path="/shop-floor"                     element={<ShopFloor />} />
              <Route path="/line-simulator"                 element={<LineSimulator />} />
              <Route path="/lines-config"                   element={<LinesConfiguration />} />
              <Route path="/raw-materials"                  element={<RawMaterials />} />
              <Route path="/cold-chain-expiry"              element={<ColdChainExpiryManagement />} />
            </Routes>
          </main>
        </div>

        {/* ── ScoopBot — global AI assistant ─────────────── */}
        <ScoopBot />
      </div>
    </Router>
  );
}

export default App;
