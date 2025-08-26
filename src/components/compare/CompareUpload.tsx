import { useCallback } from "react";
import { useCompareStore } from "@/store/compare-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompareUploadProps {
  type: "baseline" | "candidate";
  title: string;
  description: string;
  hasGraph: boolean;
}

export function CompareUpload({ type, title, description, hasGraph }: CompareUploadProps) {
  const { setBaselineGraph, setCandidateGraph } = useCompareStore();
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const graphData = JSON.parse(content);
        
        if (type === "baseline") {
          setBaselineGraph(graphData);
        } else {
          setCandidateGraph(graphData);
        }
        
        toast({
          title: "Graph loaded",
          description: `${title} has been loaded successfully`,
        });
      } catch (error) {
        toast({
          title: "Parse error",
          description: "Failed to parse JSON file",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  }, [type, setBaselineGraph, setCandidateGraph, title, toast]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      handleFileUpload({ target: input } as any);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const clearGraph = () => {
    if (type === "baseline") {
      useCompareStore.getState().setBaselineGraph(null as any);
    } else {
      useCompareStore.getState().setCandidateGraph(null as any);
    }
    
    toast({
      title: "Graph cleared",
      description: `${title} has been cleared`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {hasGraph && (
            <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Loaded
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasGraph ? (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/50"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upload Graph JSON</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your knit-graph.json file here, or click to browse
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor={`file-${type}`} className="sr-only">
                  Upload {title}
                </Label>
                <Input
                  id={`file-${type}`}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Supported format: JSON files from Knit DI scanner
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Graph Loaded</h3>
            <p className="text-muted-foreground mb-4">
              {title} is ready for comparison
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={clearGraph}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}