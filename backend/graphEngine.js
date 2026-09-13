// Graph Engine: Dijkstra's, Betweenness Centrality, Cascading Failures

class Graph {
  constructor() {
    this.nodes = new Map(); // id -> { id, type, lat, lng, population, status }
    this.edges = new Map(); // "u-v" -> { from, to, length, capacity, current_load, status }
    this.adjacency = new Map(); // id -> [{ node_id, edge_id }]
  }

  addNode(id, data) {
    this.nodes.set(id, {
      id,
      type: data.type, // 'intersection', 'hospital', 'shelter', 'fire_station'
      lat: data.lat,
      lng: data.lng,
      population: data.population || 0,
      status: 'functional' // 'functional', 'stressed', 'failed'
    });
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
    }
  }

  addEdge(id, from, to, data) {
    const edge = {
      id,
      from,
      to,
      length: data.length || 1,
      capacity: data.capacity || 100,
      current_load: data.current_load || 0,
      status: 'functional' // 'functional', 'stressed', 'failed'
    };
    this.edges.set(id, edge);
    this.adjacency.get(from).push({ node_id: to, edge_id: id });
    this.adjacency.get(to).push({ node_id: from, edge_id: id });
  }

  getNeighbors(node_id) {
    return this.adjacency.get(node_id) || [];
  }

  // Dijkstra's shortest path algorithm
  dijkstra(start, end, failed_edges = new Set()) {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();

    for (const node_id of this.nodes.keys()) {
      distances.set(node_id, Infinity);
      unvisited.add(node_id);
    }
    distances.set(start, 0);

    while (unvisited.size > 0) {
      let current = null;
      let min_dist = Infinity;
      for (const node_id of unvisited) {
        if (distances.get(node_id) < min_dist) {
          min_dist = distances.get(node_id);
          current = node_id;
        }
      }

      if (current === null || distances.get(current) === Infinity) break;
      if (current === end) break;

      unvisited.delete(current);

      for (const { node_id: neighbor, edge_id } of this.getNeighbors(current)) {
        if (failed_edges.has(edge_id)) continue;
        if (!unvisited.has(neighbor)) continue;

        const edge = this.edges.get(edge_id);
        const alt = distances.get(current) + edge.length;

        if (alt < distances.get(neighbor)) {
          distances.set(neighbor, alt);
          previous.set(neighbor, { node: current, edge: edge_id });
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = end;
    while (previous.has(current)) {
      const { node, edge } = previous.get(current);
      path.unshift({ node: current, edge });
      current = node;
    }
    if (current === start) {
      path.unshift({ node: start, edge: null });
    }

    return path.length > 1 ? { path, distance: distances.get(end) } : null;
  }

  // Betweenness centrality: rank nodes by importance
  betweennessCentrality() {
    const centrality = new Map();
    for (const node_id of this.nodes.keys()) {
      centrality.set(node_id, 0);
    }

    const nodes_list = Array.from(this.nodes.keys());

    for (let s = 0; s < nodes_list.length; s++) {
      for (let t = s + 1; t < nodes_list.length; t++) {
        const start = nodes_list[s];
        const end = nodes_list[t];
        const result = this.dijkstra(start, end);
        
        if (result) {
          for (let i = 1; i < result.path.length - 1; i++) {
            const node = result.path[i].node;
            centrality.set(node, (centrality.get(node) || 0) + 1);
          }
        }
      }
    }

    return centrality;
  }

  // Find top critical nodes
  getTopCriticalNodes(k = 5) {
    const centrality = this.betweennessCentrality();
    const sorted = Array.from(centrality.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, k);
    return sorted.map(([node_id, score]) => ({ node_id, centrality_score: score }));
  }

  // Cascading failure simulation with rerouting
  simulateCascadingFailure(initial_failed_edges = [], capacity_threshold = 150) {
    const failed_edges = new Set(initial_failed_edges);
    const failed_nodes = new Set();
    const edge_loads = new Map();
    let iterations = 0;
    const max_iterations = 10;

    // Initialize edge loads
    for (const [edge_id, edge] of this.edges) {
      edge_loads.set(edge_id, edge.current_load);
    }

    // Run cascading simulation
    while (iterations < max_iterations) {
      let new_failures = false;

      // Recalculate loads based on current failed edges
      for (const edge_id of edge_loads.keys()) {
        edge_loads.set(edge_id, 0);
      }

      // Simulate traffic rerouting through available paths
      const source_nodes = Array.from(this.nodes.values()).filter(n => n.type === 'intersection' && n.population > 0);
      const dest_nodes = Array.from(this.nodes.values()).filter(n => n.type === 'hospital' || n.type === 'shelter');

      for (const src of source_nodes) {
        for (const dst of dest_nodes) {
          const path = this.dijkstra(src.id, dst.id, failed_edges);
          if (path) {
            const traffic = src.population / Math.max(dest_nodes.length, 1);
            for (const { edge } of path.path.slice(1)) {
              if (edge) {
                edge_loads.set(edge, (edge_loads.get(edge) || 0) + traffic);
              }
            }
          }
        }
      }

      // Check for overloads -> new failures
      for (const [edge_id, load] of edge_loads) {
        if (load > capacity_threshold && !failed_edges.has(edge_id)) {
          failed_edges.add(edge_id);
          new_failures = true;
        }
      }

      if (!new_failures) break;
      iterations++;
    }

    // Calculate impact metrics
    const failed_count = failed_edges.size;
    const cutoff_hospitals = this.calculateCutoffFacilities(failed_edges, 'hospital');
    const cutoff_shelters = this.calculateCutoffFacilities(failed_edges, 'shelter');
    const isolated_population = this.calculateIsolatedPopulation(failed_edges);
    const avg_response_time = this.calculateAvgResponseTime(failed_edges);

    return {
      failed_edges: Array.from(failed_edges),
      roads_failed: failed_count,
      facilities_cut_off: cutoff_hospitals + cutoff_shelters,
      hospitals_cut_off: cutoff_hospitals,
      shelters_cut_off: cutoff_shelters,
      population_isolated: isolated_population,
      avg_response_time_min: avg_response_time,
      iterations_to_stabilize: iterations
    };
  }

  calculateCutoffFacilities(failed_edges, facility_type) {
    let count = 0;
    for (const facility of this.nodes.values()) {
      if (facility.type === facility_type) {
        const hasConnection = Array.from(this.nodes.values()).some(node => {
          if (node.type === 'intersection') {
            const path = this.dijkstra(node.id, facility.id, failed_edges);
            return path !== null;
          }
          return false;
        });
        if (!hasConnection) count++;
      }
    }
    return count;
  }

  calculateIsolatedPopulation(failed_edges) {
    let isolated = 0;
    for (const node of this.nodes.values()) {
      if (node.type === 'intersection' && node.population > 0) {
        const has_facility_access = Array.from(this.nodes.values()).some(facility => {
          if (facility.type === 'hospital' || facility.type === 'shelter') {
            const path = this.dijkstra(node.id, facility.id, failed_edges);
            return path !== null;
          }
          return false;
        });
        if (!has_facility_access) {
          isolated += node.population;
        }
      }
    }
    return isolated;
  }

  calculateAvgResponseTime(failed_edges) {
    const times = [];
    for (const node of this.nodes.values()) {
      if (node.type === 'intersection' && node.population > 0) {
        let min_time = Infinity;
        for (const facility of this.nodes.values()) {
          if (facility.type === 'hospital' || facility.type === 'shelter') {
            const path = this.dijkstra(node.id, facility.id, failed_edges);
            if (path) {
              // Assume avg speed on road is 30 km/h = 0.5 km/min
              const time = path.distance / 0.5;
              min_time = Math.min(min_time, time);
            }
          }
        }
        if (min_time !== Infinity) {
          times.push(min_time);
        }
      }
    }
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  clone() {
    const cloned = new Graph();
    for (const [id, node] of this.nodes) {
      cloned.addNode(id, node);
    }
    for (const [id, edge] of this.edges) {
      cloned.addEdge(id, edge.from, edge.to, edge);
    }
    return cloned;
  }
}

module.exports = Graph;
