# Resilience: Disaster-Aware Infrastructure Resilience Simulator

A full-stack web application that models a city's road network and critical facilities, simulates how disasters cause cascading infrastructure failures, replays real historical disasters, and lets users test hypothetical future scenarios.

**Live Demo:** http://localhost:5173/  
**Backend API:** http://localhost:5000/api

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Windows/Mac/Linux

### Installation & Running

**1. Start the Backend Server (Port 5000)**
```bash
cd backend
npm install  # (if not already done)
npm start
```

You should see:
```
Resilience backend server running on http://localhost:5000
Connected to SQLite database
Database schema initialized
Kerala Floods 2018 event stored in database
Ernakulam network graph stored in database
```

**2. Start the Frontend Dev Server (Port 5173)** (in a new terminal)
```bash
cd frontend
npm install  # (if not already done)
npm run dev
```

**3. Open in Browser**
Navigate to: **http://localhost:5173/**

---

## 🎯 Core Features

### MODE 1: Historical Disaster Replay ↩️
- **Trigger:** Select a historical event (Kerala Floods 2018)
- **Features:**
  - Timeline slider to replay events step-by-step
  - Live map updates showing road failures and facility impact
  - Cascading failure visualization
  - News-feed style event timeline

### MODE 2: "What Could Have Been Prevented" 🛡️
- **Auto-generates after historical replay**
- **Shows:**
  - Alternate timeline if top-critical road was reinforced
  - Side-by-side before/after impact comparison
  - Quantified lives saved and response time improvements

### MODE 3: Predictive "What-If" Scenario Engine ⚡
- **Test hypothetical disasters:**
  - Select disaster type (Flood, Earthquake, Bridge Collapse, Landslide)
  - Choose severity level (Minor, Moderate, Severe)
  - Pick critical road/area to fail
- **Generates:**
  - Cascading failure simulation in real-time
  - Impact metrics (roads failed, isolated population, response times)
  - Recommended intervention based on network criticality
  - Benefit analysis (lives saved if recommendation implemented)

### MODE 4: Saved Plans Library 💾
- **Save intervention plans** from Modes 2 & 3
- **Track status:** Not Started → In Progress → Completed
- **Prioritization:** Plans sorted by maximum potential impact
- **Region-specific:** View plans for current region
- **Decision support:** Quantified benefits enable resource allocation

---

## 🗺️ Map Features

**Interactive Layers:**
- 🟦 **Roads:** Color-coded (Green=Normal, Yellow=Stressed, Red=Failed)
- 🏥 **Hospitals:** Status indicators (Reachable/Cut Off)
- 🏠 **Shelters:** Relief camp locations
- 🚒 **Fire Stations:** Emergency response centers
- 👥 **Residential Areas:** Population density markers
- 📍 **Historical Events:** Clickable event pins

**Controls:**
- Zoom & pan to explore network
- Click roads for details & simulation options
- Click facilities to see status & reachability
- Timeline slider for historical replays

---

## 🧮 Core Algorithms

### Graph Engine (`backend/graphEngine.js`)
1. **Dijkstra's Shortest Path** - Find optimal routes during failures
2. **Betweenness Centrality** - Rank critical infrastructure nodes
3. **Cascading Failure Logic** - Simulate load redistribution → new failures
4. **Impact Metrics** - Calculate:
   - Population isolated
   - Average emergency response time
   - Facilities cut off from population

### Simulation Flow
1. User selects failed road(s)
2. Graph recalculates shortest paths
3. Load redistributes on remaining roads
4. Overloaded roads fail (if load > capacity threshold)
5. Process repeats until network stabilizes
6. Metrics aggregated for user display

---

## 📊 Demo Data: Ernakulam District, Kerala

**Region:** Ernakulam District (10.0°N, 76.3°E)

**Network:**
- 8 residential/intersection nodes
- 3 hospitals
- 3 shelters
- 2 fire stations
- 12 road segments connecting network

**Case Study: Kerala Floods 2018**
- Real historical event (August 8-20, 2018)
- Authentic timeline from disaster bulletins
- Reconstructed road closures and facility impacts
- Pre-computed criticality rankings

**Curated Timeline:**
```
Aug 15, 06:00 - Heavy rainfall, Periyar river danger mark
Aug 15, 11:30 - NH-49 submerged (r1 road fails)
Aug 15, 14:00 - Hospital partial power outage (cascading)
Aug 15, 16:30 - Eastern Link saturated → fails (r3)
Aug 15, 20:00 - Periyar Valley Road inundated (r4)
Aug 16, 08:00 - Partial relief via alternate routes
Aug 17, 12:00 - Water recedes; 5 roads damaged, 1 hospital offline
```

---

## 🔧 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Leaflet.js (interactive maps)
- Zustand (state management)
- Axios (HTTP client)
- Lucide Icons (UI icons)

**Backend:**
- Node.js + Express
- SQLite3 (database)
- CORS middleware
- RESTful API

**Algorithms:**
- Dijkstra's algorithm (shortest path)
- Betweenness centrality (node ranking)
- Custom cascading failure engine

---

## 📡 API Endpoints

### Network Graph
- `GET /api/network/:region` - Fetch road/facility network
- `POST /api/network/:region` - Store network graph

### Simulation
- `POST /api/simulate` - Run cascading failure simulation
  - Body: `{ scenario_type, region, failed_edges, severity }`
  - Returns: simulation results + recommendation + benefit analysis

### Historical Events
- `GET /api/events` - List all historical events
- `GET /api/events/:event_id` - Get event details
- `GET /api/replay/:event_id?timestamp=ISO` - Replay up to timestamp

### Saved Plans
- `GET /api/plans` - List all saved plans
- `GET /api/plans/:region` - Plans for region
- `POST /api/plans` - Save new plan
- `PATCH /api/plans/:id` - Update plan status

### Health
- `GET /api/health` - Backend status check

---

## 🎓 How to Use (Step-by-Step)

### 1. Explore Mode (Default)
- Map loads with Ernakulam District network
- See all roads, hospitals, shelters
- Click "Historical Replay" in mode switcher

### 2. Historical Replay
- Click on "Kerala Floods 2018" event card
- Use Play/Pause buttons and timeline slider
- Watch roads turn red as disasters unfold
- Observe cascading failures in real-time
- Read live timeline entries on side panel

### 3. Alternate Timeline (Auto-shows after replay)
- See "What Could Have Been Prevented"
- Visualize if top-critical road was reinforced
- Compare stats: lives saved, response time reduced
- Click "Save This Plan"

### 4. What-If Simulation
- Select disaster type (e.g., "Flood")
- Choose severity ("Severe")
- Pick a critical road to fail
- Click "Run Simulation"
- View impact and recommended intervention
- Save the plan

### 5. Saved Plans
- Switch to "Saved Plans" tab
- View all saved intervention plans
- Change status (Not Started → In Progress → Completed)
- Plans sorted by maximum potential impact

---

## 📂 Project Structure

```
Disaster-resilience-simulator/
├── backend/
│   ├── server.js              # Express app & routes
│   ├── graphEngine.js         # Core algorithms (Dijkstra, centrality, cascading)
│   ├── sampleData.js          # Ernakulam & Kerala Floods 2018 data
│   ├── initData.js            # Database initialization
│   ├── resilience.db          # SQLite database (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── store.ts           # Zustand state management
│   │   ├── api.ts             # API client
│   │   ├── index.css          # Tailwind + custom styles
│   │   └── components/
│   │       ├── InteractiveMap.tsx         # Leaflet map rendering
│   │       ├── ModeSwitcher.tsx           # Mode navigation
│   │       ├── HistoricalReplayPanel.tsx  # Timeline replay UI
│   │       ├── HistoricalEventsPanel.tsx  # Event selector
│   │       ├── WhatIfSimulationPanel.tsx  # Scenario builder
│   │       ├── SimulationResultsPanel.tsx # Results & save button
│   │       └── SavedPlansPanel.tsx        # Plans library
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## 🔍 Key Files Explained

| File | Purpose |
|------|---------|
| `backend/graphEngine.js` | Dijkstra, centrality, cascading logic - **core algorithm** |
| `backend/sampleData.js` | Ernakulam network + Kerala Floods timeline |
| `frontend/components/InteractiveMap.tsx` | Map rendering + status coloring |
| `frontend/store.ts` | Global app state (modes, simulation results, UI) |
| `frontend/api.ts` | All backend communication |

---

## 🛠️ Troubleshooting

**"Failed to connect to backend"**
- Ensure backend is running: `cd backend && npm start`
- Check port 5000 is not in use
- Verify no firewall blocking localhost:5000

**Map not loading**
- Check browser console for errors
- Verify Leaflet CSS loaded (inspect Network tab)
- Ensure OpenStreetMap tiles accessible

**Simulation not running**
- Select a road before clicking "Run Simulation"
- Check backend logs for errors
- Verify network graph data loaded

**No saved plans showing**
- Make sure to run a simulation first
- Click "Save This Plan" on results panel
- Plans are region-specific (check region selector)

---

## 📈 Future Enhancements

- [ ] Multi-region support (load other Indian districts)
- [ ] Natural language query parsing ("What if bridge on Road X collapses?")
- [ ] Power grid layer + cross-infrastructure dependencies
- [ ] Historical event comparison matrix
- [ ] Export plans as PDF reports
- [ ] Real-time traffic integration
- [ ] Machine learning for disaster prediction

---

## 🎯 Design Principles

✅ **Real Data:** Based on actual Kerala Floods 2018 & OpenStreetMap  
✅ **Validation:** Simulation tested against real historical outcomes  
✅ **Actionable:** Every recommendation backed by quantified impact  
✅ **Intuitive:** Visual interface requires no narration to understand  
✅ **Modular:** Easy to extend algorithms or add regions  
✅ **Fast:** Simulations run instantly for real-time feedback  

---

## 📝 License

This project was created for educational and disaster management planning purposes.

---

**Questions?** Check the backend logs (`npm start` output) or browser console for debugging info.

**Ready to run?** Start backend → Start frontend → Open http://localhost:5173/ ✨
