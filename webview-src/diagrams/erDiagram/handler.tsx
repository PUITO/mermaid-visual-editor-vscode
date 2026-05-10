import { DiagramHandler, EditorProps } from '../types';

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
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
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
 * ER 图编辑器组件
 */
const ERDiagramEditor: React.FC<EditorProps<ERDiagramModel>> = ({ model, onChange }) => {
  // ER 图编辑器实现
  // 初期可以使用表单编辑 + Mermaid 渲染的方式
  return (
    <div style={{ padding: '20px' }}>
      <h3>ER Diagram Editor</h3>
      <p>Entities: {model.entities.length}</p>
      <p>Relationships: {model.relationships.length}</p>
      {/* TODO: 实现完整的 ER 图编辑器 */}
    </div>
  );
};

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
      
      // 检测实体定义（包含大括号的行）
      if (trimmed.includes('{')) {
        const entityMatch = trimmed.match(/(\w+)\s*\{/);
        if (entityMatch) {
          currentEntity = {
            id: `entity-${entities.length + 1}`,
            name: entityMatch[1],
            attributes: [],
          };
        }
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
        // 解析关系
        const relMatch = trimmed.match(/(\w+)\s*(\|\{|\}\||\|\||--|\{\})\s*(\w+)/);
        if (relMatch) {
          const source = relMatch[1];
          const target = relMatch[3];
          const symbol = relMatch[2];
          
          let relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many' = 'one-to-one';
          if (symbol === '||--|{' || symbol === '|{-||') {
            relationshipType = 'one-to-many';
          } else if (symbol === '}|--|{' || symbol === '{-|{') {
            relationshipType = 'many-to-many';
          }
          
          // 提取标签（如果有）
          const labelMatch = trimmed.match(/:\s*"([^"]+)"/);
          
          relationships.push({
            id: `rel-${relId++}`,
            sourceEntity: source,
            targetEntity: target,
            relationshipType,
            label: labelMatch ? labelMatch[1] : undefined,
          });
        }
      }
    });
    
    return { entities, relationships };
  }

  toMermaid(model: ERDiagramModel): string {
    // TODO: 实现 ER 图序列化逻辑
    let mermaidCode = 'erDiagram\n';
    
    model.entities.forEach(entity => {
      mermaidCode += `    ${entity.name} {\n`;
      entity.attributes.forEach(attr => {
        const keyType = attr.isPrimaryKey ? 'PK' : attr.isForeignKey ? 'FK' : '';
        mermaidCode += `        ${attr.type} ${attr.name}${keyType ? ' ' + keyType : ''}\n`;
      });
      mermaidCode += `    }\n`;
    });
    
    model.relationships.forEach(rel => {
      let relSymbol = '||--||';
      if (rel.relationshipType === 'one-to-many') {
        relSymbol = '||--|{';
      } else if (rel.relationshipType === 'many-to-many') {
        relSymbol = '}|--|{';
      }
      mermaidCode += `    ${rel.sourceEntity} ${relSymbol} ${rel.targetEntity}`;
      if (rel.label) {
        mermaidCode += ` : "${rel.label}"`;
      }
      mermaidCode += '\n';
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
