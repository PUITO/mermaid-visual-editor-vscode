import { DiagramHandler, EditorProps } from '../types';

/**
 * 类图类定义
 */
export interface ClassDef {
  id: string;
  name: string;
  members: Array<{
    visibility: 'public' | 'private' | 'protected';
    type: 'field' | 'method';
    signature: string;
  }>;
}

/**
 * 类图关系
 */
export interface ClassRelationship {
  id: string;
  source: string;
  target: string;
  type: 'inheritance' | 'composition' | 'aggregation' | 'association' | 'dependency';
  label?: string;
}

/**
 * 类图模型
 */
export interface ClassDiagramModel {
  classes: ClassDef[];
  relationships: ClassRelationship[];
}

/**
 * 类图编辑器组件（占位）
 */
const ClassDiagramEditor: React.FC<EditorProps<ClassDiagramModel>> = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Class Diagram Editor</h3>
      <p>Visual editor for class diagrams is coming soon.</p>
      <p>Please use the preview panel to view and edit the code.</p>
    </div>
  );
};

/**
 * 类图处理器
 */
export class ClassDiagramHandler implements DiagramHandler<ClassDiagramModel> {
  type = 'classDiagram';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('classDiagram') || trimmed.startsWith('class diagram');
  }

  parse(code: string): ClassDiagramModel {
    const classes: ClassDef[] = [];
    const relationships: ClassRelationship[] = [];
    const lines = code.split('\n');
    
    let classId = 1;
    let relId = 1;
    let currentClass: ClassDef | null = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 跳过空行、注释和声明
      if (!trimmed || trimmed.startsWith('%%') || trimmed === 'classDiagram') return;
      
      // 检测类定义
      const classMatch = trimmed.match(/class\s+(\w+)\s*\{/);
      if (classMatch) {
        currentClass = {
          id: `class-${classId++}`,
          name: classMatch[1],
          members: [],
        };
        return;
      }
      
      // 检测类定义结束
      if (trimmed === '}') {
        if (currentClass) {
          classes.push(currentClass);
          currentClass = null;
        }
        return;
      }
      
      // 解析类成员
      if (currentClass) {
        const memberMatch = trimmed.match(/([+#-])?\s*(\w+)\s*\((.*)\)/);
        if (memberMatch) {
          const visibilityChar = memberMatch[1];
          let visibility: 'public' | 'private' | 'protected' = 'public';
          if (visibilityChar === '-') visibility = 'private';
          else if (visibilityChar === '#') visibility = 'protected';
          
          currentClass.members.push({
            visibility,
            type: 'method',
            signature: trimmed,
          });
          return;
        }
        
        const fieldMatch = trimmed.match(/([+#-])?\s*(\w+)/);
        if (fieldMatch) {
          const visibilityChar = fieldMatch[1];
          let visibility: 'public' | 'private' | 'protected' = 'public';
          if (visibilityChar === '-') visibility = 'private';
          else if (visibilityChar === '#') visibility = 'protected';
          
          currentClass.members.push({
            visibility,
            type: 'field',
            signature: trimmed,
          });
        }
        return;
      }
      
      // 解析关系
      const relMatch = trimmed.match(/(\w+)\s*(<|--|\*--|o--|--|..)\s*(\w+)/);
      if (relMatch) {
        const source = relMatch[1];
        const target = relMatch[3];
        const symbol = relMatch[2];
        
        let type: ClassRelationship['type'] = 'association';
        if (symbol === '<|--') type = 'inheritance';
        else if (symbol === '*--') type = 'composition';
        else if (symbol === 'o--') type = 'aggregation';
        else if (symbol === '..') type = 'dependency';
        
        // 提取标签
        const labelMatch = trimmed.match(/:\s*(.+)/);
        
        relationships.push({
          id: `rel-${relId++}`,
          source,
          target,
          type,
          label: labelMatch ? labelMatch[1].trim() : undefined,
        });
      }
    });
    
    return { classes, relationships };
  }

  toMermaid(model: ClassDiagramModel): string {
    let mermaidCode = 'classDiagram\n';
    
    model.classes.forEach(cls => {
      mermaidCode += `    class ${cls.name} {\n`;
      cls.members.forEach(member => {
        const prefix = member.visibility === 'private' ? '-' : 
                      member.visibility === 'protected' ? '#' : '+';
        mermaidCode += `        ${prefix}${member.signature}\n`;
      });
      mermaidCode += `    }\n`;
    });
    
    model.relationships.forEach(rel => {
      let symbol = '--';
      if (rel.type === 'inheritance') symbol = '<|--';
      else if (rel.type === 'composition') symbol = '*--';
      else if (rel.type === 'aggregation') symbol = 'o--';
      else if (rel.type === 'dependency') symbol = '..';
      
      mermaidCode += `    ${rel.source} ${symbol} ${rel.target}`;
      if (rel.label) {
        mermaidCode += ` : ${rel.label}`;
      }
      mermaidCode += '\n';
    });
    
    return mermaidCode;
  }

  getEditorComponent(): React.ComponentType<EditorProps<ClassDiagramModel>> {
    return ClassDiagramEditor;
  }

  getDefaultModel(): ClassDiagramModel {
    return {
      classes: [],
      relationships: [],
    };
  }
}
