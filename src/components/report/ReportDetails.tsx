import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProcessedGraph, GraphMetrics } from "@/types/graph";
import { List, Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportDetailsProps {
  graph: ProcessedGraph;
  metrics: GraphMetrics | null;
}

export function ReportDetails({ graph, metrics }: ReportDetailsProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Module Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Module Breakdown
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {graph.modules.map((module) => {
              const moduleNodes = graph.nodes.filter(n => n.module === module);
              const moduleEdges = graph.edges.filter(e => 
                moduleNodes.some(n => n.id === e.source) || 
                moduleNodes.some(n => n.id === e.target)
              );
              
              const nodeBreakdown = {
                providers: moduleNodes.filter(n => n.kind === "provider").length,
                consumers: moduleNodes.filter(n => n.kind === "consumer").length,
                types: moduleNodes.filter(n => n.kind === "type").length,
              };

              return (
                <div key={module} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{module}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{moduleNodes.length} nodes</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(module, "Module name")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Providers</p>
                      <p className="font-medium node-provider">{nodeBreakdown.providers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Consumers</p>
                      <p className="font-medium node-consumer">{nodeBreakdown.consumers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Types</p>
                      <p className="font-medium node-type">{nodeBreakdown.types}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* High Fan-in Nodes */}
      {metrics && metrics.highFanInNodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High Fan-in Nodes (Potential Bottlenecks)</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {metrics.highFanInNodes.slice(0, 10).map((item) => {
                const node = graph.nodes.find(n => n.id === item.nodeId);
                return (
                  <div
                    key={item.nodeId}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-mono truncate">{node?.label || item.nodeId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`node-${node?.kind} text-xs`}>
                          {node?.kind}
                        </Badge>
                        {node?.module && (
                          <span className="text-xs text-muted-foreground">
                            {node.module}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.fanIn} incoming</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Fan-out Nodes */}
      {metrics && metrics.highFanOutNodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High Fan-out Nodes (Potential God Objects)</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {metrics.highFanOutNodes.slice(0, 10).map((item) => {
                const node = graph.nodes.find(n => n.id === item.nodeId);
                return (
                  <div
                    key={item.nodeId}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-mono truncate">{node?.label || item.nodeId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`node-${node?.kind} text-xs`}>
                          {node?.kind}
                        </Badge>
                        {node?.module && (
                          <span className="text-xs text-muted-foreground">
                            {node.module}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.fanOut} outgoing</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycles Details */}
      {metrics && metrics.stronglyConnectedComponents.some(scc => scc.size > 1) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Dependency Cycles (Detailed)</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {metrics.stronglyConnectedComponents
                .filter(scc => scc.size > 1)
                .map((cycle) => (
                  <div
                    key={cycle.id}
                    className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Cycle {cycle.id.replace('scc-', '')}</h4>
                      <Badge variant="destructive">{cycle.size} nodes</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      {cycle.nodes.map((nodeId) => {
                        const node = graph.nodes.find(n => n.id === nodeId);
                        return (
                          <div key={nodeId} className="flex items-center justify-between text-sm">
                            <span className="font-mono">{node?.label || nodeId}</span>
                            <Badge variant="outline" className={`node-${node?.kind} text-xs`}>
                              {node?.kind}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}