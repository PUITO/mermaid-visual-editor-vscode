import { DiagramNode, DiagramEdge } from './store';

export interface MermaidConfig {
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  theme: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  handDrawn: boolean;
  curveStyle: string;
  diagramType?: 'graph' | 'flowchart';  // Mermaid 10+ 推荐使用 flowchart
}

const shapeMap: Record<string, string> = {
  rectangle: '[',
  rounded: '(',
  stadium: '([',
  diamond: '{',
  circle: '((',
  hexagon: '{{',
  cylinder: '[(',
  parallelogram: '[/',
  trapezoid: '[\\',
  document: '[[',
  note: '[\\',
  square: '[',
};

const closingShapeMap: Record<string, string> = {
  '[': ']',
  '(': ')',
  '([': '])',
  '{': '}',
  '((': '))',
  '{{': '}}',
  '[(': ')]',
  '[/': '/]',
  '[\\': '\\]',
  '[[': ']]',
};

export function serializeToMermaid(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  config: MermaidConfig = {
    direction: 'TB',
    theme: 'default',
    handDrawn: false,
    curveStyle: 'basis',
  }
): string {
  // Mermaid 10+ 推荐使用 flowchart 而非 graph
  const diagramType = config.diagramType || 'flowchart';
  let mermaidCode = `${diagramType} ${config.direction}\n`;
  
  // Generate node definitions
  nodes.forEach((node) => {
    // 优先使用 data 中保存的原始 ID，如果没有则从 node.id 转换
    const nodeId = node.data.originalId || node.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const label = node.data.label || node.id;
    const shape = node.data.shape || 'rectangle';
    
    const openShape = shapeMap[shape] || '[';
    const closeShape = closingShapeMap[openShape] || ']';
    
    mermaidCode += `    ${nodeId}${openShape}${label}${closeShape}\n`;
  });
  
  // Generate edge definitions
  edges.forEach((edge) => {
    // 优先使用 data 中保存的原始 ID
    const sourceId = edge.data?.originalSourceId || edge.source.replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetId = edge.data?.originalTargetId || edge.target.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    let edgeType = '-->';
    
    if (edge.data?.type === 'dashed') {
      edgeType = '-.->';
    } else if (edge.data?.type === 'thick') {
      edgeType = '==>';
    }
    
    const label = edge.data?.label ? `|${edge.data.label}|` : '';
    
    mermaidCode += `    ${sourceId}${label}${edgeType} ${targetId}\n`;
  });
  
  // Generate style definitions for nodes that have custom styles
  nodes.forEach((node) => {
    if (node.data.style) {
      // 检查是否有任何非空的样式属性（明确区分 null/undefined 与空字符串）
      const hasCustomStyle = 
        (node.data.style.fill !== undefined && node.data.style.fill !== null && node.data.style.fill !== '') ||
        (node.data.style.stroke !== undefined && node.data.style.stroke !== null && node.data.style.stroke !== '') ||
        (node.data.style.color !== undefined && node.data.style.color !== null && node.data.style.color !== '');
      
      if (hasCustomStyle) {
        // 优先使用 data 中保存的原始 ID
        const nodeId = node.data.originalId || node.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        // 只有当样式属性存在且非空时才使用，否则使用默认值
        const fill = (node.data.style.fill !== undefined && node.data.style.fill !== null && node.data.style.fill !== '') 
          ? node.data.style.fill 
          : '#ffffff';
        const stroke = (node.data.style.stroke !== undefined && node.data.style.stroke !== null && node.data.style.stroke !== '') 
          ? node.data.style.stroke 
          : '#000000';
        const color = (node.data.style.color !== undefined && node.data.style.color !== null && node.data.style.color !== '') 
          ? node.data.style.color 
          : '#000000';
        
        mermaidCode += `    style ${nodeId} fill:${fill},stroke:${stroke},color:${color}\n`;
      }
    }
  });
  
  return mermaidCode.trim();
}

export function parseFromMermaid(code: string): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];
  const lines = code.split('\n');
  
  const edgeRegex = /(-\.?->|==>)/;
  // 修复样式解析正则表达式：使用 ([^\s,]+) 匹配颜色值，避免捕获末尾空格
  const styleRegex = /style\s+(\w+)\s+fill:([^\s,]+),stroke:([^\s,]+),color:([^\s]+)/;
  
  let nodeId = 1;
  const nodeMap = new Map<string, string>();
  const nodeStyles = new Map<string, { fill?: string; stroke?: string; color?: string }>();
  
  // 形状映射：从 Mermaid 语法到内部形状名称
  const shapeDetectionMap: Record<string, string> = {
    '[[': 'document',
    '[(': 'cylinder',
    '([': 'stadium',
    '((': 'circle',
    '{{': 'hexagon',
    '[/': 'parallelogram',
    '[\\': 'trapezoid',
    '[': 'rectangle',
    '(': 'rounded',
    '{': 'diamond',
  };
  
  // 第一遍：解析样式定义
  lines.forEach((line) => {
    const trimmed = line.trim();
    // 跳过空行、注释和 init 指令
    if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('graph')) return;
    
    const styleMatch = trimmed.match(styleRegex);
    if (styleMatch) {
      const nodeId = styleMatch[1];
      // 去除颜色值两端的空格（双重保险）
      nodeStyles.set(nodeId, {
        fill: styleMatch[2].trim(),
        stroke: styleMatch[3].trim(),
        color: styleMatch[4].trim(),
      });
    }
  });
  
  // 第二遍：解析节点和边
  lines.forEach((line) => {
    const trimmed = line.trim();
    // 跳过空行、注释、init 指令、graph 声明和 style 语句
    if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('graph') || trimmed.startsWith('style')) return;
    
    // 先尝试匹配边定义（因为边定义可能包含节点）
    const edgeMatch = trimmed.match(/(\w+)\s*[^\-]*(-\.?->|==>)\s*(\w+)/);
    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const targetId = edgeMatch[3];
      const edgeType = edgeMatch[2];
      
      // 确保源节点存在
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, `node-${nodeId++}`);
        // 尝试从行中提取源节点的形状和标签
        const sourceNodeMatch = trimmed.match(new RegExp(`${sourceId}\\s*([\\[\\(\\{][^\\]]*[\\]\\)\\}])`));
        let sourceLabel = sourceId;
        let sourceShape = 'rectangle';
        
        if (sourceNodeMatch) {
          const labelWithShape = sourceNodeMatch[1];
          sourceLabel = labelWithShape.replace(/[\[\(\{\[\]\)\}\]]/g, '').trim();
          
          // 检测形状
          if (labelWithShape.startsWith('[[')) sourceShape = 'document';
          else if (labelWithShape.startsWith('[(')) sourceShape = 'cylinder';
          else if (labelWithShape.startsWith('([')) sourceShape = 'stadium';
          else if (labelWithShape.startsWith('((')) sourceShape = 'circle';
          else if (labelWithShape.startsWith('{{')) sourceShape = 'hexagon';
          else if (labelWithShape.startsWith('[/')) sourceShape = 'parallelogram';
          else if (labelWithShape.startsWith('[\\')) sourceShape = 'trapezoid';
          else if (labelWithShape.startsWith('[')) sourceShape = 'rectangle';
          else if (labelWithShape.startsWith('(')) sourceShape = 'rounded';
          else if (labelWithShape.startsWith('{')) sourceShape = 'diamond';
        }
        
        const style = nodeStyles.get(sourceId);
        nodes.push({
          id: nodeMap.get(sourceId)!,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { 
            label: sourceLabel, 
            shape: sourceShape,
            originalId: sourceId,
            style: style ? style : undefined,
          },
          type: 'custom',
        });
      }
      
      // 确保目标节点存在
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, `node-${nodeId++}`);
        // 尝试从行中提取目标节点的形状和标签
        const targetNodeMatch = trimmed.match(new RegExp(`${targetId}\\s*([\\[\\(\\{][^\\]]*[\\]\\)\\}])`));
        let targetLabel = targetId;
        let targetShape = 'rectangle';
        
        if (targetNodeMatch) {
          const labelWithShape = targetNodeMatch[1];
          targetLabel = labelWithShape.replace(/[\[\(\{\[\]\)\}\]]/g, '').trim();
          
          // 检测形状
          if (labelWithShape.startsWith('[[')) targetShape = 'document';
          else if (labelWithShape.startsWith('[(')) targetShape = 'cylinder';
          else if (labelWithShape.startsWith('([')) targetShape = 'stadium';
          else if (labelWithShape.startsWith('((')) targetShape = 'circle';
          else if (labelWithShape.startsWith('{{')) targetShape = 'hexagon';
          else if (labelWithShape.startsWith('[/')) targetShape = 'parallelogram';
          else if (labelWithShape.startsWith('[\\')) targetShape = 'trapezoid';
          else if (labelWithShape.startsWith('[')) targetShape = 'rectangle';
          else if (labelWithShape.startsWith('(')) targetShape = 'rounded';
          else if (labelWithShape.startsWith('{')) targetShape = 'diamond';
        }
        
        const style = nodeStyles.get(targetId);
        nodes.push({
          id: nodeMap.get(targetId)!,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { 
            label: targetLabel, 
            shape: targetShape,
            originalId: targetId,
            style: style ? style : undefined,
          },
          type: 'custom',
        });
      }
      
      // 添加边
      let type = 'default';
      if (edgeType === '-.->') type = 'dashed';
      if (edgeType === '==>') type = 'thick';
      
      edges.push({
        id: `edge-${edges.length + 1}`,
        source: nodeMap.get(sourceId)!,
        target: nodeMap.get(targetId)!,
        data: { 
          type,
          originalSourceId: sourceId,
          originalTargetId: targetId,
        },
      });
    } else {
      // 如果没有匹配到边，尝试匹配独立的节点定义
      const nodeMatch = trimmed.match(/(\w+)\s*([\[\(\{\[][^\]]*[\]\)\}\]])/);
      if (nodeMatch) {
        const id = nodeMatch[1];
        const labelWithShape = nodeMatch[2];
        
        if (!nodeMap.has(id)) {
          nodeMap.set(id, `node-${nodeId++}`);
          const label = labelWithShape.replace(/[\[\(\{\[\]\)\}\]]/g, '').trim();
          
          // 检测形状类型
          let detectedShape = 'rectangle'; // 默认形状
          
          // 检查双字符形状（优先级更高）
          if (labelWithShape.startsWith('[[')) {
            detectedShape = 'document';
          } else if (labelWithShape.startsWith('[(')) {
            detectedShape = 'cylinder';
          } else if (labelWithShape.startsWith('([')) {
            detectedShape = 'stadium';
          } else if (labelWithShape.startsWith('((')) {
            detectedShape = 'circle';
          } else if (labelWithShape.startsWith('{{')) {
            detectedShape = 'hexagon';
          } else if (labelWithShape.startsWith('[/')) {
            detectedShape = 'parallelogram';
          } else if (labelWithShape.startsWith('[\\')) {
            detectedShape = 'trapezoid';
          } 
          // 检查单字符形状
          else if (labelWithShape.startsWith('[')) {
            detectedShape = 'rectangle';
          } else if (labelWithShape.startsWith('(')) {
            detectedShape = 'rounded';
          } else if (labelWithShape.startsWith('{')) {
            detectedShape = 'diamond';
          }
          
          // 获取样式信息
          const style = nodeStyles.get(id);
          
          nodes.push({
            id: nodeMap.get(id)!,
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            data: { 
              label: label || id, 
              shape: detectedShape,
              originalId: id,  // 保存原始 ID，用于序列化时保持一致
              style: style ? style : undefined,
            },
            type: 'custom',
          });
        }
      }
    }
  });
  
  return { nodes, edges };
}
