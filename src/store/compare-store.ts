import { create } from "zustand";
import { CompareState, ProcessedGraph, GraphDiff, RenderableNode, RenderableEdge } from "@/types/graph";
import { buildRenderableGraph } from "@/lib/graph-builder";

interface CompareStore extends CompareState {
  // Actions
  setBaselineGraph: (graphJson: any) => void;
  setCandidateGraph: (graphJson: any) => void;
  clearComparison: () => void;
  computeDiff: () => void;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  // Initial state
  baselineGraph: null,
  candidateGraph: null,
  diff: null,

  // Actions
  setBaselineGraph: (graphJson: any) => {
    try {
      const processedGraph = buildRenderableGraph(graphJson);
      set({ baselineGraph: processedGraph });
      
      // Auto-compute diff if we have both graphs
      if (get().candidateGraph) {
        get().computeDiff();
      }
    } catch (error) {
      console.error("Failed to set baseline graph:", error);
    }
  },

  setCandidateGraph: (graphJson: any) => {
    try {
      const processedGraph = buildRenderableGraph(graphJson);
      set({ candidateGraph: processedGraph });
      
      // Auto-compute diff if we have both graphs
      if (get().baselineGraph) {
        get().computeDiff();
      }
    } catch (error) {
      console.error("Failed to set candidate graph:", error);
    }
  },

  clearComparison: () => {
    set({
      baselineGraph: null,
      candidateGraph: null,
      diff: null,
    });
  },

  computeDiff: () => {
    const { baselineGraph, candidateGraph } = get();
    
    if (!baselineGraph || !candidateGraph) {
      set({ diff: null });
      return;
    }

    const diff = computeGraphDiff(baselineGraph, candidateGraph);
    set({ diff });
  },
}));

function computeGraphDiff(baseline: ProcessedGraph, candidate: ProcessedGraph): GraphDiff {
  const baselineNodeIds = new Set(baseline.nodes.map(n => n.id));
  const candidateNodeIds = new Set(candidate.nodes.map(n => n.id));
  const baselineNodeMap = new Map(baseline.nodes.map(n => [n.id, n]));
  const candidateNodeMap = new Map(candidate.nodes.map(n => [n.id, n]));

  // Find added and removed nodes
  const addedNodes = candidate.nodes.filter(n => !baselineNodeIds.has(n.id));
  const removedNodes = baseline.nodes.filter(n => !candidateNodeIds.has(n.id));

  // Find changed nodes (nodes with same id but different properties)
  const changedNodes: Array<{ before: RenderableNode; after: RenderableNode }> = [];
  for (const nodeId of baselineNodeIds) {
    if (candidateNodeIds.has(nodeId)) {
      const beforeNode = baselineNodeMap.get(nodeId)!;
      const afterNode = candidateNodeMap.get(nodeId)!;
      
      // Simple comparison - could be more sophisticated
      if (JSON.stringify(beforeNode) !== JSON.stringify(afterNode)) {
        changedNodes.push({ before: beforeNode, after: afterNode });
      }
    }
  }

  // Compare edges
  const baselineEdgeSet = new Set(baseline.edges.map(e => `${e.source}-${e.target}-${e.kind}`));
  const candidateEdgeSet = new Set(candidate.edges.map(e => `${e.source}-${e.target}-${e.kind}`));
  
  const addedEdges = candidate.edges.filter(e => !baselineEdgeSet.has(`${e.source}-${e.target}-${e.kind}`));
  const removedEdges = baseline.edges.filter(e => !candidateEdgeSet.has(`${e.source}-${e.target}-${e.kind}`));

  // Calculate metrics delta
  const metricsDelta = {
    nodeCountDelta: candidate.metrics.nodeCount - baseline.metrics.nodeCount,
    edgeCountDelta: candidate.metrics.edgeCount - baseline.metrics.edgeCount,
    cycleCountDelta: candidate.metrics.cycleCount - baseline.metrics.cycleCount,
    maxDepthDelta: candidate.metrics.maxDepth - baseline.metrics.maxDepth,
  };

  return {
    addedNodes,
    removedNodes,
    changedNodes,
    addedEdges,
    removedEdges,
    metricsDelta,
  };
}