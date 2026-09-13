// Database initialization with sample data

const Graph = require('./graphEngine');
const { ERNAKULAM_DATA, KERALA_FLOODS_2018, KERALA_FLOODS_ALTERNATE_TIMELINE } = require('./sampleData');

function initializeSampleData(db) {
  // Store sample historical event with recommended intervention
  db.run(
    `INSERT OR IGNORE INTO historical_events 
     (event_id, name, region, date_range, coordinates, timeline, sources_note, recommended_intervention, intervention_details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      KERALA_FLOODS_2018.event_id,
      KERALA_FLOODS_2018.name,
      KERALA_FLOODS_2018.region,
      KERALA_FLOODS_2018.date_range,
      JSON.stringify(KERALA_FLOODS_2018.coordinates),
      JSON.stringify(KERALA_FLOODS_2018.timeline),
      KERALA_FLOODS_2018.sources_note,
      KERALA_FLOODS_ALTERNATE_TIMELINE.intervention,
      JSON.stringify(KERALA_FLOODS_ALTERNATE_TIMELINE)
    ],
    (err) => {
      if (err) {
        console.error('Error inserting historical event:', err);
      } else {
        console.log('Kerala Floods 2018 event stored in database');
      }
    }
  );

  // Create and store the network graph
  const graph = new Graph();
  
  // Add all nodes
  for (const node of ERNAKULAM_DATA.nodes) {
    graph.addNode(node.id, node);
  }

  // Add all edges
  for (const edge of ERNAKULAM_DATA.edges) {
    graph.addEdge(edge.id, edge.from, edge.to, edge);
  }

  // Calculate betweenness centrality for ranking
  const criticality = graph.betweennessCentrality();
  const topCritical = graph.getTopCriticalNodes(10);

  // Run simulation on the Kerala Floods 2018 scenario
  const floodSimulation = graph.simulateCascadingFailure(['r1', 'r2'], 150);

  // Prepare network data for storage
  const networkData = {
    region: ERNAKULAM_DATA.region,
    nodes: ERNAKULAM_DATA.nodes.map(n => ({
      ...n,
      criticality: criticality.get(n.id) || 0
    })),
    edges: ERNAKULAM_DATA.edges.map(e => ({
      ...e,
      status: 'functional'
    })),
    metadata: ERNAKULAM_DATA.metadata,
    topCriticalNodes: topCritical,
    historicalSimulation: {
      event: 'Kerala Floods 2018',
      initialFailedEdges: ['r1', 'r2'],
      simulationResults: floodSimulation
    }
  };

  // Store network graph
  db.run(
    `INSERT OR REPLACE INTO network_graphs (region, graph_data, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [ERNAKULAM_DATA.region, JSON.stringify(networkData)],
    (err) => {
      if (err) {
        console.error('Error storing network graph:', err);
      } else {
        console.log('Ernakulam network graph stored in database');
      }
    }
  );
}

module.exports = { initializeSampleData };
