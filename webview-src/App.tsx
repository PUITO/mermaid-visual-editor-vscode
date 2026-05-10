import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import mermaid from 'mermaid';

import { CustomNode } from './CustomNode';
import { ContextMenu } from './ContextMenu';
import { useDiagramStore, DiagramNode, DiagramEdge } from './store';
import { serializeToMermaid, parseFromMermaid, MermaidConfig } from './mermaidSerializer';
import { initializeDiagramRegistry, diagramRegistry } from './diagrams';
import { ERDiagramEditor } from './diagrams/erDiagram/editor';
import { SequenceDiagramEditor } from './diagrams/sequence/editor';
import { ClassDiagramHandler } from './diagrams/classDiagram/handler';
import { StateDiagramHandler } from './diagrams/stateDiagram/handler';
import { GanttHandler } from './diagrams/gantt/handler';
import { PieChartHandler } from './diagrams/pieChart/handler';

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
  const { nodes, edges, addNode, addEdge: storeAddEdge, updateNode, updateEdge, deleteNodes, deleteEdge, setNodes, setEdges } = useDiagramStore();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [themeColors, setThemeColors] = useState<VsCodeThemeColors | null>(null);
  const [diagramType, setDiagramType] = useState<string>('flowchart');
  
  // Mermaid 渲染相关
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const [mermaidSvg, setMermaidSvg] = useState<string>('');
  const [mermaidError, setMermaidError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 标记是否为原始内容（防止非 flowchart 类型被覆盖）
  const isOriginalContentRef = useRef<boolean>(false);
  
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string; edgeId?: string } | null>(null);
  
  const [config] = useState<MermaidConfig>({
    direction: 'TB',
    theme: 'default',
    handDrawn: false,
    curveStyle: 'basis',
    diagramType: 'flowchart',  // Mermaid 10+ 推荐使用 flowchart
  });

  // 初始化图表注册表
  useEffect(() => {
    initializeDiagramRegistry();
  }, []);

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
        // 主题变化不需要发送 updateContent，因为内容没有改变
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

  // Auto-layout using Dagre - define early so it can be used by onConnect
  const autoLayout = useCallback(() => {
    const layoutedNodes = applyAutoLayout(nodes, edges, config.direction);
    setNodes(layoutedNodes);
    // 不需要手动触发保存，useEffect 会自动监听 nodes 变化并保存
  }, [nodes, edges, config.direction, setNodes, applyAutoLayout]);

  // Handle connections with auto layout
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: DiagramEdge = {
        id: `edge-${Date.now()}`,
        source: params.source || '',
        target: params.target || '',
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        data: { 
          type: 'default',
          // 查找源节点和目标节点的originalId
          originalSourceId: nodes.find(n => n.id === params.source)?.data.originalId || params.source,
          originalTargetId: nodes.find(n => n.id === params.target)?.data.originalId || params.target,
        },
      };
      storeAddEdge(newEdge);
      
      // 连接后自动布局
      setTimeout(() => autoLayout(), 50);
      
      // 不需要手动触发保存，useEffect 会自动监听 edges 变化并保存
    },
    [storeAddEdge, autoLayout, nodes]
  );

  // Add node on double-click (only when clicking on empty canvas)
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Check if the click target is the pane background, not a node
      const target = event.target as HTMLElement;
      if (!target.closest('.react-flow__node')) {
        const newId = `node-${Date.now()}`;
        const newNode: DiagramNode = {
          id: newId,
          position: {
            x: event.clientX - 100,
            y: event.clientY - 100,
          },
          data: { 
            label: 'New Node', 
            shape: 'rectangle',
            originalId: newId,  // 新增节点使用内部ID作为originalId
          },
          type: 'custom',
        };
        addNode(newNode);
        
        // 添加节点后不需要立即发送 updateContent，useEffect 会自动处理
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
          // 删除后自动布局
          setTimeout(() => autoLayout(), 50);
        }
      }
      
      if (e.key === 'n' || e.key === 'N') {
        const newId = `node-${Date.now()}`;
        const newNode: DiagramNode = {
          id: newId,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { 
            label: 'New Node', 
            shape: 'rectangle',
            originalId: newId,  // 新增节点使用内部ID作为originalId
          },
          type: 'custom',
        };
        addNode(newNode);
        // 添加后自动布局
        setTimeout(() => autoLayout(), 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, deleteNodes, addNode, autoLayout]);

  // Generate Mermaid syntax and send to VSCode
  useEffect(() => {
    // 对于非 flowchart 类型，绝对不要序列化 nodes/edges（它们是空的）
    if (diagramType !== 'flowchart') {
      console.log('[App] Skipping serialization for non-flowchart type:', diagramType);
      return;
    }
    
    // 防止空 nodes/edges 覆盖内容
    if (nodes.length === 0 && edges.length === 0) {
      console.log('[App] Skipping serialization for empty nodes/edges');
      return;
    }
    
    try {
      const mermaidCode = serializeToMermaid(nodes, edges, config);
      console.log('[App] Serialized flowchart:', mermaidCode.substring(0, 50));
      setPreviewContent(mermaidCode);
      setError(null);
      
      if (window.vscode) {
        window.vscode.postMessage({
          type: 'updateContent',
          content: mermaidCode,
        });
      }
    } catch (err: any) {
      console.error('[App] Serialization error:', err);
      setError(err.message);
    }
  }, [nodes, edges, config, diagramType]);

  // 监听节点和边的变化，立即触发保存（防止快速关闭时内容丢失）
  useEffect(() => {
    // 对于非 flowchart 类型，不处理 nodes/edges 变化
    if (diagramType !== 'flowchart') {
      return;
    }
    
    if (nodes.length === 0 && edges.length === 0) {
      return; // 初始状态，不触发保存
    }
    
    // 使用 requestAnimationFrame 确保在下一渲染帧前执行
    if (window.vscode) {
      requestAnimationFrame(() => {
        try {
          const mermaidCode = serializeToMermaid(nodes, edges, config);
          window.vscode.postMessage({
            type: 'updateContent',
            content: mermaidCode,
          });
        } catch (err) {
          console.error('Failed to save on change:', err);
        }
      });
    }
  }, [nodes, edges, config, diagramType]);

  // Mermaid 渲染：对于不支持可视化的图表类型，使用 Mermaid 直接渲染
  useEffect(() => {
    const shouldRenderWithMermaid = ['classDiagram', 'stateDiagram', 'gantt', 'pie'].includes(diagramType);
    
    if (!shouldRenderWithMermaid || !previewContent) {
      setMermaidSvg('');
      setIsRendering(false);
      return;
    }

    // 清除之前的定时器（防抖）
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // 设置加载状态
    setIsRendering(true);

    // 防抖延迟 300ms
    renderTimeoutRef.current = setTimeout(async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: themeColors ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'var(--vscode-font-family, sans-serif)',
        });

        const { svg } = await mermaid.render(`mermaid-${diagramType}-${Date.now()}`, previewContent);
        setMermaidSvg(svg);
        setMermaidError(null);
        setIsRendering(false);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setMermaidError(err.message || 'Failed to render diagram');
        setMermaidSvg('');
        setIsRendering(false);
      }
    }, 300);

    // 清理函数
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [previewContent, diagramType, themeColors]);

  // Load initial content from VSCode and apply auto layout
  useEffect(() => {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'getContent' });
      
      const handleMessage = (event: MessageEvent) => {
        const message = event.data;
        if (message.type === 'initContent' && message.content) {
          // 使用注册表检测图表类型
          const handler = diagramRegistry.getHandler(message.content);
          setDiagramType(handler.type);
          
          console.log('Detected diagram type:', handler.type);
          
          // 根据图表类型解析
          if (handler.type === 'flowchart') {
            const parsed = parseFromMermaid(message.content);
            setNodes(parsed.nodes);
            setEdges(parsed.edges);
            
            // 延迟应用自动布局，确保节点已设置
            setTimeout(() => {
              // 触发自动布局
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
              
              // 布局完成后，useEffect 会自动序列化并发送 updateContent
              // 不需要手动发送
            }, 100);
          } else {
            // 对于其他图表类型，保留原始内容用于预览和保存
            setPreviewContent(message.content);
            setError(null); // 清除错误，因为这不是错误状态
          }
        }
        
        // 处理保存请求（关闭前触发）
        if (message.type === 'requestSave') {
          try {
            let mermaidCode = '';
            
            console.log('[App] requestSave triggered, diagramType:', diagramType);
            console.log('[App] previewContent length:', previewContent?.length);
            console.log('[App] previewContent preview:', previewContent?.substring(0, 100));
            
            // 根据图表类型使用相应的处理器
            if (diagramType === 'flowchart') {
              console.log('[App] Serializing flowchart');
              mermaidCode = serializeToMermaid(nodes, edges, config);
            } else {
              // 对于其他类型，直接使用预览内容
              console.log('[App] Using previewContent for non-flowchart');
              mermaidCode = previewContent;
            }
            
            console.log('[App] Saving content, length:', mermaidCode?.length);
            console.log('[App] Content preview:', mermaidCode?.substring(0, 100));
            
            if (window.vscode) {
              window.vscode.postMessage({
                type: 'saveContent',
                content: mermaidCode,
              });
            }
          } catch (err: any) {
            console.error('[App] Failed to serialize content:', err);
            if (window.vscode) {
              window.vscode.postMessage({
                type: 'saveContent',
                content: previewContent,
              });
            }
          }
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
    const newId = `node-${Date.now()}`;
    const newNode: DiagramNode = {
      id: newId,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { 
        label: 'New Node', 
        shape: 'rectangle',
        originalId: newId,  // 新增节点使用内部ID作为originalId
      },
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

  const onEdgeContextMenu = useCallback(
    (event: any, edge: DiagramEdge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
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
        // 不需要手动触发保存，useEffect 会自动监听 nodes 变化并保存
      }
    },
    [contextMenu, updateNode, nodes]
  );

  const handleShapeChange = useCallback(
    (shape: string) => {
      if (contextMenu?.nodeId) {
        updateNode(contextMenu.nodeId, { shape });
        // 不需要手动触发保存，useEffect 会自动监听 nodes 变化并保存
      }
    },
    [contextMenu, updateNode]
  );

  const handleDeleteNode = useCallback(() => {
    if (contextMenu?.nodeId) {
      deleteNodes([contextMenu.nodeId]);
      // 不需要手动触发保存，useEffect 会自动监听 nodes 变化并保存
    }
  }, [contextMenu, deleteNodes]);

  const handleDeleteEdge = useCallback(() => {
    if (contextMenu?.edgeId) {
      deleteEdge(contextMenu.edgeId);
      // 不需要手动触发保存，useEffect 会自动监听 edges 变化并保存
    }
  }, [contextMenu, deleteEdge]);

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
        // 不需要手动触发保存，useEffect 会自动监听 nodes 变化并保存
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
        // 不需要手动触发保存，useEffect 会自动监听 nodes 变化并保存
      }
    },
    [contextMenu, updateNode, nodes]
  );

  // 处理边标签变化
  const handleEdgeLabelChange = useCallback(
    (label: string) => {
      if (contextMenu?.edgeId) {
        updateEdge(contextMenu.edgeId, { label });
        // 不需要手动触发保存，useEffect 会自动监听 edges 变化并保存
      }
    },
    [contextMenu, updateEdge]
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
        
        {/* 显示当前图表类型 */}
        <div style={{ 
          marginLeft: 'auto', 
          padding: '4px 12px', 
          backgroundColor: themeColors?.toolbarBackground || '#f3f3f3',
          borderRadius: '4px',
          fontSize: '12px',
          color: themeColors?.editorForeground || '#000000',
          border: `1px solid ${themeColors?.borderColor || '#cccccc'}`
        }}>
          Type: {diagramType}
        </div>
      </div>

      <div className="main-content">
        <div className="canvas-container">
          {/* 根据图表类型渲染不同的编辑器 */}
          {diagramType === 'flowchart' ? (
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDoubleClick={onPaneDoubleClick}
              onNodeContextMenu={onNodeContextMenu}
              onEdgeContextMenu={onEdgeContextMenu}
              onPaneContextMenu={onPaneContextMenu}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          ) : diagramType === 'erDiagram' ? (
            <ERDiagramEditor
              model={{ entities: [], relationships: [] }}
              onChange={() => {}}
            />
          ) : diagramType === 'sequenceDiagram' ? (
            <SequenceDiagramEditor
              model={{ participants: [], messages: [], notes: [] }}
              onChange={() => {}}
            />
          ) : diagramType === 'classDiagram' || diagramType === 'stateDiagram' ? (
            <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
              {mermaidError ? (
                <div style={{ color: 'var(--vscode-errorForeground)', padding: '20px', backgroundColor: 'var(--vscode-inputValidation-errorBackground)', border: '1px solid var(--vscode-inputValidation-errorBorder)', borderRadius: '4px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Render Error</h3>
                  <p style={{ margin: 0, fontSize: '12px' }}>{mermaidError}</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '11px', opacity: 0.7 }}>Please check the Mermaid syntax in the preview panel.</p>
                </div>
              ) : isRendering ? (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                  <p>Rendering {diagramType}...</p>
                </div>
              ) : mermaidSvg ? (
                <div dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                  <p>No content to render</p>
                </div>
              )}
            </div>
          ) : diagramType === 'gantt' || diagramType === 'pie' ? (
            <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
              {mermaidError ? (
                <div style={{ color: 'var(--vscode-errorForeground)', padding: '20px', backgroundColor: 'var(--vscode-inputValidation-errorBackground)', border: '1px solid var(--vscode-inputValidation-errorBorder)', borderRadius: '4px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Render Error</h3>
                  <p style={{ margin: 0, fontSize: '12px' }}>{mermaidError}</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '11px', opacity: 0.7 }}>Please check the Mermaid syntax in the preview panel.</p>
                </div>
              ) : isRendering ? (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                  <p>Rendering {diagramType}...</p>
                </div>
              ) : mermaidSvg ? (
                <div dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                  <p>No content to render</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Visualization for {diagramType} is not yet implemented.</p>
              <p>Please use the preview panel to view and edit the code.</p>
            </div>
          )}
          
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              nodeId={contextMenu.nodeId}
              edgeId={contextMenu.edgeId}
              onClose={() => setContextMenu(null)}
              onColorChange={handleColorChange}
              onStrokeChange={handleStrokeChange}
              onTextColorChange={handleTextColorChange}
              onShapeChange={(shape) => {
                if (contextMenu.nodeId) {
                  updateNode(contextMenu.nodeId, { shape });
                }
              }}
              onDelete={contextMenu.edgeId ? handleDeleteEdge : handleDeleteNode}
              onEdgeLabelChange={handleEdgeLabelChange}
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
