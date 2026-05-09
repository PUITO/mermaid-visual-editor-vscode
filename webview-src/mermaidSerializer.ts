import { DiagramNode, DiagramEdge } from './store';

export interface MermaidConfig {
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  theme: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  handDrawn: boolean;
  curveStyle: string;
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
  let mermaidCode = `graph ${config.direction}\n`;
  
  // Add theme directive
  if (config.theme !== 'default') {
    mermaidCode = `%%{init: {'theme':'${config.theme}'}}%%\n${mermaidCode}`;
  }
  
  // Generate node definitions
  nodes.forEach((node) => {
    const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
    const label = node.data.label || node.id;
    const shape = node.data.shape || 'rectangle';
    
    const openShape = shapeMap[shape] || '[';
    const closeShape = closingShapeMap[openShape] || ']';
    
    mermaidCode += `    ${nodeId}${openShape}${label}${closeShape}\n`;
  });
  
  // Generate edge definitions
  edges.forEach((edge) => {
    const sourceId = edge.source.replace(/[^a-zA-Z0-9]/g, '_');
    const targetId = edge.target.replace(/[^a-zA-Z0-9]/g, '_');
    
    let edgeType = '-->';
    
    if (edge.data?.type === 'dashed') {
      edgeType = '-.->';
    } else if (edge.data?.type === 'thick') {
      edgeType = '==>';
    }
    
    const label = edge.data?.label ? `|${edge.data.label}|` : '';
    
    mermaidCode += `    ${sourceId}${label}${edgeType} ${targetId}\n`;
  });
  
  return mermaidCode.trim();
}

export function parseFromMermaid(code: string): { nodes: any[]; edges: any[] } {
  // This is a simplified parser - a full implementation would be more complex
  const nodes: any[] = [];
  const edges: any[] = [];
  const lines = code.split('\n');
  
  const nodeRegex = /\s*(\w+)\s*[\[\(\{\[]+/;
  const edgeRegex = /(-\.?->|==>)/;
  
  let nodeId = 1;
  const nodeMap = new Map<string, string>();
  
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
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;
    
    // Try to match node definition
    const nodeMatch = trimmed.match(/(\w+)\s*([\[\(\{\[][^\]]*[\]\)\}\]])/);
    if (nodeMatch && !edgeRegex.test(trimmed)) {
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
        
        nodes.push({
          id: nodeMap.get(id)!,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { label: label || id, shape: detectedShape },
          type: 'custom',
        });
      }
    }
    
    // Try to match edge definition
    const edgeMatch = trimmed.match(/(\w+)\s*.*?(-\.?->|==>)\s*(\w+)/);
    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const targetId = edgeMatch[3];
      
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, `node-${nodeId++}`);
        nodes.push({
          id: nodeMap.get(sourceId)!,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { label: sourceId, shape: 'rectangle' },
        });
      }
      
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, `node-${nodeId++}`);
        nodes.push({
          id: nodeMap.get(targetId)!,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: { label: targetId, shape: 'rectangle' },
        });
      }
      
      let type = 'default';
      if (edgeMatch[2] === '-.->') type = 'dashed';
      if (edgeMatch[2] === '==>') type = 'thick';
      
      edges.push({
        id: `edge-${edges.length + 1}`,
        source: nodeMap.get(sourceId)!,
        target: nodeMap.get(targetId)!,
        data: { type },
      });
    }
  });
  
  return { nodes, edges };
}
