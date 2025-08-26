import { useGraphStore } from "@/store/graph-store";
import { CyclesPanel } from "@/components/analysis/CyclesPanel";
import { MetricsPanel } from "@/components/analysis/MetricsPanel";
import { SmellsPanel } from "@/components/analysis/SmellsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Analysis() {
  const navigate = useNavigate();
  const { currentGraph, metrics } = useGraphStore();

  if (!currentGraph) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="glass p-8 text-center max-w-md">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Graph Loaded</h2>
          <p className="text-muted-foreground mb-4">
            Import a graph to analyze cycles, metrics, and dependency smells.
          </p>
          <Button onClick={() => navigate("/")} className="btn-hero">
            Import Graph
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Graph Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Analyze dependency cycles, metrics, and potential code smells
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/graph")}>
            View Graph
          </Button>
          <Button onClick={() => navigate("/report")} className="btn-hero">
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cycles Analysis */}
        <div className="space-y-4">
          <CyclesPanel />
        </div>

        {/* Metrics & Smells */}
        <div className="space-y-4">
          <MetricsPanel />
          <SmellsPanel />
        </div>
      </div>
    </div>
  );
}