import type { DiagramHandler } from '../types';
import React from 'react';

/**
 * 通用处理器 - 用于处理未明确支持的图表类型
 * 保留原始代码不做解析，仅用于显示和保存
 */
export class GenericHandler implements DiagramHandler<string> {
  type: string;

  constructor(type: string) {
    this.type = type;
  }

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith(this.type);
  }

  parse(code: string): string {
    // 保留原始代码
    return code;
  }

  toMermaid(model: string): string {
    // 直接返回原始代码
    return model;
  }

  getEditorComponent(): React.ComponentType<any> {
    // 返回一个简单的代码查看器组件
    const CodeViewer: React.FC<{ model: string; onChange: (model: string) => void }> = ({ model }) => (
      <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
        <h3>{this.type} Diagram</h3>
        <p>This diagram type is not yet fully supported for visual editing.</p>
        <p>Please edit the Mermaid code directly in the preview panel.</p>
        <pre style={{ 
          backgroundColor: 'var(--vscode-editor-background)',
          padding: '16px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          {model}
        </pre>
      </div>
    );
    return CodeViewer;
  }

  getDefaultModel(): string {
    return '';
  }
}
