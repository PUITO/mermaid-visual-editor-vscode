import { DiagramHandler, EditorProps } from '../types';

/**
 * 状态定义
 */
export interface StateDef {
  id: string;
  name: string;
  description?: string;
}

/**
 * 状态转换
 */
export interface StateTransition {
  id: string;
  from: string;
  to: string;
  label?: string;
}

/**
 * 状态图模型
 */
export interface StateDiagramModel {
  states: StateDef[];
  transitions: StateTransition[];
  note?: string;
}

/**
 * 状态图编辑器组件（占位）
 */
const StateDiagramEditor: React.FC<EditorProps<StateDiagramModel>> = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>State Diagram Editor</h3>
      <p>Visual editor for state diagrams is coming soon.</p>
      <p>Please use the preview panel to view and edit the code.</p>
    </div>
  );
};

/**
 * 状态图处理器
 */
export class StateDiagramHandler implements DiagramHandler<StateDiagramModel> {
  type = 'stateDiagram';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('stateDiagram') || 
           trimmed.startsWith('stateDiagram-v2') ||
           trimmed.startsWith('state diagram');
  }

  parse(code: string): StateDiagramModel {
    const states: StateDef[] = [];
    const transitions: StateTransition[] = [];
    const lines = code.split('\n');
    
    let stateId = 1;
    let transId = 1;
    let note = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 跳过空行、注释和声明
      if (!trimmed || trimmed.startsWith('%%') || 
          trimmed === 'stateDiagram' || trimmed === 'stateDiagram-v2') return;
      
      // 检测 note
      const noteMatch = trimmed.match(/note\s+(.+)/);
      if (noteMatch) {
        note = noteMatch[1].trim();
        return;
      }
      
      // 检测状态定义
      const stateMatch = trimmed.match(/state\s+"?([^"\s]+)"?\s*\{/);
      if (stateMatch) {
        states.push({
          id: `state-${stateId++}`,
          name: stateMatch[1],
        });
        return;
      }
      
      // 检测简单状态定义
      const simpleStateMatch = trimmed.match(/^(\w+)$/);
      if (simpleStateMatch && !trimmed.includes('-->') && !trimmed.includes('[')) {
        const stateName = simpleStateMatch[1];
        if (!states.find(s => s.name === stateName)) {
          states.push({
            id: `state-${stateId++}`,
            name: stateName,
          });
        }
        return;
      }
      
      // 检测状态转换
      const transMatch = trimmed.match(/([\[\w\*]+)\s*(?:--|-->|\.\.>)\s*([\]\w\*]+)/);
      if (transMatch) {
        const from = transMatch[1];
        const to = transMatch[2];
        
        // 提取标签
        const labelMatch = trimmed.match(/:\s*(.+)/);
        
        transitions.push({
          id: `trans-${transId++}`,
          from: from.replace(/[\[\]]/g, ''),
          to: to.replace(/[\[\]]/g, ''),
          label: labelMatch ? labelMatch[1].trim() : undefined,
        });
        
        // 确保状态存在
        const fromClean = from.replace(/[\[\]]/g, '');
        const toClean = to.replace(/[\[\]]/g, '');
        
        if (!states.find(s => s.name === fromClean) && fromClean !== '[*]') {
          states.push({
            id: `state-${stateId++}`,
            name: fromClean,
          });
        }
        
        if (!states.find(s => s.name === toClean) && toClean !== '[*]') {
          states.push({
            id: `state-${stateId++}`,
            name: toClean,
          });
        }
      }
    });
    
    return { states, transitions, note: note || undefined };
  }

  toMermaid(model: StateDiagramModel): string {
    let mermaidCode = 'stateDiagram-v2\n';
    
    model.states.forEach(state => {
      mermaidCode += `    ${state.name}\n`;
    });
    
    model.transitions.forEach(trans => {
      const from = trans.from === '[*]' ? '[*]' : trans.from;
      const to = trans.to === '[*]' ? '[*]' : trans.to;
      
      mermaidCode += `    ${from} --> ${to}`;
      if (trans.label) {
        mermaidCode += ` : ${trans.label}`;
      }
      mermaidCode += '\n';
    });
    
    if (model.note) {
      mermaidCode += `    note ${model.note}\n`;
    }
    
    return mermaidCode;
  }

  getEditorComponent(): React.ComponentType<EditorProps<StateDiagramModel>> {
    return StateDiagramEditor;
  }

  getDefaultModel(): StateDiagramModel {
    return {
      states: [],
      transitions: [],
    };
  }
}
