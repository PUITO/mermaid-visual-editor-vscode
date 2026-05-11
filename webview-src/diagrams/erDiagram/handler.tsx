import { DiagramHandler, EditorProps } from '../types';
import { ERDiagramEditor } from './editor';

/**
 * ER 图实体
 */
export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
}

/**
 * ER 图属性
 */
export interface Attribute {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

/**
 * ER 图关系
 */
export interface Relationship {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  symbol: string; // 完整的符号，如 ||--||, ||--|{, ||--o{, }|--|{ 等
  label?: string;
}

/**
 * ER 图模型
 */
export interface ERDiagramModel {
  entities: Entity[];
  relationships: Relationship[];
}

/**
 * ER 图处理器
 */
export class ERDiagramHandler implements DiagramHandler<ERDiagramModel> {
  type = 'erDiagram';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('erDiagram') || trimmed.startsWith('er diagram');
  }

  parse(code: string): ERDiagramModel {
    const entities: Entity[] = [];
    const relationships: Relationship[] = [];
    const lines = code.split('\n');
    
    let currentEntity: Entity | null = null;
    let attrId = 1;
    let relId = 1;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('%%') || trimmed === 'erDiagram') return;
      
      // 检测实体定义（必须以单词开头，后跟 {）
      const entityStartMatch = trimmed.match(/^(\w+)\s*\{/);
      if (entityStartMatch) {
        currentEntity = {
          id: `entity-${entities.length + 1}`,
          name: entityStartMatch[1],
          attributes: [],
        };
      } else if (trimmed.includes('}')) {
        // 实体定义结束
        if (currentEntity) {
          entities.push(currentEntity);
          currentEntity = null;
        }
      } else if (currentEntity) {
        // 解析属性
        const attrMatch = trimmed.match(/(\w+)\s+(\w+)(?:\s*(PK|FK))?/);
        if (attrMatch) {
          currentEntity.attributes.push({
            id: `attr-${attrId++}`,
            type: attrMatch[1],
            name: attrMatch[2],
            isPrimaryKey: attrMatch[3] === 'PK',
            isForeignKey: attrMatch[3] === 'FK',
          });
        }
      } else {
        // 解析关系（支持多种符号：||--||, ||--|{, ||--o{, }|--|{ 等）
        const relMatch = trimmed.match(/(\w+)\s+([}|o|]+)--([{|o|]+)\s+(\w+)(?:\s*:\s*"([^"]+)")?/);
        if (relMatch) {
          const source = relMatch[1];
          const target = relMatch[4];
          const leftSymbol = relMatch[2];
          const rightSymbol = relMatch[3];
          const label = relMatch[5];
          const symbol = `${leftSymbol}--${rightSymbol}`;
          
          relationships.push({
            id: `rel-${relId++}`,
            sourceEntity: source,
            targetEntity: target,
            symbol,
            label,
          });
        }
      }
    });
    
    return { entities, relationships };
  }

  toMermaid(model: ERDiagramModel): string {
    let mermaidCode = 'erDiagram\n';
    
    // 先输出关系
    model.relationships.forEach(rel => {
      mermaidCode += `    ${rel.sourceEntity} ${rel.symbol} ${rel.targetEntity}`;
      if (rel.label) {
        mermaidCode += ` : "${rel.label}"`;
      }
      mermaidCode += '\n';
    });
    
    // 再输出实体
    model.entities.forEach(entity => {
      mermaidCode += `\n    ${entity.name} {\n`;
      entity.attributes.forEach(attr => {
        const keyType = attr.isPrimaryKey ? 'PK' : attr.isForeignKey ? 'FK' : '';
        mermaidCode += `        ${attr.type} ${attr.name}${keyType ? ' ' + keyType : ''}\n`;
      });
      mermaidCode += `    }\n`;
    });
    
    return mermaidCode;
  }

  getEditorComponent(): React.ComponentType<EditorProps<ERDiagramModel>> {
    return ERDiagramEditor;
  }

  getDefaultModel(): ERDiagramModel {
    return {
      entities: [],
      relationships: [],
    };
  }
}
