import { useEffect, useRef } from "react";
import cytoscape, { Core, EdgeSingular, NodeSingular } from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { useGraphStore } from "@/store/graph-store";
import { RenderableNode, RenderableEdge } from "@/types/graph";

// Register layout
cytoscape.use(coseBilkent);

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { currentGraph, selectedNodes, filters, toggleNodeSelection } = useGraphStore();

  useEffect(() => {
    if (!containerRef.current || !currentGraph) return;

    // Filter nodes and edges based on current filters
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

    // Convert to Cytoscape format
    const elements: any[] = [
      ...filteredNodes.map(nodeToElement),
      ...filteredEdges.map(edgeToElement),
    ];

    // Create compound nodes for clustering
    if (filters.showClusters.byModule) {
      const moduleNodes = Array.from(new Set(filteredNodes
        .map(n => n.module)
        .filter(Boolean)
      )).map(module => ({
        data: {
          id: `module-${module}`,
          label: module as string,
        },
        classes: 'module-cluster',
      }));
      
      elements.unshift(...moduleNodes);
      
      // Update node elements to have parent
      filteredNodes.forEach(node => {
        if (node.module) {
          const elementIndex = elements.findIndex(el => el.data.id === node.id);
          if (elementIndex >= 0) {
            elements[elementIndex].data.parent = `module-${node.module}`;
          }
        }
      });
    }

    // Destroy existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Create new Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: getCytoscapeStyle(),
      layout: {
        name: 'cose-bilkent',
        animationDuration: 1000,
        fit: true,
        padding: 50,
        nodeRepulsion: 4500,
        idealEdgeLength: 50,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.4,
        numIter: 2500,
        tile: true,
        randomize: false,
      } as any,
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    cyRef.current = cy;

    // Event handlers
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeId = node.id();
      
      // Don't select cluster nodes
      if (node.hasClass('module-cluster')) return;
      
      toggleNodeSelection(nodeId);
    });

    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      if (!node.hasClass('module-cluster')) {
        node.addClass('highlighted');
        // Highlight connected edges
        node.connectedEdges().addClass('highlighted');
      }
    });

    cy.on('mouseout', 'node', (event) => {
      const node = event.target;
      node.removeClass('highlighted');
      node.connectedEdges().removeClass('highlighted');
    });

    // Update selection styling
    updateSelectionStyling(cy, selectedNodes);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [currentGraph, filters, selectedNodes, toggleNodeSelection]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full graph-canvas"
      style={{ minHeight: '500px' }}
    />
  );
}

function nodeToElement(node: RenderableNode) {
  return {
    data: {
      id: node.id,
      label: node.label,
      type: node.kind,
      module: node.module,
      package: node.package,
      owner: node.owner,
      fanIn: node.fanIn,
      fanOut: node.fanOut,
    },
    classes: `node-${node.kind}`,
  };
}

function edgeToElement(edge: RenderableEdge) {
  return {
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.kind,
    },
    classes: `edge-${edge.kind}`,
  };
}

function updateSelectionStyling(cy: Core, selectedNodes: Set<string>) {
  // Remove previous selection styling
  cy.nodes().removeClass('selected');
  
  // Add selection styling to selected nodes
  selectedNodes.forEach(nodeId => {
    const node = cy.getElementById(nodeId);
    if (node.length > 0) {
      node.addClass('selected');
    }
  });
}

function getCytoscapeStyle(): any[] {
  return [
    // Node styles
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        'font-family': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        'color': '#374151',
        'background-color': '#f3f4f6',
        'border-width': '2px',
        'border-color': '#d1d5db',
        'width': '60px',
        'height': '40px',
        'shape': 'roundrectangle',
        'text-max-width': '80px',
        'text-wrap': 'wrap',
        'overlay-padding': '4px',
      }
    },
    
    // Provider nodes
    {
      selector: '.node-provider',
      style: {
        'background-color': 'hsl(142, 76%, 36%)',
        'border-color': 'hsl(142, 76%, 30%)',
        'color': 'white',
        'shape': 'roundrectangle',
      }
    },
    
    // Consumer nodes  
    {
      selector: '.node-consumer',
      style: {
        'background-color': 'hsl(24, 70%, 50%)',
        'border-color': 'hsl(24, 70%, 40%)',
        'color': 'white',
        'shape': 'cut-rectangle',
      }
    },
    
    // Type nodes
    {
      selector: '.node-type',
      style: {
        'background-color': 'hsl(250, 84%, 54%)',
        'border-color': 'hsl(250, 84%, 44%)',
        'color': 'white',
        'shape': 'ellipse',
        'width': '50px',
        'height': '50px',
      }
    },
    
    // Module cluster nodes
    {
      selector: '.module-cluster',
      style: {
        'background-color': 'rgba(250, 84, 54, 0.1)',
        'border-color': 'hsl(250, 84%, 54%)',
        'border-width': '2px',
        'border-style': 'dashed',
        'label': 'data(label)',
        'font-size': '14px',
        'font-weight': 'bold',
        'color': 'hsl(250, 84%, 54%)',
        'text-valign': 'top',
        'text-margin-y': '10px',
        'shape': 'roundrectangle',
      }
    },

    // Edge styles
    {
      selector: 'edge',
      style: {
        'width': '2px',
        'line-color': '#9ca3af',
        'target-arrow-color': '#9ca3af',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.2,
      }
    },
    
    // Provides edges
    {
      selector: '.edge-provides',
      style: {
        'line-color': 'hsl(142, 76%, 36%)',
        'target-arrow-color': 'hsl(142, 76%, 36%)',
        'line-style': 'solid',
      }
    },
    
    // Requires edges
    {
      selector: '.edge-requires',
      style: {
        'line-color': 'hsl(24, 70%, 50%)',
        'target-arrow-color': 'hsl(24, 70%, 50%)',
        'line-style': 'dashed',
      }
    },
    
    // Needs edges
    {
      selector: '.edge-needs',
      style: {
        'line-color': 'hsl(250, 84%, 54%)',
        'target-arrow-color': 'hsl(250, 84%, 54%)',
        'line-style': 'dotted',
      }
    },

    // Hover states
    {
      selector: 'node:active, node.highlighted',
      style: {
        'overlay-color': 'hsl(250, 84%, 54%)',
        'overlay-opacity': 0.3,
        'border-width': '3px',
      }
    },
    
    {
      selector: 'edge.highlighted',
      style: {
        'width': '4px',
        'z-index': 999,
      }
    },

    // Selection states
    {
      selector: 'node.selected',
      style: {
        'border-width': '4px',
        'border-color': 'hsl(250, 84%, 54%)',
        'box-shadow': '0 0 20px hsl(250, 84%, 54%)',
      }
    },
  ];
}