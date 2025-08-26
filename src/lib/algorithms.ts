import { RenderableNode, RenderableEdge, StronglyConnectedComponent, GraphMetrics } from "@/types/graph";

export function computeGraphMetrics(
  nodes: RenderableNode[], 
  edges: RenderableEdge[]
): GraphMetrics {
  const sccs = findStronglyConnectedComponents(nodes, edges);
  
  // Sort nodes by fan-in and fan-out
  const highFanInNodes = [...nodes]
    .sort((a, b) => b.fanIn - a.fanIn)
    .slice(0, 10)
    .map(node => ({ nodeId: node.id, fanIn: node.fanIn }));
    
  const highFanOutNodes = [...nodes]
    .sort((a, b) => b.fanOut - a.fanOut)
    .slice(0, 10)
    .map(node => ({ nodeId: node.id, fanOut: node.fanOut }));

  // Find longest paths (approximate using DFS)
  const longestPaths = findLongestPaths(nodes, edges);

  return {
    highFanInNodes,
    highFanOutNodes,
    longestPaths,
    stronglyConnectedComponents: sccs.map((nodes, index) => ({
      id: `scc-${index}`,
      nodes,
      size: nodes.length,
    })),
  };
}

export function findStronglyConnectedComponents(
  nodes: RenderableNode[], 
  edges: RenderableEdge[]
): string[][] {
  const graph = new Map<string, string[]>();
  
  // Build adjacency list
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  // Tarjan's algorithm
  const index = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const sccs: string[][] = [];
  let currentIndex = 0;

  function strongConnect(nodeId: string) {
    index.set(nodeId, currentIndex);
    lowlink.set(nodeId, currentIndex);
    currentIndex++;
    stack.push(nodeId);
    onStack.add(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!index.has(neighbor)) {
        strongConnect(neighbor);
        lowlink.set(nodeId, Math.min(lowlink.get(nodeId)!, lowlink.get(neighbor)!));
      } else if (onStack.has(neighbor)) {
        lowlink.set(nodeId, Math.min(lowlink.get(nodeId)!, index.get(neighbor)!));
      }
    }

    if (lowlink.get(nodeId) === index.get(nodeId)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== nodeId);
      sccs.push(component);
    }
  }

  for (const node of nodes) {
    if (!index.has(node.id)) {
      strongConnect(node.id);
    }
  }

  return sccs;
}

export function findLongestPaths(
  nodes: RenderableNode[], 
  edges: RenderableEdge[],
  maxPaths: number = 5
): Array<{ path: string[]; length: number }> {
  const graph = new Map<string, string[]>();
  
  // Build adjacency list
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  const paths: Array<{ path: string[]; length: number }> = [];
  const visited = new Set<string>();

  function dfs(nodeId: string, currentPath: string[]) {
    if (currentPath.length > 20) return; // Prevent infinite recursion
    
    const neighbors = graph.get(nodeId) || [];
    let hasUnvisitedNeighbor = false;
    
    for (const neighbor of neighbors) {
      if (!currentPath.includes(neighbor)) { // Avoid cycles in this path
        hasUnvisitedNeighbor = true;
        dfs(neighbor, [...currentPath, neighbor]);
      }
    }
    
    // If this is a leaf node or has no unvisited neighbors, record the path
    if (!hasUnvisitedNeighbor && currentPath.length > 1) {
      paths.push({ path: [...currentPath], length: currentPath.length });
    }
  }

  // Start DFS from each node
  for (const node of nodes) {
    if (paths.length >= maxPaths * 10) break; // Limit computation
    dfs(node.id, [node.id]);
  }

  // Return the longest paths
  return paths
    .sort((a, b) => b.length - a.length)
    .slice(0, maxPaths);
}

export function findShortestPath(
  nodes: RenderableNode[],
  edges: RenderableEdge[],
  sourceId: string,
  targetId: string
): string[] | null {
  const graph = new Map<string, string[]>();
  
  // Build adjacency list
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  // BFS for shortest path
  const queue = [sourceId];
  const visited = new Set([sourceId]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === targetId) {
      // Reconstruct path
      const path = [];
      let node = targetId;
      while (node !== sourceId) {
        path.unshift(node);
        node = parent.get(node)!;
      }
      path.unshift(sourceId);
      return path;
    }
    
    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null; // No path found
}

export function detectDependencySmells(
  nodes: RenderableNode[],
  edges: RenderableEdge[]
): Array<{ type: string; description: string; nodeIds: string[] }> {
  const smells: Array<{ type: string; description: string; nodeIds: string[] }> = [];

  // Group nodes by module
  const moduleGroups = new Map<string, RenderableNode[]>();
  nodes.forEach(node => {
    if (node.module) {
      const group = moduleGroups.get(node.module) || [];
      group.push(node);
      moduleGroups.set(node.module, group);
    }
  });

  // Find duplicate providers for the same type across modules
  const typeProviders = new Map<string, RenderableNode[]>();
  nodes.filter(n => n.kind === "provider").forEach(provider => {
    if (provider.provides) {
      const providers = typeProviders.get(provider.provides) || [];
      providers.push(provider);
      typeProviders.set(provider.provides, providers);
    }
  });

  typeProviders.forEach((providers, type) => {
    if (providers.length > 1) {
      const modules = new Set(providers.map(p => p.module).filter(Boolean));
      if (modules.size > 1) {
        smells.push({
          type: "duplicate_providers",
          description: `Multiple providers for ${type} across modules: ${Array.from(modules).join(", ")}`,
          nodeIds: providers.map(p => p.id),
        });
      }
    }
  });

  // Find high fan-out nodes (potential god objects)
  const highFanOut = nodes.filter(n => n.fanOut > 5);
  highFanOut.forEach(node => {
    smells.push({
      type: "high_fan_out",
      description: `High fan-out (${node.fanOut}) suggests potential god object`,
      nodeIds: [node.id],
    });
  });

  // Find high fan-in nodes (potential bottlenecks)
  const highFanIn = nodes.filter(n => n.fanIn > 5);
  highFanIn.forEach(node => {
    smells.push({
      type: "high_fan_in",
      description: `High fan-in (${node.fanIn}) suggests potential bottleneck`,
      nodeIds: [node.id],
    });
  });

  return smells;
}