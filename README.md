# GSI Platform - Interactive Prototype

A fully functional interactive prototype of the Graviss Supply Intelligence (GSI) Platform for demand forecasting and manufacturing execution planning.

## Features

This prototype includes **10 interactive screens**:

1. **Dashboard** - KPI overview, forecast trends, production schedule, alerts
2. **Demand Forecasting Overview** - 3-6 month forecast by channel
3. **SKU Detail Forecast** - Deep dive into individual SKU demand
4. **Production Scheduling - Gantt View** - Visual production schedule with line allocation
5. **Production Scheduling - Table View** - Detailed day-by-day schedule
6. **Inventory Management** - Stock status and reorder recommendations
7. **Manufacturing Execution** - Real-time daily production tracking
8. **Scenario Builder** - What-if analysis for demand/constraint changes
9. **Production Report** - Daily/weekly performance summary
10. **Settings & Configuration** - System setup and integrations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Navigate to the prototype directory
cd gsi-prototype

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open in your browser at `http://localhost:3000`

## Project Structure

```
gsi-prototype/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   ├── index.css          # Global styles
│   ├── App.js             # Main app with routing
│   ├── App.css            # App layout styles
│   ├── screens/           # All screen components
│   │   ├── Dashboard.js
│   │   ├── DemandForecastingOverview.js
│   │   ├── SKUDetailForecast.js
│   │   ├── ProductionSchedulingGantt.js
│   │   ├── ProductionSchedulingTable.js
│   │   ├── InventoryManagement.js
│   │   ├── ManufacturingExecution.js
│   │   ├── ScenarioBuilder.js
│   │   ├── ProductionReport.js
│   │   └── SettingsConfiguration.js
│   └── styles/            # Screen-specific styles
│       └── Dashboard.css
└── package.json
```

## Technologies Used

- **React 18** - UI framework
- **React Router 6** - Navigation
- **Recharts** - Charts and visualizations
- **CSS3** - Styling

## Key Interactive Features

### Dashboard
- Real-time KPI metrics
- Forecast confidence trend chart
- Production utilization by line (bar chart)
- Channel demand distribution (pie chart)
- Production schedule highlights
- Alerts and recommendations

### Demand Forecasting
- 3-6 month forecast period selector
- Channel breakdown visualization
- SKU-level detail views
- Forecast adjustment interface
- Confidence interval tracking

### Production Planning
- Gantt-style visual scheduling
- Table-based detailed scheduling
- Production gap analysis
- Capacity utilization heatmap
- What-if scenario builder

### Inventory Management
- Stock level monitoring
- Safety stock tracking
- Automated reorder recommendations
- EOQ calculations
- Channel-level inventory breakdown

### Manufacturing Execution
- Real-time production progress tracking
- Quality metrics monitoring
- Changeover scheduling
- Alert system for issues
- Line status dashboard

### Scenario Builder
- Demand change simulation (interactive slider)
- Feasibility analysis
- Impact on line utilization
- Constraint checking
- Alternative plan generation

## Mock Data

All screens use realistic mock data representing:
- **Production Lines**: 3 lines with different capacities
- **SKUs**: Vanilla, Caramel, Mint, Chocolate ice creams
- **Channels**: Parlor (50%), Retail (35%), HoReCa (10%), E-commerce (5%)
- **Time Period**: April 21-27, 2026 (current week)
- **Demand Range**: 5,470 - 8,200 L/day

## Navigation

Use the sidebar to navigate between screens:
- Click the menu button (☰) to toggle sidebar visibility
- Click any menu item to navigate
- The search bar is ready for future implementation
- Notification and user menus are in the top navigation

## Customization

### Adding New Screens
1. Create a new component in `src/screens/`
2. Add the import in `App.js`
3. Add a route in the `<Routes>` section
4. Add menu item to the `menuItems` array

### Styling
- Global styles: `src/index.css`
- App layout: `src/App.css`
- Screen-specific: `src/styles/[ScreenName].css`

### Color Scheme
- Primary Blue: #1F77B4
- Success Green: #2CA02C
- Warning Orange: #FF7F0E
- Danger Red: #D62728
- Neutral Gray: #7F7F7F

## API Integration (Future)

This prototype uses mock data. To integrate with real APIs:

1. Replace mock data with API calls (fetch or axios)
2. Add state management (Redux, Zustand, or Context API)
3. Implement error handling and loading states
4. Add real-time WebSocket connections for live updates

## Performance Notes

- Charts are optimized with Recharts for performance
- Use React.memo() for expensive components
- Implement lazy loading for large datasets
- Consider virtualization for large tables

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design ready)

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (advanced - not recommended)
npm eject
```

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time data updates (WebSocket)
- [ ] Export to PDF/Excel
- [ ] Mobile app version
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Machine learning forecasting
- [ ] Supply chain visibility
- [ ] Distributor portal integration

## Support

For questions or issues with the prototype, refer to:
- Design specifications: `WIREFRAMES_DETAILED.md`
- System architecture: `SYSTEM_ARCHITECTURE.md`
- Implementation roadmap: `USER_JOURNEYS_AND_ROADMAP.md`
- Solution architecture: `GSI_SOLUTION_ARCHITECTURE.md`

## License

Internal Use Only - Graviss Group
