import { useGraphStore } from "@/store/graph-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Eye } from "lucide-react";

export function MetricsPanel() {
  const { metrics } = useGraphStore();

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      {/* High Fan-In Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            High Fan-In Nodes
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {metrics.highFanInNodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No high fan-in nodes detected
            </p>
          ) : (
            <div className="space-y-2">
              {metrics.highFanInNodes.slice(0, 5).map((item) => (
                <div
                  key={item.nodeId}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-mono truncate">{item.nodeId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.fanIn} incoming</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* High Fan-Out Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-500" />
            High Fan-Out Nodes
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {metrics.highFanOutNodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No high fan-out nodes detected
            </p>
          ) : (
            <div className="space-y-2">
              {metrics.highFanOutNodes.slice(0, 5).map((item) => (
                <div
                  key={item.nodeId}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-mono truncate">{item.nodeId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.fanOut} outgoing</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Longest Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Longest Dependency Chains
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {metrics.longestPaths.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No long dependency chains found
            </p>
          ) : (
            <div className="space-y-2">
              {metrics.longestPaths.slice(0, 3).map((path, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted/30 rounded"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{path.length} nodes</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {path.path.slice(0, 3).join(" → ")}
                    {path.path.length > 3 && " → ..."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}