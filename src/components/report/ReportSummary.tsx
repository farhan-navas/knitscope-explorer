import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, GitBranch, Package, AlertTriangle } from "lucide-react";
import { ProcessedGraph, GraphMetrics } from "@/types/graph";

interface ReportSummaryProps {
  graph: ProcessedGraph;
  metrics: GraphMetrics | null;
}

export function ReportSummary({ graph, metrics }: ReportSummaryProps) {
  const nodeTypeBreakdown = {
    providers: graph.nodes.filter(n => n.kind === "provider").length,
    consumers: graph.nodes.filter(n => n.kind === "consumer").length,
    types: graph.nodes.filter(n => n.kind === "type").length,
  };

  const edgeTypeBreakdown = {
    provides: graph.edges.filter(e => e.kind === "provides").length,
    requires: graph.edges.filter(e => e.kind === "requires").length,
    needs: graph.edges.filter(e => e.kind === "needs").length,
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Graph Overview
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {graph.metrics.nodeCount}
              </div>
              <div className="text-sm text-muted-foreground">Total Nodes</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {graph.metrics.edgeCount}
              </div>
              <div className="text-sm text-muted-foreground">Total Edges</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {graph.metrics.moduleCount}
              </div>
              <div className="text-sm text-muted-foreground">Modules</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className={`text-2xl font-bold ${graph.metrics.cycleCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                {graph.metrics.cycleCount}
              </div>
              <div className="text-sm text-muted-foreground">Cycles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Node Distribution
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Providers</span>
                </div>
                <Badge variant="outline">{nodeTypeBreakdown.providers}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-sm">Consumers</span>
                </div>
                <Badge variant="outline">{nodeTypeBreakdown.consumers}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm">Types</span>
                </div>
                <Badge variant="outline">{nodeTypeBreakdown.types}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Edge Distribution
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Provides</span>
                </div>
                <Badge variant="outline">{edgeTypeBreakdown.provides}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-sm">Requires</span>
                </div>
                <Badge variant="outline">{edgeTypeBreakdown.requires}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm">Needs</span>
                </div>
                <Badge variant="outline">{edgeTypeBreakdown.needs}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dependency Health
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-lg font-bold ${graph.metrics.cycleCount === 0 ? 'text-green-600' : 'text-destructive'}`}>
                {graph.metrics.cycleCount === 0 ? '✓' : '⚠️'}
              </div>
              <div className="text-sm text-muted-foreground">
                {graph.metrics.cycleCount === 0 ? 'No Cycles' : `${graph.metrics.cycleCount} Cycles`}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {graph.metrics.maxDepth}
              </div>
              <div className="text-sm text-muted-foreground">Max Depth</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {metrics?.highFanInNodes?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">High Fan-in</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}