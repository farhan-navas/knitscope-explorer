import { z } from "zod";

export type EdgeKind = "provides" | "requires" | "needs";

export interface TypeNode {
  id: string;          // fqName, e.g., "com.example.User" or "kotlin.String"
  module?: string;     // Gradle module id
  package?: string;    // package name
}

export interface ProviderNode {
  id: string;          // unique: e.g., "User.<init>" or "UserService.name"
  type: string;        // type this provides (fqName)
  owner: string;       // owner class fqName
  module?: string;
  requires: string[];  // constructor param types (fqName)
}

export interface ConsumerNode {
  id: string;          // e.g., "UserService.user"
  needs: string;       // type needed (fqName)
  owner: string;
  module?: string;
}

export interface GraphEdge {
  from: string;      // node id (provider/consumer)
  to: string;        // node id or type id
  kind: EdgeKind;
}

export interface GraphJson {
  types: TypeNode[];
  providers: ProviderNode[];
  consumers: ConsumerNode[];
  edges: GraphEdge[];
  // optional metrics for convenience
  metrics?: {
    generatedAt?: string;
    moduleCount?: number;
    nodeCount?: number;
    edgeCount?: number;
  };
}

// Zod schemas for validation
export const EdgeKindSchema = z.enum(["provides", "requires", "needs"]);

export const TypeNodeSchema = z.object({
  id: z.string(),
  module: z.string().optional(),
  package: z.string().optional(),
});

export const ProviderNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  owner: z.string(),
  module: z.string().optional(),
  requires: z.array(z.string()),
});

export const ConsumerNodeSchema = z.object({
  id: z.string(),
  needs: z.string(),
  owner: z.string(),
  module: z.string().optional(),
});

export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  kind: EdgeKindSchema,
});

export const GraphJsonSchema = z.object({
  types: z.array(TypeNodeSchema),
  providers: z.array(ProviderNodeSchema),
  consumers: z.array(ConsumerNodeSchema),
  edges: z.array(GraphEdgeSchema),
  metrics: z.object({
    generatedAt: z.string().optional(),
    moduleCount: z.number().optional(),
    nodeCount: z.number().optional(),
    edgeCount: z.number().optional(),
  }).optional(),
});

// Unified graph node for rendering
export type GraphNodeKind = "type" | "provider" | "consumer";

export interface RenderableNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  module?: string;
  package?: string;
  owner?: string;
  // For providers
  provides?: string;
  requires?: string[];
  // For consumers
  needs?: string;
  // Computed metrics
  fanIn: number;
  fanOut: number;
  depth?: number;
}

export interface RenderableEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
}

export interface ProcessedGraph {
  nodes: RenderableNode[];
  edges: RenderableEdge[];
  modules: string[];
  packages: string[];
  metrics: {
    nodeCount: number;
    edgeCount: number;
    moduleCount: number;
    packageCount: number;
    cycleCount: number;
    maxDepth: number;
  };
}

// Filter and view state
export interface GraphFilters {
  searchTerm: string;
  nodeKinds: Set<GraphNodeKind>;
  edgeKinds: Set<EdgeKind>;
  modules: Set<string>;
  packages: Set<string>;
  showClusters: {
    byModule: boolean;
    byPackage: boolean;
  };
}

// Analysis results
export interface StronglyConnectedComponent {
  id: string;
  nodes: string[];
  size: number;
}

export interface GraphMetrics {
  highFanInNodes: Array<{ nodeId: string; fanIn: number }>;
  highFanOutNodes: Array<{ nodeId: string; fanOut: number }>;
  longestPaths: Array<{ path: string[]; length: number }>;
  stronglyConnectedComponents: StronglyConnectedComponent[];
}

// Store state types
export interface GraphState {
  currentGraph: ProcessedGraph | null;
  selectedNode: string | null;
  filters: GraphFilters;
  metrics: GraphMetrics | null;
  isLoading: boolean;
  error: string | null;
}

export interface CompareState {
  baselineGraph: ProcessedGraph | null;
  candidateGraph: ProcessedGraph | null;
  diff: GraphDiff | null;
}

export interface GraphDiff {
  addedNodes: RenderableNode[];
  removedNodes: RenderableNode[];
  changedNodes: Array<{ before: RenderableNode; after: RenderableNode }>;
  addedEdges: RenderableEdge[];
  removedEdges: RenderableEdge[];
  metricsDelta: {
    nodeCountDelta: number;
    edgeCountDelta: number;
    cycleCountDelta: number;
    maxDepthDelta: number;
  };
}