import { DiagramHandler, EditorProps } from '../types';

/**
 * 序列图参与者
 */
export interface Participant {
  id: string;
  name: string;
  alias?: string;
}

/**
 * 序列图消息
 */
export interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  type: 'solid' | 'dashed';
}

/**
 * 序列图模型
 */
export interface SequenceDiagramModel {
  participants: Participant[];
  messages: Message[];
  notes?: Array<{ text: string; over: string[] }>;
}

/**
 * 序列图编辑器组件
 */
const SequenceDiagramEditor: React.FC<EditorProps<SequenceDiagramModel>> = ({ model, onChange }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h3>Sequence Diagram Editor</h3>
      <p>Participants: {model.participants.length}</p>
      <p>Messages: {model.messages.length}</p>
      {/* TODO: 实现完整的序列图编辑器 */}
    </div>
  );
};

/**
 * 序列图处理器
 */
export class SequenceDiagramHandler implements DiagramHandler<SequenceDiagramModel> {
  type = 'sequenceDiagram';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('sequenceDiagram') || trimmed.startsWith('sequence diagram');
  }

  parse(code: string): SequenceDiagramModel {
    // TODO: 实现序列图解析逻辑
    console.log('Parsing sequence diagram:', code);
    
    return {
      participants: [],
      messages: [],
      notes: [],
    };
  }

  toMermaid(model: SequenceDiagramModel): string {
    let mermaidCode = 'sequenceDiagram\n';
    
    model.participants.forEach(participant => {
      if (participant.alias) {
        mermaidCode += `    participant ${participant.id} as ${participant.alias}\n`;
      } else {
        mermaidCode += `    participant ${participant.id}\n`;
      }
    });
    
    model.messages.forEach(message => {
      const arrow = message.type === 'dashed' ? '-->>' : '->>';
      mermaidCode += `    ${message.from}${arrow}${message.to}: ${message.message}\n`;
    });
    
    if (model.notes) {
      model.notes.forEach(note => {
        mermaidCode += `    Note over ${note.over.join(',')}: ${note.text}\n`;
      });
    }
    
    return mermaidCode;
  }

  getEditorComponent(): React.ComponentType<EditorProps<SequenceDiagramModel>> {
    return SequenceDiagramEditor;
  }

  getDefaultModel(): SequenceDiagramModel {
    return {
      participants: [],
      messages: [],
      notes: [],
    };
  }
}
