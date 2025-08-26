import { useGraphStore } from "@/store/graph-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye } from "lucide-react";

export function CyclesPanel() {
  const { metrics } = useGraphStore();

  if (!metrics) return null;

  const cycles = metrics.stronglyConnectedComponents.filter(scc => scc.size > 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Dependency Cycles
          </CardTitle>
          <Badge variant={cycles.length > 0 ? "destructive" : "secondary"}>
            {cycles.length} cycles
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {cycles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No circular dependencies detected</p>
            <p className="text-xs mt-1">Your dependency graph is acyclic!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {cycle.size} nodes
                    </Badge>
                    <span className="text-sm font-medium">
                      Cycle {cycle.id.replace('scc-', '')}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {cycle.nodes.slice(0, 3).map((nodeId) => (
                    <div key={nodeId} className="font-mono">
                      {nodeId}
                    </div>
                  ))}
                  {cycle.nodes.length > 3 && (
                    <div className="text-muted-foreground">
                      +{cycle.nodes.length - 3} more nodes...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}