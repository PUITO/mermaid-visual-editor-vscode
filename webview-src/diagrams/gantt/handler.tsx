import { DiagramHandler, EditorProps } from '../types';

/**
 * 甘特图任务
 */
export interface GanttTask {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  status?: 'active' | 'done' | 'crit' | 'milestone';
}

/**
 * 甘特图模型
 */
export interface GanttModel {
  title?: string;
  dateFormat?: string;
  tasks: GanttTask[];
  sections: Array<{
    name: string;
    tasks: GanttTask[];
  }>;
}

/**
 * 甘特图编辑器组件（占位）
 */
const GanttEditor: React.FC<EditorProps<GanttModel>> = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Gantt Chart Editor</h3>
      <p>Visual editor for Gantt charts is coming soon.</p>
      <p>Please use the preview panel to view and edit the code.</p>
    </div>
  );
};

/**
 * 甘特图处理器
 */
export class GanttHandler implements DiagramHandler<GanttModel> {
  type = 'gantt';

  detect(code: string): boolean {
    const trimmed = code.trim();
    return trimmed.startsWith('gantt');
  }

  parse(code: string): GanttModel {
    const lines = code.split('\n');
    let title = '';
    let dateFormat = 'YYYY-MM-DD';
    const tasks: GanttTask[] = [];
    const sections: Array<{ name: string; tasks: GanttTask[] }> = [];
    
    let currentSection: { name: string; tasks: GanttTask[] } | null = null;
    let taskId = 1;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('%%')) return;
      
      // 检测 gantt 声明
      if (trimmed === 'gantt') return;
      
      // 检测标题
      const titleMatch = trimmed.match(/title\s+(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        return;
      }
      
      // 检测日期格式
      const dateFormatMatch = trimmed.match(/dateFormat\s+(\S+)/);
      if (dateFormatMatch) {
        dateFormat = dateFormatMatch[1];
        return;
      }
      
      // 检测 section
      const sectionMatch = trimmed.match(/section\s+(.+)/);
      if (sectionMatch) {
        currentSection = {
          name: sectionMatch[1].trim(),
          tasks: [],
        };
        sections.push(currentSection);
        return;
      }
      
      // 检测任务
      const taskMatch = trimmed.match(/(\w[\w\s]*?)\s*:\s*(\w+)\s*,\s*(.+)/);
      if (taskMatch) {
        const taskName = taskMatch[1].trim();
        const statusStr = taskMatch[2];
        const rest = taskMatch[3].trim();
        
        let taskStatus: GanttTask['status'] | undefined;
        if (statusStr === 'active' || statusStr === 'done' || statusStr === 'crit' || statusStr === 'milestone') {
          taskStatus = statusStr;
        }
        
        const task: GanttTask = {
          id: `task-${taskId++}`,
          name: taskName,
          status: taskStatus,
        };
        
        // 解析日期或持续时间
        const dateMatch = rest.match(/(\d{4}-\d{2}-\d{2})\s*,\s*(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          task.startDate = dateMatch[1];
          task.endDate = dateMatch[2];
        } else {
          task.duration = rest;
        }
        
        if (currentSection) {
          currentSection.tasks.push(task);
        } else {
          tasks.push(task);
        }
        return;
      }
      
      // 简单任务格式
      const simpleTaskMatch = trimmed.match(/(\w[\w\s]*?)\s*:\s*(.+)/);
      if (simpleTaskMatch && !trimmed.includes('section') && !trimmed.includes('dateFormat') && !trimmed.includes('title')) {
        const taskName = simpleTaskMatch[1].trim();
        const rest = simpleTaskMatch[2].trim();
        
        const task: GanttTask = {
          id: `task-${taskId++}`,
          name: taskName,
        };
        
        const dateMatch = rest.match(/(\d{4}-\d{2}-\d{2})\s*,\s*(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          task.startDate = dateMatch[1];
          task.endDate = dateMatch[2];
        } else {
          task.duration = rest;
        }
        
        if (currentSection) {
          currentSection.tasks.push(task);
        } else {
          tasks.push(task);
        }
      }
    });
    
    return {
      title: title || undefined,
      dateFormat,
      tasks,
      sections,
    };
  }

  toMermaid(model: GanttModel): string {
    let mermaidCode = 'gantt\n';
    
    if (model.title) {
      mermaidCode += `    title ${model.title}\n`;
    }
    
    mermaidCode += `    dateFormat ${model.dateFormat || 'YYYY-MM-DD'}\n`;
    
    model.sections.forEach(section => {
      mermaidCode += `\n    section ${section.name}\n`;
      section.tasks.forEach(task => {
        const statusPrefix = task.status ? `${task.status},` : '';
        const timeInfo = task.startDate && task.endDate 
          ? `${task.startDate}, ${task.endDate}`
          : task.duration || '1d';
        mermaidCode += `    ${task.name} :${statusPrefix} ${timeInfo}\n`;
      });
    });
    
    // 如果没有 section，直接输出任务
    if (model.sections.length === 0 && model.tasks.length > 0) {
      model.tasks.forEach(task => {
        const statusPrefix = task.status ? `${task.status},` : '';
        const timeInfo = task.startDate && task.endDate 
          ? `${task.startDate}, ${task.endDate}`
          : task.duration || '1d';
        mermaidCode += `    ${task.name} :${statusPrefix} ${timeInfo}\n`;
      });
    }
    
    return mermaidCode;
  }

  getEditorComponent(): React.ComponentType<EditorProps<GanttModel>> {
    return GanttEditor;
  }

  getDefaultModel(): GanttModel {
    return {
      tasks: [],
      sections: [],
    };
  }
}
