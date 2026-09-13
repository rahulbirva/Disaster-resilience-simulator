const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Graph = require('./graphEngine');
const { ERNAKULAM_DATA, KERALA_FLOODS_2018 } = require('./sampleData');
const { initializeSampleData } = require('./initData');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, 'resilience.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Saved Plans table
    db.run(`
      CREATE TABLE IF NOT EXISTS saved_plans (
        id TEXT PRIMARY KEY,
        region TEXT NOT NULL,
        scenario_type TEXT NOT NULL,
        disaster_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        roads_failed INTEGER,
        facilities_cut_off INTEGER,
        population_isolated INTEGER,
        avg_response_time_min REAL,
        recommended_action TEXT,
        response_time_after_min REAL,
        population_isolated_after INTEGER,
        status TEXT DEFAULT 'Not Started',
        simulation_data TEXT
      )
    `);

    // Network graph cache table
    db.run(`
      CREATE TABLE IF NOT EXISTS network_graphs (
        region TEXT PRIMARY KEY,
        graph_data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Historical events table - drop and recreate to ensure fresh schema
    db.run(`DROP TABLE IF EXISTS historical_events`);
    db.run(`
      CREATE TABLE historical_events (
        event_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT NOT NULL,
        date_range TEXT,
        coordinates TEXT,
        timeline TEXT NOT NULL,
        sources_note TEXT,
        recommended_intervention TEXT,
        intervention_details TEXT
      )
    `, () => {
      // After tables created, initialize sample data
      initializeSampleData(db);
      console.log('Database schema initialized');
    });
  });
}

// Routes: Saved Plans
app.get('/api/plans', (req, res) => {
  db.all('SELECT * FROM saved_plans ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows.map(row => ({
        ...row,
        simulation_data: JSON.parse(row.simulation_data || '{}')
      })));
    }
  });
});

app.get('/api/plans/:region', (req, res) => {
  const { region } = req.params;
  db.all('SELECT * FROM saved_plans WHERE region = ? ORDER BY created_at DESC', [region], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows.map(row => ({
        ...row,
        simulation_data: JSON.parse(row.simulation_data || '{}')
      })));
    }
  });
});

app.post('/api/plans', (req, res) => {
  const { id, region, scenario_type, disaster_type, severity, predicted_impact, recommended_action, estimated_benefit, simulation_data } = req.body;
  
  db.run(
    `INSERT INTO saved_plans 
     (id, region, scenario_type, disaster_type, severity, roads_failed, facilities_cut_off, population_isolated, avg_response_time_min, recommended_action, response_time_after_min, population_isolated_after, simulation_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, region, scenario_type, disaster_type, severity,
      predicted_impact.roads_failed,
      predicted_impact.facilities_cut_off,
      predicted_impact.population_isolated,
      predicted_impact.avg_response_time_min,
      recommended_action,
      estimated_benefit.response_time_after_min,
      estimated_benefit.population_isolated_after,
      JSON.stringify(simulation_data || {})
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, created_at: new Date().toISOString() });
      }
    }
  );
});

app.patch('/api/plans/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE saved_plans SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Routes: Historical Events
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM historical_events', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows.map(row => ({
        ...row,
        timeline: JSON.parse(row.timeline || '[]'),
        coordinates: JSON.parse(row.coordinates || '{}'),
        intervention_details: row.intervention_details ? JSON.parse(row.intervention_details) : null
      })));
    }
  });
});

app.get('/api/events/:event_id', (req, res) => {
  const { event_id } = req.params;
  db.get('SELECT * FROM historical_events WHERE event_id = ?', [event_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json({
        ...row,
        timeline: JSON.parse(row.timeline || '[]'),
        coordinates: JSON.parse(row.coordinates || '{}'),
        intervention_details: row.intervention_details ? JSON.parse(row.intervention_details) : null
      });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  });
});

app.post('/api/events', (req, res) => {
  const { event_id, name, region, date_range, coordinates, timeline, sources_note } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO historical_events 
     (event_id, name, region, date_range, coordinates, timeline, sources_note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [event_id, name, region, date_range, JSON.stringify(coordinates), JSON.stringify(timeline), sources_note],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ event_id });
      }
    }
  );
});

// Routes: Network Graphs
app.get('/api/network/:region', (req, res) => {
  const { region } = req.params;
  db.get('SELECT graph_data FROM network_graphs WHERE region = ?', [region], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(JSON.parse(row.graph_data));
    } else {
      res.status(404).json({ error: 'Network not found' });
    }
  });
});

app.post('/api/network/:region', (req, res) => {
  const { region } = req.params;
  const graphData = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO network_graphs (region, graph_data, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [region, JSON.stringify(graphData)],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// Routes: Simulation Engine
app.post('/api/simulate', (req, res) => {
  const { scenario_type, region, failed_edges = [], severity = 'Moderate' } = req.body;

  // Build graph from stored network data
  db.get('SELECT graph_data FROM network_graphs WHERE region = ?', [region], (err, row) => {
    if (err || !row) {
      return res.status(500).json({ error: 'Network data not found' });
    }

    try {
      const networkData = JSON.parse(row.graph_data);
      const graph = new Graph();

      // Reconstruct graph
      for (const node of networkData.nodes) {
        graph.addNode(node.id, node);
      }
      for (const edge of networkData.edges) {
        graph.addEdge(edge.id, edge.from, edge.to, edge);
      }

      // Run cascading failure simulation
      const results = graph.simulateCascadingFailure(failed_edges, 150);

      // Get recommendation: find top critical road to reinforce
      const topCritical = graph.getTopCriticalNodes(3);
      const recommendedRoad = topCritical.length > 0 ? topCritical[0] : null;

      // Simulate with recommendation applied
      let benefitResults = { ...results };
      if (recommendedRoad && failed_edges.includes(recommendedRoad.node_id)) {
        const roadWithoutCritical = failed_edges.filter(r => r !== recommendedRoad.node_id);
        benefitResults = graph.simulateCascadingFailure(roadWithoutCritical, 150);
      }

      res.json({
        scenario_type,
        region,
        initial_failed_edges: failed_edges,
        simulation: results,
        recommendation: {
          action: `Reinforce ${networkData.edges.find(e => e.id === recommendedRoad?.node_id)?.label || 'critical road'}`,
          criticality_score: recommendedRoad?.centrality_score || 0
        },
        benefit_with_recommendation: benefitResults,
        impact_reduction: {
          roads_failed: results.roads_failed - benefitResults.roads_failed,
          population_isolated: results.population_isolated - benefitResults.population_isolated,
          avg_response_time: results.avg_response_time_min - benefitResults.avg_response_time_min
        }
      });
    } catch (parseErr) {
      res.status(500).json({ error: 'Error processing network data' });
    }
  });
});

// Routes: Historical Replay
app.get('/api/replay/:event_id', (req, res) => {
  const { event_id } = req.params;
  const { timestamp } = req.query;

  db.get('SELECT * FROM historical_events WHERE event_id = ?', [event_id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Event not found' });
    }

    try {
      const event = {
        ...row,
        timeline: JSON.parse(row.timeline),
        coordinates: JSON.parse(row.coordinates)
      };

      // Filter timeline up to requested timestamp
      const timelineUpToPoint = timestamp 
        ? event.timeline.filter(entry => new Date(entry.timestamp) <= new Date(timestamp))
        : event.timeline;

      res.json({
        event: event.name,
        region: event.region,
        currentTimeline: timelineUpToPoint,
        failedRoads: timelineUpToPoint.flatMap(e => e.affected_roads),
        failedFacilities: timelineUpToPoint.flatMap(e => e.affected_facilities)
      });
    } catch (parseErr) {
      res.status(500).json({ error: 'Error processing event data' });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Resilience backend server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database closed');
    }
    process.exit(0);
  });
});
