import { DiagramHandler, EditorProps } from '../types';

/**
 * 饼图数据项
 */
export interface PieItem {
  id: string;
  label: string;
  value: number;
}

/**
 * 饼图模型
 */
export interface PieChartModel {
  title?: string;
  showData?: boolean;
  items: PieItem[];
}

/**
 * 饼图编辑器组件（占位）
 */
const PieChartEditor: React.FC<EditorProps<PieChartModel>> = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Pie Chart Editor</h3>
      <p>Visual editor for pie charts is coming soon.</p>
      <p>Please use the preview panel to view and edit the code.</p>
    </div>
  );
};

/**
 * 饼图处理器
 */
export class PieChartHandler implements DiagramHandler<PieChartModel> {
  type = 'pie';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('pie') || trimmed.startsWith('pie showData');
  }

  parse(code: string): PieChartModel {
    const lines = code.split('\n');
    let title = '';
    let showData = false;
    const items: PieItem[] = [];
    
    let itemId = 1;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('%%')) return;
      
      // 检测 pie 声明
      if (trimmed === 'pie') {
        return;
      }
      
      // 检测 pie showData
      if (trimmed === 'pie showData') {
        showData = true;
        return;
      }
      
      // 检测标题
      const titleMatch = trimmed.match(/title\s+(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        return;
      }
      
      // 检测数据项 "label" : value
      const itemMatch = trimmed.match(/"([^"]+)"\s*:\s*(\d+(\.\d+)?)/);
      if (itemMatch) {
        items.push({
          id: `item-${itemId++}`,
          label: itemMatch[1],
          value: parseFloat(itemMatch[2]),
        });
        return;
      }
    });
    
    return {
      title: title || undefined,
      showData,
      items,
    };
  }

  toMermaid(model: PieChartModel): string {
    let mermaidCode = model.showData ? 'pie showData\n' : 'pie\n';
    
    if (model.title) {
      mermaidCode += `    title ${model.title}\n`;
    }
    
    model.items.forEach(item => {
      mermaidCode += `    "${item.label}" : ${item.value}\n`;
    });
    
    return mermaidCode;
  }

  getEditorComponent(): React.ComponentType<EditorProps<PieChartModel>> {
    return PieChartEditor;
  }

  getDefaultModel(): PieChartModel {
    return {
      items: [],
    };
  }
}
