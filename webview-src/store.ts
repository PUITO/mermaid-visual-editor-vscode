import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

export interface DiagramNode extends Node {
  data: {
    label: string;
    shape?: string;
    style?: {
      fill?: string;
      stroke?: string;
      color?: string;
    };
  };
}

export interface DiagramEdge extends Edge {
  data?: {
    type?: string;
    label?: string;
  };
}

interface DiagramStore {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  selectedNodeId: string | null;
  
  // Actions
  addNode: (node: DiagramNode) => void;
  updateNode: (nodeId: string, data: Partial<DiagramNode['data']>) => void;
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  
  addEdge: (edge: DiagramEdge) => void;
  updateEdge: (edgeId: string, data: Partial<DiagramEdge['data']>) => void;
  deleteEdge: (edgeId: string) => void;
  
  setNodes: (nodes: DiagramNode[]) => void;
  setEdges: (edges: DiagramEdge[]) => void;
  
  setSelectedNode: (nodeId: string | null) => void;
  
  clearAll: () => void;
}

export const useDiagramStore = create<DiagramStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  
  updateNode: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),
  
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),
  
  deleteNodes: (nodeIds) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => !nodeIds.includes(n.id)),
      edges: state.edges.filter(
        (e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
      ),
      selectedNodeId: state.selectedNodeId && nodeIds.includes(state.selectedNodeId)
        ? null
        : state.selectedNodeId,
    })),
  
  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),
  
  updateEdge: (edgeId, data) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge
      ),
    })),
  
  deleteEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    })),
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  clearAll: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));
