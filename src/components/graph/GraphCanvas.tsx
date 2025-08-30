import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useGraphStore } from "@/store/graph-store";
import { RenderableNode, RenderableEdge } from "@/types/graph";

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  kind: string;
  module?: string;
  package?: string;
  owner?: string;
  provides?: string;
  requires?: string[];
  needs?: string;
  fanIn: number;
  fanOut: number;
  x?: number;
  y?: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  kind: string;
}

export function GraphCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { 
    currentGraph, 
    filters, 
    selectedNode, 
    setSelectedNode
  } = useGraphStore();
  
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentGraph || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter nodes based on current filters
    const filteredNodes = currentGraph.nodes.filter(node => {
      // Search filter
      if (filters.searchTerm && !node.label.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Node kind filter
      if (!filters.nodeKinds.has(node.kind)) {
        return false;
      }
      
      // Module filter
      if (filters.modules.size > 0 && node.module && !filters.modules.has(node.module)) {
        return false;
      }
      
      // Package filter
      if (filters.packages.size > 0 && node.package && !filters.packages.has(node.package)) {
        return false;
      }
      
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = currentGraph.edges.filter(edge => {
      // Edge kind filter
      if (!filters.edgeKinds.has(edge.kind)) {
        return false;
      }
      
      // Only include edges where both nodes are visible
      return filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target);
    });

    // Calculate node sizes based on text length
    const getNodeDimensions = (label: string) => {
      const padding = 20;
      const minWidth = 80;
      const minHeight = 40;
      const charWidth = 8;
      
      const textWidth = label.length * charWidth;
      const nodeWidth = Math.max(minWidth, textWidth + padding);
      const nodeHeight = minHeight;
      
      return { width: nodeWidth, height: nodeHeight };
    };

    // Create static grid layout
    const STANDARD_EDGE_DISTANCE = 200;
    const nodesPerRow = Math.ceil(Math.sqrt(filteredNodes.length));
    
    const nodes: D3Node[] = filteredNodes.map((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      return {
        ...node,
        x: (col + 1) * STANDARD_EDGE_DISTANCE,
        y: (row + 1) * STANDARD_EDGE_DISTANCE
      };
    });

    const links: D3Link[] = filteredEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      kind: edge.kind
    }));

    // Set up SVG
    svg.attr("width", dimensions.width)
       .attr("height", dimensions.height);

    // Add zoom behavior
    const g = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Add arrow markers for different edge types
    const defs = svg.append("defs");
    
    const arrowColors = {
      provides: "hsl(142, 76%, 36%)",
      requires: "hsl(24, 70%, 50%)",
      needs: "hsl(250, 84%, 54%)"
    };

    Object.entries(arrowColors).forEach(([kind, color]) => {
      defs.append("marker")
        .attr("id", `arrow-${kind}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 50)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    });

    // Draw edges
    const linkGroup = g.append("g").attr("class", "links");
    
    const link = linkGroup.selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", d => getEdgeColor(d.kind))
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => getEdgeStyle(d.kind))
      .attr("marker-end", d => `url(#arrow-${d.kind})`);

    // Draw nodes
    const nodeGroup = g.append("g").attr("class", "nodes");
    
    const node = nodeGroup.selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", handleNodeClick)
      .on("mouseenter", handleNodeMouseEnter)
      .on("mouseleave", handleNodeMouseLeave);

    // Add node shapes based on type
    node.each(function(d) {
      const selection = d3.select(this);
      const isSelected = selectedNode === d.id;
      const isHighlighted = highlightedNodes?.has(d.id) || false;
      const dimensions = getNodeDimensions(d.label);
      
      const strokeColor = isSelected ? "hsl(250, 84%, 54%)" : "hsl(var(--border))";
      const strokeWidth = isSelected ? 4 : 2;
      const opacity = isHighlighted ? 1 : 0.9;
      
      if (d.kind === "type") {
        const radius = Math.max(dimensions.width, dimensions.height) / 2;
        selection.append("circle")
          .attr("r", radius)
          .attr("fill", "hsl(250, 84%, 54%)")
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      } else if (d.kind === "provider") {
        selection.append("rect")
          .attr("width", dimensions.width)
          .attr("height", dimensions.height)
          .attr("x", -dimensions.width / 2)
          .attr("y", -dimensions.height / 2)
          .attr("rx", 5)
          .attr("fill", "hsl(142, 76%, 36%)")
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      } else if (d.kind === "consumer") {
        const halfWidth = dimensions.width / 2;
        const halfHeight = dimensions.height / 2;
        selection.append("path")
          .attr("d", `M-${halfWidth},-${halfHeight} L${halfWidth-10},-${halfHeight} L${halfWidth},0 L${halfWidth-10},${halfHeight} L-${halfWidth},${halfHeight} L-${halfWidth-10},0 Z`)
          .attr("fill", "hsl(24, 70%, 50%)")
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      }
    });

    // Add node labels
    node.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "white")
      .style("pointer-events", "none")
      .text(d => d.label);

    // Add tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "hsl(var(--background))")
      .style("border", "1px solid hsl(var(--border))")
      .style("border-radius", "6px")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 6px -1px rgb(0 0 0 / 0.1)");

    // Set static positions for nodes and edges
    link
      .attr("x1", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return sourceNode?.x || 0;
      })
      .attr("y1", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return sourceNode?.y || 0;
      })
      .attr("x2", d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode?.x || 0;
      })
      .attr("y2", d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode?.y || 0;
      });

    node.attr("transform", d => `translate(${d.x},${d.y})`);

    function handleNodeClick(event: MouseEvent, d: D3Node) {
      event.stopPropagation();
      setSelectedNode(selectedNode === d.id ? null : d.id);
    }

    function handleNodeMouseEnter(event: MouseEvent, d: D3Node) {
      // Highlight connected nodes
      const connectedNodes = new Set([d.id]);
      links.forEach(link => {
        const sourceId = typeof link.source === "string" ? link.source : link.source.id;
        const targetId = typeof link.target === "string" ? link.target : link.target.id;
        
        if (sourceId === d.id) connectedNodes.add(targetId);
        if (targetId === d.id) connectedNodes.add(sourceId);
      });
      
      setHighlightedNodes(connectedNodes);

      // Show tooltip
      tooltip
        .style("visibility", "visible")
        .html(`
          <div class="font-semibold">${d.label}</div>
          <div class="text-sm text-muted-foreground mt-1">
            <div>Type: ${d.kind}</div>
            ${d.module ? `<div>Module: ${d.module}</div>` : ""}
            ${d.package ? `<div>Package: ${d.package}</div>` : ""}
            <div>Fan-in: ${d.fanIn} | Fan-out: ${d.fanOut}</div>
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    }

    function handleNodeMouseLeave() {
      setHighlightedNodes(new Set());
      tooltip.style("visibility", "hidden");
    }

    // Cleanup function
    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };

  }, [currentGraph, filters, dimensions, selectedNode, highlightedNodes, setSelectedNode, setHighlightedNodes]);

  return (
    <div className="w-full h-full relative">
      <svg 
        ref={svgRef} 
        className="w-full h-full bg-background border border-border rounded-lg"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}

function getEdgeColor(kind: string): string {
  switch (kind) {
    case "provides":
      return "hsl(142, 76%, 36%)";
    case "requires":
      return "hsl(24, 70%, 50%)";
    case "needs":
      return "hsl(250, 84%, 54%)";
    default:
      return "hsl(var(--muted-foreground))";
  }
}

function getEdgeStyle(kind: string): string {
  switch (kind) {
    case "provides":
      return "none"; // solid
    case "requires":
      return "5,5"; // dashed
    case "needs":
      return "2,3"; // dotted
    default:
      return "none";
  }
}