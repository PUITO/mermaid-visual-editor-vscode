import React, { useState, useRef, useEffect } from 'react';

interface SplitEditorProps {
  svgContent: string;
  codeContent: string;
  onCodeChange: (code: string) => void;
  isRendering?: boolean;
  error?: string | null;
  diagramType?: string;
  showCode?: boolean; // 控制代码编辑器显示/隐藏
  onToggleCode?: () => void; // 切换代码编辑器显示的回调
}

export function SplitEditor({
  svgContent,
  codeContent,
  onCodeChange,
  isRendering = false,
  error = null,
  diagramType = 'diagram',
  showCode = true, // 默认显示代码编辑器
  onToggleCode
}: SplitEditorProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  // 处理鼠标按下开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 重置视图
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 处理代码变化
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(e.target.value);
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + 0 重置视图
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--vscode-editor-background)',
      color: 'var(--vscode-editor-foreground)'
    }}>
      {/* 左侧：SVG 预览区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--vscode-panel-border)',
        position: 'relative'
      }}>
        {/* 工具栏 */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'var(--vscode-toolbar-background)',
          borderBottom: '1px solid var(--vscode-panel-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px'
        }}>
          <span style={{ fontWeight: 500 }}>{diagramType} Preview</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{Math.round(scale * 100)}%</span>
            <button
              onClick={handleResetView}
              style={{
                padding: '4px 8px',
                backgroundColor: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              title="Reset View (Ctrl+0)"
            >
              Reset
            </button>
          </div>
        </div>

        {/* SVG 显示区域 */}
        <div
          ref={svgContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            flex: 1,
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            backgroundColor: 'var(--vscode-editor-background)'
          }}
        >
          {error ? (
            <div style={{
              padding: '20px',
              color: 'var(--vscode-errorForeground)',
              backgroundColor: 'var(--vscode-inputValidation-errorBackground)',
              border: '1px solid var(--vscode-inputValidation-errorBorder)',
              borderRadius: '4px',
              margin: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Render Error</h3>
              <p style={{ margin: 0, fontSize: '12px' }}>{error}</p>
            </div>
          ) : isRendering ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              opacity: 0.6
            }}>
              <p>Rendering...</p>
            </div>
          ) : svgContent ? (
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                padding: '20px',
                display: 'inline-block'
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              opacity: 0.5
            }}>
              <p>No content to render</p>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div style={{
          padding: '6px 12px',
          backgroundColor: 'var(--vscode-toolbar-background)',
          borderTop: '1px solid var(--vscode-panel-border)',
          fontSize: '11px',
          opacity: 0.7,
          textAlign: 'center'
        }}>
          Scroll to zoom • Drag to pan • Ctrl+0 to reset
        </div>
      </div>

      {/* 右侧：代码编辑器（条件显示） */}
      {showCode && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: '300px',
          borderLeft: '1px solid var(--vscode-panel-border)'
        }}>
          {/* 工具栏 */}
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'var(--vscode-toolbar-background)',
            borderBottom: '1px solid var(--vscode-panel-border)',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Mermaid Code
          </div>

          {/* 代码编辑区 */}
          <textarea
            ref={textareaRef}
            value={codeContent}
            onChange={handleCodeChange}
            spellCheck={false}
            style={{
              flex: 1,
              width: '100%',
              padding: '12px',
              fontFamily: 'var(--vscode-editor-font-family, Consolas, "Courier New", monospace)',
              fontSize: 'var(--vscode-editor-font-size, 14px)',
              lineHeight: 'var(--vscode-editor-line-height, 1.5)',
              backgroundColor: 'var(--vscode-editor-background)',
              color: 'var(--vscode-editor-foreground)',
              border: 'none',
              outline: 'none',
              resize: 'none',
              tabSize: 4,
              whiteSpace: 'pre',
              overflow: 'auto'
            }}
          />
        </div>
      )}
    </div>
  );
}
