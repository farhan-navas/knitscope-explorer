import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, Minus, Edit3, Eye } from "lucide-react";
import { GraphDiff } from "@/types/graph";

interface DiffVisualizationProps {
  diff: GraphDiff;
}

export function DiffVisualization({ diff }: DiffVisualizationProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Added Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Plus className="h-5 w-5" />
            Added Nodes
            <Badge variant="secondary">{diff.addedNodes.length}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {diff.addedNodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No nodes added
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diff.addedNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-mono truncate">{node.label}</p>
                    <Badge variant="outline" className={`node-${node.kind} text-xs`}>
                      {node.kind}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Removed Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Minus className="h-5 w-5" />
            Removed Nodes
            <Badge variant="secondary">{diff.removedNodes.length}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {diff.removedNodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No nodes removed
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diff.removedNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-mono truncate">{node.label}</p>
                    <Badge variant="outline" className={`node-${node.kind} text-xs`}>
                      {node.kind}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Changed Nodes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Edit3 className="h-5 w-5" />
            Changed Nodes
            <Badge variant="secondary">{diff.changedNodes.length}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {diff.changedNodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No nodes changed
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {diff.changedNodes.map((change, index) => (
                <div
                  key={index}
                  className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-mono font-medium">{change.before.label}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`node-${change.before.kind} text-xs`}>
                        {change.before.kind}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Before</p>
                      <p>Fan-in: {change.before.fanIn}</p>
                      <p>Fan-out: {change.before.fanOut}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">After</p>
                      <p>Fan-in: {change.after.fanIn}</p>
                      <p>Fan-out: {change.after.fanOut}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edge Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <GitBranch className="h-5 w-5" />
            Added Edges
            <Badge variant="secondary">{diff.addedEdges.length}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {diff.addedEdges.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No edges added
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diff.addedEdges.map((edge) => (
                <div
                  key={edge.id}
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`edge-${edge.kind}`}>
                      {edge.kind}
                    </Badge>
                    <span className="font-mono">
                      {edge.source} → {edge.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <GitBranch className="h-5 w-5" />
            Removed Edges
            <Badge variant="secondary">{diff.removedEdges.length}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {diff.removedEdges.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No edges removed
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diff.removedEdges.map((edge) => (
                <div
                  key={edge.id}
                  className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`edge-${edge.kind}`}>
                      {edge.kind}
                    </Badge>
                    <span className="font-mono">
                      {edge.source} → {edge.target}
                    </span>
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