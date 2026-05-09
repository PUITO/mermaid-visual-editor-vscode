import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { CustomNode } from './CustomNode';
import { useDiagramStore, DiagramNode, DiagramEdge } from './store';
import { serializeToMermaid, parseFromMermaid, MermaidConfig } from './mermaidSerializer';

declare global {
  interface Window {
    vscode: any;
  }
}

const nodeTypes = {
  custom: CustomNode,
};

// VSCode 主题颜色接口
interface VsCodeThemeColors {
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
  toolbarBackground: string;
  buttonBackground: string;
  buttonForeground: string;
  buttonHoverBackground: string;
  editorBackground: string;
  editorForeground: string;
  panelHeaderBackground: string;
  panelHeaderForeground: string;
  errorForeground: string;
  errorBackground: string;
  errorBorder: string;
}

export function App() {
  const { nodes, edges, addNode, addEdge: storeAddEdge, updateNode, deleteNodes, deleteEdge, setNodes, setEdges } = useDiagramStore();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [themeColors, setThemeColors] = useState<VsCodeThemeColors | null>(null);
  
  const [config] = useState<MermaidConfig>({
    direction: 'TB',
    theme: 'default',
    handDrawn: false,
    curveStyle: 'basis',
  });

  // 获取 VSCode 主题颜色
  useEffect(() => {
    const getThemeColors = (): VsCodeThemeColors => {
      const style = getComputedStyle(document.documentElement);
      return {
        backgroundColor: style.getPropertyValue('--vscode-editor-background') || '#ffffff',
        foregroundColor: style.getPropertyValue('--vscode-editor-foreground') || '#000000',
        borderColor: style.getPropertyValue('--vscode-panel-border') || '#cccccc',
        toolbarBackground: style.getPropertyValue('--vscode-toolbar-background') || '#f3f3f3',
        buttonBackground: style.getPropertyValue('--vscode-button-background') || '#007acc',
        buttonForeground: style.getPropertyValue('--vscode-button-foreground') || '#ffffff',
        buttonHoverBackground: style.getPropertyValue('--vscode-button-hoverBackground') || '#0062a3',
        editorBackground: style.getPropertyValue('--vscode-editor-background') || '#ffffff',
        editorForeground: style.getPropertyValue('--vscode-editor-foreground') || '#000000',
        panelHeaderBackground: style.getPropertyValue('--vscode-panelSectionHeader-background') || '#e8e8e8',
        panelHeaderForeground: style.getPropertyValue('--vscode-panelSectionHeader-foreground') || '#000000',
        errorForeground: style.getPropertyValue('--vscode-errorForeground') || '#f00',
        errorBackground: style.getPropertyValue('--vscode-inputValidation-errorBackground') || '#f2dede',
        errorBorder: style.getPropertyValue('--vscode-inputValidation-errorBorder') || '#be1100',
      };
    };

    setThemeColors(getThemeColors());

    // 监听主题变化
    const handleThemeChange = () => {
      setThemeColors(getThemeColors());
    };

    // VSCode webview 会在主题变化时发送消息
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'themeChanged') {
        handleThemeChange();
        // 重新应用 Mermaid 主题
        if (window.vscode) {
          window.vscode.postMessage({ type: 'updateContent' });
        }
      }
    });

    return () => {
      // 清理监听器
    };
  }, []);

  // 根据 VSCode 主题设置 Mermaid 主题
  useEffect(() => {
    if (themeColors) {
      const isDark = themeColors.backgroundColor.startsWith('#1') || 
                     themeColors.backgroundColor.startsWith('#2') ||
                     themeColors.backgroundColor === 'rgb(30, 30, 30)' ||
                     parseInt(themeColors.backgroundColor.slice(1, 3), 16) < 100;
      
      // 更新配置
      config.theme = isDark ? 'dark' : 'default';
    }
  }, [themeColors, config]);

  // Sync store with React Flow
  useEffect(() => {
    setRfNodes(nodes as any);
  }, [nodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(edges.map(e => ({
      ...e,
      markerEnd: { type: MarkerType.ArrowClosed },
    })) as any);
  }, [edges, setRfEdges]);

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: DiagramEdge = {
        id: `edge-${Date.now()}`,
        source: params.source || '',
        target: params.target || '',
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        data: { type: 'default' },
      };
      storeAddEdge(newEdge);
      
      // Notify VSCode
      if (window.vscode) {
        window.vscode.postMessage({
          type: 'updateContent',
        });
      }
    },
    [storeAddEdge]
  );

  // Add node on double-click
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const newNode: DiagramNode = {
        id: `node-${Date.now()}`,
        position: {
          x: event.clientX - 100,
          y: event.clientY - 100,
        },
        data: { label: 'New Node', shape: 'rectangle' },
        type: 'custom',
      };
      addNode(newNode);
      
      if (window.vscode) {
        window.vscode.postMessage({
          type: 'updateContent',
        });
      }
    },
    [addNode]
  );

  // Delete selected nodes/edges
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          deleteNodes(selectedNodes.map(n => n.id));
          if (window.vscode) {
            window.vscode.postMessage({ type: 'updateContent' });
          }
        }
      }
      
      if (e.key === 'n' || e.key === 'N') {
        const newNode: DiagramNode = {
          id: `node-${Date.now()}`,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { label: 'New Node', shape: 'rectangle' },
          type: 'custom',
        };
        addNode(newNode);
        if (window.vscode) {
          window.vscode.postMessage({ type: 'updateContent' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, deleteNodes, addNode]);

  // Auto-layout using Dagre
  const autoLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: config.direction, nodesep: 80, ranksep: 80 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 75,
          y: nodeWithPosition.y - 25,
        },
      };
    });

    setNodes(layoutedNodes);
    
    if (window.vscode) {
      window.vscode.postMessage({ type: 'updateContent' });
    }
  }, [nodes, edges, config.direction, setNodes]);

  // Generate Mermaid syntax and send to VSCode
  useEffect(() => {
    try {
      const mermaidCode = serializeToMermaid(nodes, edges, config);
      setPreviewContent(mermaidCode);
      setError(null);
      
      if (window.vscode) {
        window.vscode.postMessage({
          type: 'updateContent',
          content: mermaidCode,
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [nodes, edges, config]);

  // Load initial content from VSCode
  useEffect(() => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'getContent' });
      
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.type === 'initContent' && message.content) {
          const parsed = parseFromMermaid(message.content);
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
        }
      });
    }
  }, [setNodes, setEdges]);

  // Toolbar actions
  const handleAddNode = () => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: 'New Node', shape: 'rectangle' },
      type: 'custom',
    };
    addNode(newNode);
  };

  const handleExportMmd = () => {
    const mermaidCode = serializeToMermaid(nodes, edges, config);
    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.mmd';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(previewContent);
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <button onClick={handleAddNode}>+ Add Node</button>
        <button onClick={autoLayout}>Auto Layout</button>
        <button onClick={handleCopySyntax}>Copy Syntax</button>
        <button onClick={handleExportMmd}>Export .mmd</button>
        <button onClick={() => setPreviewVisible(!previewVisible)}>
          {previewVisible ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      <div className="main-content">
        <div className="canvas-container">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDoubleClick={onPaneDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {previewVisible && (
          <div className="preview-panel">
            <div className="preview-header">Mermaid Syntax</div>
            <div className="preview-content">
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  {previewContent}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
