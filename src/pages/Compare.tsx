import { useCompareStore } from "@/store/compare-store";
import { CompareUpload } from "@/components/compare/CompareUpload";
import { DiffVisualization } from "@/components/compare/DiffVisualization";
import { DiffMetrics } from "@/components/compare/DiffMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCompare, Download } from "lucide-react";

export default function Compare() {
  const { baselineGraph, candidateGraph, diff } = useCompareStore();

  const handleExportReport = () => {
    if (!diff) return;
    
    // Generate markdown report
    const report = generateMarkdownReport(diff);
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph-diff-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Graph Comparison</h1>
          <p className="text-muted-foreground mt-2">
            Compare two dependency graphs to identify changes and impacts
          </p>
        </div>
        
        {diff && (
          <Button onClick={handleExportReport} className="btn-hero">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompareUpload
          type="baseline"
          title="Baseline Graph"
          description="The original/baseline dependency graph"
          hasGraph={!!baselineGraph}
        />
        
        <CompareUpload
          type="candidate"
          title="Candidate Graph"
          description="The new/candidate dependency graph"
          hasGraph={!!candidateGraph}
        />
      </div>

      {/* Diff Results */}
      {diff ? (
        <div className="space-y-6">
          <DiffMetrics diff={diff} />
          <DiffVisualization diff={diff} />
        </div>
      ) : baselineGraph && candidateGraph ? (
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <CardTitle>Ready to Compare</CardTitle>
            </div>
            <CardDescription>
              Both graphs are loaded. The comparison will be computed automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upload Both Graphs</h3>
            <p className="text-muted-foreground">
              Upload both baseline and candidate graphs to see the comparison
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generateMarkdownReport(diff: any): string {
  const timestamp = new Date().toISOString();
  
  return `# Graph Comparison Report

Generated: ${timestamp}

## Summary

- **Added Nodes**: ${diff.addedNodes.length}
- **Removed Nodes**: ${diff.removedNodes.length}
- **Changed Nodes**: ${diff.changedNodes.length}
- **Added Edges**: ${diff.addedEdges.length}
- **Removed Edges**: ${diff.removedEdges.length}

## Metrics Delta

- **Node Count**: ${diff.metricsDelta.nodeCountDelta >= 0 ? '+' : ''}${diff.metricsDelta.nodeCountDelta}
- **Edge Count**: ${diff.metricsDelta.edgeCountDelta >= 0 ? '+' : ''}${diff.metricsDelta.edgeCountDelta}
- **Cycle Count**: ${diff.metricsDelta.cycleCountDelta >= 0 ? '+' : ''}${diff.metricsDelta.cycleCountDelta}
- **Max Depth**: ${diff.metricsDelta.maxDepthDelta >= 0 ? '+' : ''}${diff.metricsDelta.maxDepthDelta}

## Added Nodes

${diff.addedNodes.map((node: any) => `- ${node.id} (${node.kind})`).join('\n')}

## Removed Nodes

${diff.removedNodes.map((node: any) => `- ${node.id} (${node.kind})`).join('\n')}

## Added Edges

${diff.addedEdges.map((edge: any) => `- ${edge.source} → ${edge.target} (${edge.kind})`).join('\n')}

## Removed Edges

${diff.removedEdges.map((edge: any) => `- ${edge.source} → ${edge.target} (${edge.kind})`).join('\n')}
`;
}