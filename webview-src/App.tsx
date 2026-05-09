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
import { ContextMenu } from './ContextMenu';
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
  
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  
  const [config] = useState<MermaidConfig>({
    direction: 'TB',
    theme: 'default',
    handDrawn: false,
    curveStyle: 'basis',
  });

  // 自动布局函数（独立函数，避免循环依赖）
  const applyAutoLayout = useCallback((currentNodes: any[], currentEdges: any[], direction: string) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 80 });

    currentNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    currentEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = currentNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 75,
          y: nodeWithPosition.y - 25,
        },
      };
    });

    return layoutedNodes;
  }, []);

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
      
      // 连接后自动布局
      // 使用 setTimeout 确保状态更新后再计算布局
      setTimeout(() => {
         // 这里直接调用 layout 逻辑，或者依赖 nodes/edges 变化触发的效果
         // 由于 autoLayout 依赖 nodes 和 edges，而 storeAddEdge 是异步更新 store
         // 最好是在 store 更新后，由监听 nodes/edges 变化的 useEffect 或者手动触发
         // 为了保持简单，我们这里不直接调用 autoLayout，而是依赖用户手动点击或后续优化
         // 但如果需要自动，可以稍后触发。注意：直接调用 autoLayout 可能拿到旧状态。
         // 更好的方式：在 storeAddEdge 后，由于 rfNodes/rfEdges 是由 store nodes/edges 同步过来的
         // 我们可以尝试在下一次 tick 执行
      }, 50);

      if (window.vscode) {
        window.vscode.postMessage({ type: 'updateContent' });
      }
    },
    [storeAddEdge]
  );

  // Add node on double-click (only when clicking on empty canvas)
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Check if the click target is the pane background, not a node
      const target = event.target as HTMLElement;
      if (!target.closest('.react-flow__node')) {
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
      }
    },
    [addNode]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          deleteNodes(selectedNodes.map(n => n.id));
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, deleteNodes, addNode]);

  // Auto-layout using Dagre
  const autoLayout = useCallback(() => {
    const layoutedNodes = applyAutoLayout(nodes, edges, config.direction);
    setNodes(layoutedNodes);
    
    if (window.vscode) {
      window.vscode.postMessage({ type: 'updateContent' });
    }
  }, [nodes, edges, config.direction, setNodes, applyAutoLayout]);

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

  // Load initial content from VSCode and apply auto layout
  useEffect(() => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'getContent' });
      
      const handleMessage = (event: MessageEvent) => {
        const message = event.data;
        if (message.type === 'initContent' && message.content) {
          const parsed = parseFromMermaid(message.content);
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          
          // 延迟应用自动布局，确保节点已设置
          setTimeout(() => {
            // 触发自动布局
            const dagreGraph = new dagre.graphlib.Graph();
            dagreGraph.setDefaultEdgeLabel(() => ({}));
            dagreGraph.setGraph({ rankdir: config.direction, nodesep: 80, ranksep: 80 });

            parsed.nodes.forEach((node: DiagramNode) => {
              dagreGraph.setNode(node.id, { width: 150, height: 50 });
            });

            parsed.edges.forEach((edge: DiagramEdge) => {
              dagreGraph.setEdge(edge.source, edge.target);
            });

            dagre.layout(dagreGraph);

            const layoutedNodes = parsed.nodes.map((node: DiagramNode) => {
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
          }, 100);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [setNodes, setEdges, config.direction]);

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

  // 右键菜单处理
  const onNodeContextMenu = useCallback(
    (event: any, node: DiagramNode) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const handleColorChange = useCallback(
    (color: string) => {
      if (contextMenu?.nodeId) {
        // 获取当前节点的现有样式
        const currentNode = nodes.find(n => n.id === contextMenu.nodeId);
        const currentStyle = currentNode?.data.style || {};
        
        updateNode(contextMenu.nodeId, {
          style: {
            ...currentStyle,  // 保留现有样式
            fill: color || undefined,  // 只更新 fill
          },
        });
        // 立即同步触发保存，避免关闭文件时内容丢失
        if (window.vscode) {
          requestAnimationFrame(() => {
            window.vscode.postMessage({ type: 'updateContent' });
          });
        }
      }
    },
    [contextMenu, updateNode, nodes]
  );

  const handleShapeChange = useCallback(
    (shape: string) => {
      if (contextMenu?.nodeId) {
        updateNode(contextMenu.nodeId, { shape });
        // 立即同步触发保存，避免关闭文件时内容丢失
        if (window.vscode) {
          requestAnimationFrame(() => {
            window.vscode.postMessage({ type: 'updateContent' });
          });
        }
      }
    },
    [contextMenu, updateNode]
  );

  const handleDeleteNode = useCallback(() => {
    if (contextMenu?.nodeId) {
      deleteNodes([contextMenu.nodeId]);
      // 立即同步触发保存，避免关闭文件时内容丢失
      if (window.vscode) {
        requestAnimationFrame(() => {
          window.vscode.postMessage({ type: 'updateContent' });
        });
      }
    }
  }, [contextMenu, deleteNodes]);

  // 处理边框颜色变化
  const handleStrokeChange = useCallback(
    (stroke: string) => {
      if (contextMenu?.nodeId) {
        // 获取当前节点的现有样式
        const currentNode = nodes.find(n => n.id === contextMenu.nodeId);
        const currentStyle = currentNode?.data.style || {};
        
        updateNode(contextMenu.nodeId, {
          style: {
            ...currentStyle,  // 保留现有样式
            stroke: stroke || undefined,  // 只更新 stroke
          },
        });
        // 立即同步触发保存，避免关闭文件时内容丢失
        if (window.vscode) {
          requestAnimationFrame(() => {
            window.vscode.postMessage({ type: 'updateContent' });
          });
        }
      }
    },
    [contextMenu, updateNode, nodes]
  );

  // 处理文字颜色变化
  const handleTextColorChange = useCallback(
    (textColor: string) => {
      if (contextMenu?.nodeId) {
        // 获取当前节点的现有样式
        const currentNode = nodes.find(n => n.id === contextMenu.nodeId);
        const currentStyle = currentNode?.data.style || {};
        
        updateNode(contextMenu.nodeId, {
          style: {
            ...currentStyle,  // 保留现有样式
            color: textColor || undefined,  // 只更新 color
          },
        });
        // 立即同步触发保存，避免关闭文件时内容丢失
        if (window.vscode) {
          requestAnimationFrame(() => {
            window.vscode.postMessage({ type: 'updateContent' });
          });
        }
      }
    },
    [contextMenu, updateNode, nodes]
  );

  return (
    <div className="app-container">
      <div className="toolbar">
        <button onClick={handleAddNode}>+ Add Node</button>
        <button onClick={autoLayout} title="重新排列节点">Auto Layout</button>
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
            onNodeContextMenu={onNodeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
          
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              nodeId={contextMenu.nodeId}
              onClose={() => setContextMenu(null)}
              onColorChange={handleColorChange}
              onStrokeChange={handleStrokeChange}
              onTextColorChange={handleTextColorChange}
              onShapeChange={handleShapeChange}
              onDelete={handleDeleteNode}
            />
          )}
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
