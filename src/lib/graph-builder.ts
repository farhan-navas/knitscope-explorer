import { GraphJson, RenderableNode, RenderableEdge, ProcessedGraph, GraphNodeKind } from "@/types/graph";

export function buildRenderableGraph(graphJson: GraphJson): ProcessedGraph {
  const nodeMap = new Map<string, RenderableNode>();
  const edges: RenderableEdge[] = [];
  
  // Create nodes from types
  graphJson.types.forEach(type => {
    nodeMap.set(type.id, {
      id: type.id,
      label: getShortName(type.id),
      kind: "type" as GraphNodeKind,
      module: type.module,
      package: type.package,
      fanIn: 0,
      fanOut: 0,
    });
  });

  // Create nodes from providers
  graphJson.providers.forEach(provider => {
    nodeMap.set(provider.id, {
      id: provider.id,
      label: getShortName(provider.id),
      kind: "provider" as GraphNodeKind,
      module: provider.module,
      owner: provider.owner,
      provides: provider.type,
      requires: provider.requires,
      fanIn: 0,
      fanOut: 0,
    });
  });

  // Create nodes from consumers
  graphJson.consumers.forEach(consumer => {
    nodeMap.set(consumer.id, {
      id: consumer.id,
      label: getShortName(consumer.id),
      kind: "consumer" as GraphNodeKind,
      module: consumer.module,
      owner: consumer.owner,
      needs: consumer.needs,
      fanIn: 0,
      fanOut: 0,
    });
  });

  // Create edges and calculate fan-in/fan-out
  graphJson.edges.forEach((edge, index) => {
    const renderableEdge: RenderableEdge = {
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      kind: edge.kind,
    };
    edges.push(renderableEdge);

    // Update fan-in/fan-out counts
    const sourceNode = nodeMap.get(edge.from);
    const targetNode = nodeMap.get(edge.to);
    
    if (sourceNode) sourceNode.fanOut++;
    if (targetNode) targetNode.fanIn++;
  });

  const nodes = Array.from(nodeMap.values());
  const modules = Array.from(new Set(nodes.map(n => n.module).filter(Boolean))) as string[];
  const packages = Array.from(new Set(nodes.map(n => n.package).filter(Boolean))) as string[];

  // Calculate strongly connected components for cycle detection
  const sccs = findStronglyConnectedComponents(nodes, edges);
  const cycleCount = sccs.filter(scc => scc.length > 1).length;

  // Calculate approximate max depth (for DAG components)
  const maxDepth = calculateMaxDepth(nodes, edges);

  return {
    nodes,
    edges,
    modules,
    packages,
    metrics: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      moduleCount: modules.length,
      packageCount: packages.length,
      cycleCount,
      maxDepth,
    },
  };
}

function getShortName(fullName: string): string {
  const parts = fullName.split(".");
  if (parts.length > 1) {
    const className = parts[parts.length - 2];
    const memberName = parts[parts.length - 1];
    if (memberName === "<init>") {
      return className;
    }
    return `${className}.${memberName}`;
  }
  return fullName;
}

function findStronglyConnectedComponents(
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

  // Tarjan's algorithm for SCC detection
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

function calculateMaxDepth(nodes: RenderableNode[], edges: RenderableEdge[]): number {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Build adjacency list and in-degree count
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  edges.forEach(edge => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Topological sort with depth calculation
  const queue: string[] = [];
  const depth = new Map<string, number>();
  
  // Start with nodes that have no incoming edges
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
      depth.set(nodeId, 0);
    }
  }

  let maxDepth = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depth.get(current) || 0;
    maxDepth = Math.max(maxDepth, currentDepth);
    
    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      
      if (newDegree === 0) {
        queue.push(neighbor);
        depth.set(neighbor, currentDepth + 1);
      }
    }
  }

  return maxDepth;
}

export function validateGraphJson(data: unknown): GraphJson {
  // This would use the zod schema for validation
  // For now, simple type assertion
  return data as GraphJson;
}