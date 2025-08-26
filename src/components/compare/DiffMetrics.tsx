import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GraphDiff } from "@/types/graph";

interface DiffMetricsProps {
  diff: GraphDiff;
}

export function DiffMetrics({ diff }: DiffMetricsProps) {
  const metrics = [
    {
      label: "Nodes",
      delta: diff.metricsDelta.nodeCountDelta,
      icon: diff.metricsDelta.nodeCountDelta > 0 ? TrendingUp : diff.metricsDelta.nodeCountDelta < 0 ? TrendingDown : Minus,
    },
    {
      label: "Edges",
      delta: diff.metricsDelta.edgeCountDelta,
      icon: diff.metricsDelta.edgeCountDelta > 0 ? TrendingUp : diff.metricsDelta.edgeCountDelta < 0 ? TrendingDown : Minus,
    },
    {
      label: "Cycles",
      delta: diff.metricsDelta.cycleCountDelta,
      icon: diff.metricsDelta.cycleCountDelta > 0 ? TrendingUp : diff.metricsDelta.cycleCountDelta < 0 ? TrendingDown : Minus,
    },
    {
      label: "Max Depth",
      delta: diff.metricsDelta.maxDepthDelta,
      icon: diff.metricsDelta.maxDepthDelta > 0 ? TrendingUp : diff.metricsDelta.maxDepthDelta < 0 ? TrendingDown : Minus,
    },
  ];

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return "text-red-600";
    if (delta < 0) return "text-green-600";
    return "text-muted-foreground";
  };

  const getDeltaVariant = (delta: number) => {
    if (delta > 0) return "destructive";
    if (delta < 0) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Comparison</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="text-center p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-5 w-5 ${getDeltaColor(metric.delta)}`} />
                </div>
                
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {metric.label}
                </p>
                
                <div className="flex items-center justify-center gap-1">
                  <Badge variant={getDeltaVariant(metric.delta)} className="text-xs">
                    {metric.delta >= 0 ? '+' : ''}{metric.delta}
                  </Badge>
                </div>
                
                {metric.label === "Cycles" && metric.delta > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Regression
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Change Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Added:</p>
              <p>{diff.addedNodes.length} nodes, {diff.addedEdges.length} edges</p>
            </div>
            <div>
              <p className="text-muted-foreground">Removed:</p>
              <p>{diff.removedNodes.length} nodes, {diff.removedEdges.length} edges</p>
            </div>
          </div>
          
          {diff.changedNodes.length > 0 && (
            <div className="mt-2">
              <p className="text-muted-foreground">Modified:</p>
              <p>{diff.changedNodes.length} nodes</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}