import { useGraphStore } from "@/store/graph-store";
import { ReportSummary } from "@/components/report/ReportSummary";
import { ReportCharts } from "@/components/report/ReportCharts";
import { ReportDetails } from "@/components/report/ReportDetails";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Report() {
  const navigate = useNavigate();
  const { currentGraph, metrics } = useGraphStore();

  const handleDownloadHTML = () => {
    if (!currentGraph) return;
    
    const htmlReport = generateHTMLReport(currentGraph, metrics);
    const blob = new Blob([htmlReport], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knit-graph-report.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    if (!currentGraph) return;
    
    const markdownReport = generateMarkdownReport(currentGraph, metrics);
    const blob = new Blob([markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knit-graph-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentGraph) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="glass p-8 text-center max-w-md">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Graph Loaded</h2>
          <p className="text-muted-foreground mb-4">
            Import a graph to generate comprehensive reports.
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
          <h1 className="text-3xl font-bold gradient-text">Graph Report</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis and exportable reports
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadMarkdown}>
            <Download className="h-4 w-4 mr-2" />
            Markdown
          </Button>
          <Button onClick={handleDownloadHTML} className="btn-hero">
            <Download className="h-4 w-4 mr-2" />
            HTML Report
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <ReportSummary graph={currentGraph} metrics={metrics} />
        <ReportCharts graph={currentGraph} metrics={metrics} />
        <ReportDetails graph={currentGraph} metrics={metrics} />
      </div>
    </div>
  );
}

function generateHTMLReport(graph: any, metrics: any): string {
  const timestamp = new Date().toLocaleString();
  
  return `<!DOCTYPE html>
<html>
<head>
    <title>KnitScope Dependency Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1f2937; }
        .metric-label { color: #6b7280; font-size: 0.9em; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>KnitScope Dependency Report</h1>
        <p>Generated: ${timestamp}</p>
    </div>
    
    <div class="metric-grid">
        <div class="metric-card">
            <div class="metric-value">${graph.metrics.nodeCount}</div>
            <div class="metric-label">Total Nodes</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${graph.metrics.edgeCount}</div>
            <div class="metric-label">Total Edges</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${graph.metrics.moduleCount}</div>
            <div class="metric-label">Modules</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${graph.metrics.cycleCount}</div>
            <div class="metric-label">Cycles</div>
        </div>
    </div>
    
    <h2>Node Breakdown</h2>
    <table>
        <tr><th>Type</th><th>Count</th></tr>
        <tr><td>Providers</td><td>${graph.nodes.filter((n: any) => n.kind === 'provider').length}</td></tr>
        <tr><td>Consumers</td><td>${graph.nodes.filter((n: any) => n.kind === 'consumer').length}</td></tr>
        <tr><td>Types</td><td>${graph.nodes.filter((n: any) => n.kind === 'type').length}</td></tr>
    </table>
</body>
</html>`;
}

function generateMarkdownReport(graph: any, metrics: any): string {
  const timestamp = new Date().toISOString();
  
  return `# KnitScope Dependency Report

Generated: ${timestamp}

## Summary

- **Total Nodes**: ${graph.metrics.nodeCount}
- **Total Edges**: ${graph.metrics.edgeCount}
- **Modules**: ${graph.metrics.moduleCount}
- **Cycles**: ${graph.metrics.cycleCount}
- **Max Depth**: ${graph.metrics.maxDepth}

## Node Breakdown

| Type | Count |
|------|-------|
| Providers | ${graph.nodes.filter((n: any) => n.kind === 'provider').length} |
| Consumers | ${graph.nodes.filter((n: any) => n.kind === 'consumer').length} |
| Types | ${graph.nodes.filter((n: any) => n.kind === 'type').length} |

## Modules

${graph.modules.map((module: string) => `- ${module}`).join('\n')}

## High Fan-In Nodes

${metrics?.highFanInNodes?.slice(0, 10).map((node: any) => `- ${node.nodeId} (${node.fanIn})`).join('\n') || 'None'}

## High Fan-Out Nodes

${metrics?.highFanOutNodes?.slice(0, 10).map((node: any) => `- ${node.nodeId} (${node.fanOut})`).join('\n') || 'None'}
`;
}