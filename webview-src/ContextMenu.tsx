import React, { useState, useEffect } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId?: string;
  onClose: () => void;
  onColorChange: (color: string) => void;
  onStrokeChange: (stroke: string) => void;
  onTextColorChange: (textColor: string) => void;
  onShapeChange: (shape: string) => void;
  onDelete: () => void;
}

const colors = [
  { name: '默认', value: '' },
  { name: '绿色', value: '#4CAF50' },
  { name: '蓝色', value: '#2196F3' },
  { name: '红色', value: '#f44336' },
  { name: '橙色', value: '#FF9800' },
  { name: '紫色', value: '#9C27B0' },
  { name: '黄色', value: '#FFEB3B' },
];

const shapes = [
  { name: '矩形', value: 'rectangle' },
  { name: '圆角矩形', value: 'rounded' },
  { name: '胶囊形', value: 'stadium' },
  { name: '菱形', value: 'diamond' },
  { name: '圆形', value: 'circle' },
  { name: '六边形', value: 'hexagon' },
  { name: '圆柱体', value: 'cylinder' },
];

export function ContextMenu({ x, y, nodeId, onClose, onColorChange, onStrokeChange, onTextColorChange, onShapeChange, onDelete }: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  // 计算菜单位置，确保不会超出视口
  const menuHeight = 600; // 预估菜单高度
  const viewportHeight = window.innerHeight;
  const adjustedY = y + menuHeight > viewportHeight ? viewportHeight - menuHeight - 10 : y;
  const finalY = Math.max(10, adjustedY); // 至少距离顶部 10px

  return (
    <div
      className="context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: finalY,
        backgroundColor: 'var(--vscode-menu-background)',
        border: '1px solid var(--vscode-menu-border)',
        borderRadius: '4px',
        padding: '4px 0',
        minWidth: '200px',
        maxHeight: 'calc(100vh - 20px)',
        overflowY: 'auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {nodeId && (
        <>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--vscode-menu-border)' }}>
            <strong style={{ color: 'var(--vscode-menu-foreground)' }}>节点设置</strong>
          </div>
          
          {/* 填充颜色 */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ marginBottom: '8px', color: 'var(--vscode-menu-foreground)', fontSize: '12px' }}>填充颜色:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    onColorChange(color.value);
                    onClose();
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color.value || 'transparent',
                    border: color.value ? 'none' : '1px solid var(--vscode-menu-border)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={color.name}
                >
                  {!color.value && (
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '16px',
                      color: 'var(--vscode-menu-foreground)',
                    }}>×</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 边框颜色 */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--vscode-menu-border)' }}>
            <div style={{ marginBottom: '8px', color: 'var(--vscode-menu-foreground)', fontSize: '12px' }}>边框颜色:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {colors.map((color) => (
                <button
                  key={`stroke-${color.value}`}
                  onClick={() => {
                    onStrokeChange(color.value);
                    onClose();
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color.value || 'transparent',
                    border: color.value ? '2px solid #fff' : '1px solid var(--vscode-menu-border)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                    outline: color.value ? `2px solid ${color.value}` : 'none',
                    outlineOffset: '-4px',
                  }}
                  title={color.name}
                >
                  {!color.value && (
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '16px',
                      color: 'var(--vscode-menu-foreground)',
                    }}>×</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 文字颜色 */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--vscode-menu-border)' }}>
            <div style={{ marginBottom: '8px', color: 'var(--vscode-menu-foreground)', fontSize: '12px' }}>文字颜色:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {colors.map((color) => (
                <button
                  key={`text-${color.value}`}
                  onClick={() => {
                    onTextColorChange(color.value);
                    onClose();
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color.value || 'transparent',
                    border: color.value ? 'none' : '1px solid var(--vscode-menu-border)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={color.name}
                >
                  {!color.value ? (
                    <span style={{
                      fontSize: '16px',
                      color: 'var(--vscode-menu-foreground)',
                    }}>×</span>
                  ) : (
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>A</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '8px 12px' }}>
            <div style={{ marginBottom: '8px', color: 'var(--vscode-menu-foreground)', fontSize: '12px' }}>形状:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {shapes.map((shape) => (
                <button
                  key={shape.value}
                  onClick={() => {
                    onShapeChange(shape.value);
                    onClose();
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--vscode-menu-foreground)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--vscode-menu-border)', padding: '4px 0' }}>
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--vscode-errorForeground)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              删除节点
            </button>
          </div>
        </>
      )}
      
      {!nodeId && (
        <div style={{ padding: '8px 12px', color: 'var(--vscode-menu-foreground)' }}>
          右键点击节点以编辑
        </div>
      )}
    </div>
  );
}
