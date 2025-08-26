import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedGraph, GraphMetrics } from "@/types/graph";
import { PieChart, BarChart3 } from "lucide-react";

interface ReportChartsProps {
  graph: ProcessedGraph;
  metrics: GraphMetrics | null;
}

export function ReportCharts({ graph, metrics }: ReportChartsProps) {
  // Calculate module distribution
  const moduleDistribution = graph.modules.reduce((acc, module) => {
    const nodeCount = graph.nodes.filter(n => n.module === module).length;
    acc[module] = nodeCount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate fan-in/fan-out distribution
  const fanInDistribution = [
    { range: "0", count: graph.nodes.filter(n => n.fanIn === 0).length },
    { range: "1-2", count: graph.nodes.filter(n => n.fanIn >= 1 && n.fanIn <= 2).length },
    { range: "3-5", count: graph.nodes.filter(n => n.fanIn >= 3 && n.fanIn <= 5).length },
    { range: "6+", count: graph.nodes.filter(n => n.fanIn >= 6).length },
  ];

  const fanOutDistribution = [
    { range: "0", count: graph.nodes.filter(n => n.fanOut === 0).length },
    { range: "1-2", count: graph.nodes.filter(n => n.fanOut >= 1 && n.fanOut <= 2).length },
    { range: "3-5", count: graph.nodes.filter(n => n.fanOut >= 3 && n.fanOut <= 5).length },
    { range: "6+", count: graph.nodes.filter(n => n.fanOut >= 6).length },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Module Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Nodes per Module
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {Object.entries(moduleDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([module, count]) => {
                const percentage = ((count / graph.metrics.nodeCount) * 100).toFixed(1);
                return (
                  <div key={module} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate" title={module}>{module}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Fan-in Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fan-in Distribution
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {fanInDistribution.map((item) => {
              const percentage = ((item.count / graph.metrics.nodeCount) * 100).toFixed(1);
              return (
                <div key={item.range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.range} incoming edges</span>
                    <span>{item.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fan-out Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fan-out Distribution
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {fanOutDistribution.map((item) => {
              const percentage = ((item.count / graph.metrics.nodeCount) * 100).toFixed(1);
              return (
                <div key={item.range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.range} outgoing edges</span>
                    <span>{item.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Most Connected Nodes
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {graph.nodes
              .sort((a, b) => (b.fanIn + b.fanOut) - (a.fanIn + a.fanOut))
              .slice(0, 6)
              .map((node) => {
                const totalConnections = node.fanIn + node.fanOut;
                return (
                  <div key={node.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-mono" title={node.id}>
                        {node.label}
                      </span>
                      <span>{totalConnections} connections</span>
                    </div>
                    <div className="flex text-xs text-muted-foreground">
                      <span>In: {node.fanIn}</span>
                      <span className="mx-2">•</span>
                      <span>Out: {node.fanOut}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}