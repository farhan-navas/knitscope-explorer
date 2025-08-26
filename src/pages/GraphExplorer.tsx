import { useEffect } from "react";
import { useGraphStore } from "@/store/graph-store";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { FilterSidebar } from "@/components/graph/FilterSidebar";
import { DetailsSidebar } from "@/components/graph/DetailsSidebar";
import { GraphToolbar } from "@/components/graph/GraphToolbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GraphExplorer() {
  const navigate = useNavigate();
  const { currentGraph } = useGraphStore();

  useEffect(() => {
    // Load demo graph if no graph is loaded
    if (!currentGraph) {
      import("@/data/demo-graph.json").then((demoData) => {
        useGraphStore.getState().loadGraph(demoData.default);
      });
    }
  }, [currentGraph]);

  if (!currentGraph) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="glass p-8 text-center max-w-md">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Graph Loaded</h2>
          <p className="text-muted-foreground mb-4">
            Import a knit-graph.json file to start exploring dependencies.
          </p>
          <Button onClick={() => navigate("/")} className="btn-hero">
            Import Graph
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - Filters */}
      <div className="w-80 flex-shrink-0">
        <FilterSidebar />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 flex flex-col gap-4">
        <GraphToolbar />
        <div className="flex-1 graph-card">
          <GraphCanvas />
        </div>
      </div>

      {/* Right Sidebar - Details */}
      <div className="w-80 flex-shrink-0">
        <DetailsSidebar />
      </div>
    </div>
  );
}