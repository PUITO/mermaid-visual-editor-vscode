import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { DiagramNode } from './store';
import { useDiagramStore } from './store';

interface CustomNodeProps {
  data: DiagramNode['data'];
  id: string;
  selected?: boolean;
}

const shapeStyles: Record<string, React.CSSProperties> = {
  rectangle: { borderRadius: '0px' },
  rounded: { borderRadius: '10px' },
  stadium: { borderRadius: '50px' },
  diamond: { 
    transform: 'rotate(45deg)',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { 
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagon: { 
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    padding: '20px',
  },
  cylinder: { 
    borderRadius: '50px / 20px',
    minHeight: '60px',
  },
  parallelogram: {
    transform: 'skewX(-20deg)',
  },
  trapezoid: {
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  },
  document: {
    borderRadius: '0px 0px 10px 10px',
    position: 'relative',
  },
};

export function CustomNode({ data, id, selected }: CustomNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || id);
  const updateNode = useDiagramStore((state) => state.updateNode);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // 先更新 store 中的节点数据
    updateNode(id, { label });
    
    // 延迟触发保存，确保状态更新完成
    if (window.vscode) {
      setTimeout(() => {
        window.vscode.postMessage({ 
          type: 'updateContent' 
        });
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  // 默认颜色（如果未指定）
  const fill = data.style?.fill || 'var(--vscode-editor-background)';
  const stroke = data.style?.stroke || 'var(--vscode-editor-foreground)';
  const color = data.style?.color || 'var(--vscode-editor-foreground)';
  const shape = data.shape || 'rectangle';

  return (
    <div
      className={`custom-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
      style={{
        padding: '10px 20px',
        background: fill.startsWith('#') || fill.startsWith('rgb') ? fill : `var(--vscode-editor-background)`,
        border: `2px solid ${stroke.startsWith('#') || stroke.startsWith('rgb') ? stroke : `var(--vscode-panel-border)`}`,
        color: color.startsWith('#') || color.startsWith('rgb') ? color : `var(--vscode-editor-foreground)`,
        ...shapeStyles[shape],
        minWidth: '100px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: selected ? '0 0 0 2px var(--vscode-focusBorder)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Handles for connecting - only top and bottom */}
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          zIndex: 10,
          width: '8px',
          height: '8px',
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          zIndex: 10,
          width: '8px',
          height: '8px',
        }} 
      />

      {isEditing ? (
        <input
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{ position: 'relative', zIndex: 1 }}
        />
      ) : (
        <div style={{ 
          transform: shape === 'diamond' ? 'rotate(-45deg)' : 'none',
          position: 'relative',
          zIndex: 1,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
