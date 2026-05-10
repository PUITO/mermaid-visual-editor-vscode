import { DiagramHandler, EditorProps } from '../types';
import { SequenceDiagramEditor } from './editor';

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
 * 序列图处理器
 */
export class SequenceDiagramHandler implements DiagramHandler<SequenceDiagramModel> {
  type = 'sequenceDiagram';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('sequenceDiagram') || trimmed.startsWith('sequence diagram');
  }

  parse(code: string): SequenceDiagramModel {
    const participants: Participant[] = [];
    const messages: Message[] = [];
    const notes: Array<{ text: string; over: string[] }> = [];
    const lines = code.split('\n');
    
    let msgId = 1;
    const participantMap = new Map<string, string>();
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('%%') || trimmed === 'sequenceDiagram') return;
      
      // 解析参与者
      const participantMatch = trimmed.match(/participant\s+(\w+)(?:\s+as\s+(.+))?/);
      if (participantMatch) {
        const id = participantMatch[1];
        const alias = participantMatch[2]?.trim();
        
        if (!participantMap.has(id)) {
          participantMap.set(id, `participant-${participants.length + 1}`);
          participants.push({
            id: participantMap.get(id)!,
            name: id,
            alias: alias,
          });
        }
        return;
      }
      
      // 解析消息
      const messageMatch = trimmed.match(/(\w+)\s*(-+>|->>)\s*(\w+):\s*(.+)/);
      if (messageMatch) {
        const from = participantMap.get(messageMatch[1]) || messageMatch[1];
        const to = participantMap.get(messageMatch[3]) || messageMatch[3];
        const arrow = messageMatch[2];
        const message = messageMatch[4];
        
        messages.push({
          id: `msg-${msgId++}`,
          from,
          to,
          message,
          type: arrow.includes('--') ? 'dashed' : 'solid',
        });
        return;
      }
      
      // 解析注释
      const noteMatch = trimmed.match(/Note\s+over\s+([\w,]+):\s*(.+)/);
      if (noteMatch) {
        const overStr = noteMatch[1];
        const text = noteMatch[2];
        const over = overStr.split(',').map(s => s.trim());
        
        notes.push({ text, over });
      }
    });
    
    return { participants, messages, notes };
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
