import { useGraphStore } from "@/store/graph-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RotateCcw } from "lucide-react";
import { GraphNodeKind, EdgeKind } from "@/types/graph";

export function FilterSidebar() {
  const {
    currentGraph,
    filters,
    setSearchTerm,
    toggleNodeKind,
    toggleEdgeKind,
    toggleModule,
    togglePackage,
    setClusterMode,
    updateFilters,
  } = useGraphStore();

  if (!currentGraph) return null;

  const nodeKindCounts = {
    provider: currentGraph.nodes.filter(n => n.kind === "provider").length,
    consumer: currentGraph.nodes.filter(n => n.kind === "consumer").length,
    type: currentGraph.nodes.filter(n => n.kind === "type").length,
  };

  const edgeKindCounts = {
    provides: currentGraph.edges.filter(e => e.kind === "provides").length,
    requires: currentGraph.edges.filter(e => e.kind === "requires").length,
    needs: currentGraph.edges.filter(e => e.kind === "needs").length,
  };

  const resetFilters = () => {
    updateFilters({
      searchTerm: "",
      nodeKinds: new Set<GraphNodeKind>(["type", "provider", "consumer"]),
      edgeKinds: new Set<EdgeKind>(["provides", "requires", "needs"]),
      modules: new Set<string>(),
      packages: new Set<string>(),
      showClusters: {
        byModule: true,
        byPackage: false,
      },
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filters</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 w-7 p-0"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-xs font-medium">
            Search Nodes
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name..."
              value={filters.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Separator />

        {/* Node Types */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Node Types</Label>
          <div className="space-y-2">
            {(["provider", "consumer", "type"] as GraphNodeKind[]).map((kind) => (
              <div key={kind} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.nodeKinds.has(kind)}
                    onCheckedChange={() => toggleNodeKind(kind)}
                    className="h-4 w-4"
                  />
                  <Label className={`text-sm capitalize node-${kind}`}>
                    {kind}s
                  </Label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {nodeKindCounts[kind]}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Edge Types */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Edge Types</Label>
          <div className="space-y-2">
            {(["provides", "requires", "needs"] as EdgeKind[]).map((kind) => (
              <div key={kind} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.edgeKinds.has(kind)}
                    onCheckedChange={() => toggleEdgeKind(kind)}
                    className="h-4 w-4"
                  />
                  <Label className={`text-sm capitalize edge-${kind}`}>
                    {kind}
                  </Label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {edgeKindCounts[kind]}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Clustering */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Clustering</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="cluster-module" className="text-sm">
                Group by Module
              </Label>
              <Switch
                id="cluster-module"
                checked={filters.showClusters.byModule}
                onCheckedChange={(checked) => setClusterMode("module", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cluster-package" className="text-sm">
                Group by Package
              </Label>
              <Switch
                id="cluster-package"
                checked={filters.showClusters.byPackage}
                onCheckedChange={(checked) => setClusterMode("package", checked)}
              />
            </div>
          </div>
        </div>

        {/* Modules */}
        {currentGraph.modules.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs font-medium">
                Modules ({currentGraph.modules.length})
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentGraph.modules.map((module) => (
                  <div key={module} className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.modules.has(module)}
                      onCheckedChange={() => toggleModule(module)}
                      className="h-4 w-4"
                    />
                    <Label className="text-sm truncate" title={module}>
                      {module}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Packages */}
        {currentGraph.packages.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs font-medium">
                Packages ({currentGraph.packages.length})
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentGraph.packages.map((pkg) => (
                  <div key={pkg} className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.packages.has(pkg)}
                      onCheckedChange={() => togglePackage(pkg)}
                      className="h-4 w-4"
                    />
                    <Label className="text-sm truncate" title={pkg}>
                      {pkg}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}