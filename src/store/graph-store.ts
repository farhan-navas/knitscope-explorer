import { create } from "zustand";
import { GraphState, GraphFilters, ProcessedGraph, GraphMetrics, GraphNodeKind, EdgeKind } from "@/types/graph";
import { buildRenderableGraph } from "@/lib/graph-builder";
import { computeGraphMetrics } from "@/lib/algorithms";

const initialFilters: GraphFilters = {
  searchTerm: "",
  nodeKinds: new Set<GraphNodeKind>(["type", "provider", "consumer"]),
  edgeKinds: new Set<EdgeKind>(["provides", "requires", "needs"]),
  modules: new Set<string>(),
  packages: new Set<string>(),
  showClusters: {
    byModule: true,
    byPackage: false,
  },
};

interface GraphStore extends GraphState {
  // Actions
  loadGraph: (graphJson: any) => void;
  clearGraph: () => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  toggleNodeSelection: (nodeId: string) => void;
  updateFilters: (filters: Partial<GraphFilters>) => void;
  setSearchTerm: (term: string) => void;
  toggleNodeKind: (kind: GraphNodeKind) => void;
  toggleEdgeKind: (kind: EdgeKind) => void;
  toggleModule: (module: string) => void;
  togglePackage: (pkg: string) => void;
  setClusterMode: (mode: "module" | "package", enabled: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  // Initial state
  currentGraph: null,
  selectedNodes: new Set<string>(),
  filters: initialFilters,
  metrics: null,
  isLoading: false,
  error: null,

  // Actions
  loadGraph: (graphJson: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const processedGraph = buildRenderableGraph(graphJson);
      const metrics = computeGraphMetrics(processedGraph.nodes, processedGraph.edges);
      
      // Update filters with available modules and packages
      const newFilters = {
        ...get().filters,
        modules: new Set<string>(),
        packages: new Set<string>(),
      };
      
      set({
        currentGraph: processedGraph,
        metrics,
        filters: newFilters,
        selectedNodes: new Set<string>(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load graph",
      });
    }
  },

  clearGraph: () => {
    set({
      currentGraph: null,
      selectedNodes: new Set<string>(),
      filters: initialFilters,
      metrics: null,
      error: null,
    });
  },

  setSelectedNodes: (nodeIds: string[]) => {
    set({ selectedNodes: new Set(nodeIds) });
  },

  toggleNodeSelection: (nodeId: string) => {
    const { selectedNodes } = get();
    const newSelection = new Set(selectedNodes);
    
    if (newSelection.has(nodeId)) {
      newSelection.delete(nodeId);
    } else {
      newSelection.add(nodeId);
    }
    
    set({ selectedNodes: newSelection });
  },

  updateFilters: (newFilters: Partial<GraphFilters>) => {
    const { filters } = get();
    set({
      filters: {
        ...filters,
        ...newFilters,
      },
    });
  },

  setSearchTerm: (term: string) => {
    const { filters } = get();
    set({
      filters: {
        ...filters,
        searchTerm: term,
      },
    });
  },

  toggleNodeKind: (kind: GraphNodeKind) => {
    const { filters } = get();
    const newKinds = new Set(filters.nodeKinds);
    
    if (newKinds.has(kind)) {
      newKinds.delete(kind);
    } else {
      newKinds.add(kind);
    }
    
    set({
      filters: {
        ...filters,
        nodeKinds: newKinds,
      },
    });
  },

  toggleEdgeKind: (kind: EdgeKind) => {
    const { filters } = get();
    const newKinds = new Set(filters.edgeKinds);
    
    if (newKinds.has(kind)) {
      newKinds.delete(kind);
    } else {
      newKinds.add(kind);
    }
    
    set({
      filters: {
        ...filters,
        edgeKinds: newKinds,
      },
    });
  },

  toggleModule: (module: string) => {
    const { filters } = get();
    const newModules = new Set(filters.modules);
    
    if (newModules.has(module)) {
      newModules.delete(module);
    } else {
      newModules.add(module);
    }
    
    set({
      filters: {
        ...filters,
        modules: newModules,
      },
    });
  },

  togglePackage: (pkg: string) => {
    const { filters } = get();
    const newPackages = new Set(filters.packages);
    
    if (newPackages.has(pkg)) {
      newPackages.delete(pkg);
    } else {
      newPackages.add(pkg);
    }
    
    set({
      filters: {
        ...filters,
        packages: newPackages,
      },
    });
  },

  setClusterMode: (mode: "module" | "package", enabled: boolean) => {
    const { filters } = get();
    set({
      filters: {
        ...filters,
        showClusters: {
          ...filters.showClusters,
          [`by${mode.charAt(0).toUpperCase() + mode.slice(1)}`]: enabled,
        },
      },
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));