import { useGraphStore } from "@/store/graph-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DetailsSidebar() {
  const { currentGraph, selectedNode } = useGraphStore();
  const { toast } = useToast();

  if (!currentGraph || !selectedNode) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Network className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Select a node to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedNodeData = currentGraph.nodes.find(n => n.id === selectedNode);

  if (!selectedNodeData) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const connectedEdges = currentGraph.edges.filter(
    edge => edge.source === selectedNode || edge.target === selectedNode
  );

  const incomingEdges = connectedEdges.filter(edge => edge.target === selectedNode);
  const outgoingEdges = connectedEdges.filter(edge => edge.source === selectedNode);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Node Details</CardTitle>
          <Badge variant="outline" className={`node-${selectedNodeData.kind}`}>
            {selectedNodeData.kind}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Name
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-mono break-all">{selectedNodeData.label}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(selectedNodeData.label, "Name")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Full ID
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs font-mono break-all text-muted-foreground">
                {selectedNodeData.id}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(selectedNodeData.id, "ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {selectedNodeData.module && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Module
              </Label>
              <p className="text-sm mt-1">{selectedNodeData.module}</p>
            </div>
          )}

          {selectedNodeData.package && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Package
              </Label>
              <p className="text-sm mt-1">{selectedNodeData.package}</p>
            </div>
          )}

          {selectedNodeData.owner && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Owner
              </Label>
              <p className="text-sm mt-1 font-mono">{selectedNodeData.owner}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Type-specific info */}
        {selectedNodeData.kind === "provider" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Provides Type
              </Label>
              <p className="text-sm mt-1 font-mono">{selectedNodeData.provides}</p>
            </div>
            
            {selectedNodeData.requires && selectedNodeData.requires.length > 0 && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Requires ({selectedNodeData.requires.length})
                </Label>
                <div className="space-y-1 mt-1">
                  {selectedNodeData.requires.map((req, index) => (
                    <p key={index} className="text-xs font-mono text-muted-foreground">
                      {req}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedNodeData.kind === "consumer" && selectedNodeData.needs && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Needs Type
            </Label>
            <p className="text-sm mt-1 font-mono">{selectedNodeData.needs}</p>
          </div>
        )}

        <Separator />

        {/* Metrics */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Fan-in
              </Label>
              <p className="text-lg font-bold">{selectedNodeData.fanIn}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Fan-out
              </Label>
              <p className="text-lg font-bold">{selectedNodeData.fanOut}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Connected Edges */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Incoming Edges ({incomingEdges.length})
            </Label>
            <div className="space-y-1 mt-2">
              {incomingEdges.slice(0, 5).map((edge) => (
                <div key={edge.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className={`edge-${edge.kind}`}>
                    {edge.kind}
                  </Badge>
                  <span className="font-mono truncate">{edge.source}</span>
                </div>
              ))}
              {incomingEdges.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{incomingEdges.length - 5} more...
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Outgoing Edges ({outgoingEdges.length})
            </Label>
            <div className="space-y-1 mt-2">
              {outgoingEdges.slice(0, 5).map((edge) => (
                <div key={edge.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className={`edge-${edge.kind}`}>
                    {edge.kind}
                  </Badge>
                  <span className="font-mono truncate">{edge.target}</span>
                </div>
              ))}
              {outgoingEdges.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{outgoingEdges.length - 5} more...
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => copyToClipboard(selectedNodeData.id, "Node ID")}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy ID
          </Button>
          
          {selectedNodeData.owner && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => copyToClipboard(selectedNodeData.owner, "Owner")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Owner
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}