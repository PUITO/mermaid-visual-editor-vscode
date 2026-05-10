import { DiagramHandler, EditorProps } from '../types';
import { parseFromMermaid, serializeToMermaid, MermaidConfig } from '../../mermaidSerializer';
import { useDiagramStore } from '../../store';

/**
 * 流程图模型
 */
export interface FlowchartModel {
  nodes: any[];
  edges: any[];
  config: MermaidConfig;
}

/**
 * 流程图编辑器组件
 */
const FlowchartEditor: React.FC<EditorProps<FlowchartModel>> = ({ model, onChange }) => {
  // 这里可以复用现有的 App.tsx 逻辑
  // 暂时返回 null，实际使用时需要集成 React Flow
  return null;
};

/**
 * 流程图处理器
 */
export class FlowchartHandler implements DiagramHandler<FlowchartModel> {
  type = 'flowchart';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('graph') || trimmed.startsWith('flowchart');
  }

  parse(code: string): FlowchartModel {
    const { nodes, edges } = parseFromMermaid(code);
    return {
      nodes,
      edges,
      config: {
        direction: 'TB',
        theme: 'default',
        handDrawn: false,
        curveStyle: 'basis',
        diagramType: 'flowchart',  // Mermaid 10+ 推荐使用 flowchart
      },
    };
  }

  toMermaid(model: FlowchartModel): string {
    return serializeToMermaid(model.nodes, model.edges, model.config);
  }

  getEditorComponent(): React.ComponentType<EditorProps<FlowchartModel>> {
    return FlowchartEditor;
  }

  getDefaultModel(): FlowchartModel {
    return {
      nodes: [],
      edges: [],
      config: {
        direction: 'TB',
        theme: 'default',
        handDrawn: false,
        curveStyle: 'basis',
        diagramType: 'flowchart',  // Mermaid 10+ 推荐使用 flowchart
      },
    };
  }
}
