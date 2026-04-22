import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import screen components
import Dashboard from './screens/Dashboard';
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

const PLAN_ITEMS = [
  { id: 'forecast',  label: '📈 Demand Forecast',         path: '/forecast-12month' },
  { id: 'stock',     label: '📦 FG Inventory',            path: '/fg-inventory' },
  { id: 'rawmat',    label: '🧪 Raw Materials',           path: '/raw-materials' },
  { id: 'mep',       label: '🏭 Manufacturing Execution',  path: '/manufacturing-execution-planning' },
  { id: 'decision',  label: '🎯 Production Decision',     path: '/production-decision' },
  { id: 'weekly',    label: '📅 Weekly Production Plan',  path: '/weekly-production-plan' },
];

const EXECUTE_ITEMS = [
  { id: 'shopfloor', label: '⚡ Shop Floor (Live)',        path: '/shop-floor' },
  { id: 'simulator', label: '🔧 Line Simulator',          path: '/line-simulator' },
  { id: 'lines',     label: '⚙️ Lines Configuration',     path: '/lines-config' },
];

const FUTURE_ITEMS = [
  { id: 'coldchain', label: '❄️ Cold Chain & Expiry',     path: '/cold-chain-expiry' },
];

function NavLink({ item }) {
  const location = useLocation();
  const active = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      className={`menu-item level-0${active ? ' menu-item-active' : ''}`}
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
              {/* Dashboard — always first */}
              <NavLink item={{ id: 'dashboard', label: '📊 Dashboard', path: '/' }} />

              {/* PLAN section */}
              <div className="menu-section-divider">
                <span className="menu-section-label">PLAN</span>
              </div>
              {PLAN_ITEMS.map(item => <NavLink key={item.id} item={item} />)}

              {/* EXECUTE & TUNE section */}
              <div className="menu-section-divider">
                <span className="menu-section-label">EXECUTE &amp; TUNE</span>
              </div>
              {EXECUTE_ITEMS.map(item => <NavLink key={item.id} item={item} />)}

              {/* FUTURE section */}
              <div className="menu-section-divider">
                <span className="menu-section-label">FUTURE FEATURES</span>
              </div>
              {FUTURE_ITEMS.map(item => (
                <Link key={item.id} to={item.path} className="menu-item level-0 menu-item-future">
                  <span className="menu-label">{item.label}</span>
                  <span className="coming-soon-badge">Coming Soon</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="app-main">
            <Routes>
              <Route path="/"                                element={<Dashboard />} />
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
      </div>
    </Router>
  );
}

export default App;
