import { useRef } from "react";
import { useGraphStore } from "@/store/graph-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Download,
  Layers,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function GraphToolbar() {
  const { currentGraph, selectedNodes } = useGraphStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!currentGraph) return null;

  const handleZoomIn = () => {
    // This would integrate with the Cytoscape instance
    console.log("Zoom in");
  };

  const handleZoomOut = () => {
    // This would integrate with the Cytoscape instance
    console.log("Zoom out");
  };

  const handleFitView = () => {
    // This would integrate with the Cytoscape instance
    console.log("Fit view");
  };

  const handleReset = () => {
    // Reset graph layout
    console.log("Reset layout");
  };

  const handleExportPNG = () => {
    // Export current view as PNG
    console.log("Export PNG");
  };

  const handleExportSVG = () => {
    // Export current view as SVG
    console.log("Export SVG");
  };

  const visibleNodes = currentGraph.nodes.length;
  const visibleEdges = currentGraph.edges.length;

  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {visibleNodes} nodes
          </Badge>
          <Badge variant="outline" className="text-xs">
            {visibleEdges} edges
          </Badge>
          {selectedNodes.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedNodes.size} selected
            </Badge>
          )}
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{currentGraph.modules.length} modules</span>
          <span>•</span>
          <span>{currentGraph.metrics.cycleCount} cycles</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleFitView}>
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Layout</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Export Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleExportPNG}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export PNG</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleExportSVG}>
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export SVG</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Quick Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Find Path (⌘K)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}