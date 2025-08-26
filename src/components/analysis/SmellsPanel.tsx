import { useGraphStore } from "@/store/graph-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Eye, CheckCircle } from "lucide-react";
import { detectDependencySmells } from "@/lib/algorithms";

export function SmellsPanel() {
  const { currentGraph } = useGraphStore();

  if (!currentGraph) return null;

  const smells = detectDependencySmells(currentGraph.nodes, currentGraph.edges);

  const smellTypeColors = {
    duplicate_providers: "destructive",
    high_fan_out: "secondary",
    high_fan_in: "secondary",
  } as const;

  const smellTypeLabels = {
    duplicate_providers: "Duplicate Providers",
    high_fan_out: "God Object",
    high_fan_in: "Bottleneck",
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-yellow-500" />
            Code Smells
          </CardTitle>
          <Badge variant={smells.length > 0 ? "destructive" : "secondary"}>
            {smells.length} issues
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {smells.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
            <p>No dependency smells detected</p>
            <p className="text-xs mt-1">Your dependency structure looks healthy!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {smells.map((smell, index) => (
              <div
                key={index}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={smellTypeColors[smell.type as keyof typeof smellTypeColors] || "secondary"}
                      className="text-xs"
                    >
                      {smellTypeLabels[smell.type as keyof typeof smellTypeLabels] || smell.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {smell.nodeIds.length} node{smell.nodeIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Inspect
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {smell.description}
                </p>
                
                <div className="text-xs font-mono text-muted-foreground space-y-1">
                  {smell.nodeIds.slice(0, 3).map((nodeId) => (
                    <div key={nodeId}>• {nodeId}</div>
                  ))}
                  {smell.nodeIds.length > 3 && (
                    <div className="text-muted-foreground">
                      +{smell.nodeIds.length - 3} more nodes...
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