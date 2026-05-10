import { diagramRegistry } from './types';
import { FlowchartHandler } from './flowchart/handler';
import { ERDiagramHandler } from './erDiagram/handler';
import { SequenceDiagramHandler } from './sequence/handler';

/**
 * 初始化图表注册表
 * 注册所有支持的图表类型
 */
export function initializeDiagramRegistry() {
  // 注册流程图处理器（默认）
  diagramRegistry.register(new FlowchartHandler(), true);
  
  // 注册 ER 图处理器
  diagramRegistry.register(new ERDiagramHandler());
  
  // 注册序列图处理器
  diagramRegistry.register(new SequenceDiagramHandler());
  
  console.log('Diagram registry initialized with types:', diagramRegistry.getRegisteredTypes());
}

// 导出所有处理器和类型
export { diagramRegistry } from './types';
export type { DiagramHandler, EditorProps } from './types';

// 导出流程图相关
export { FlowchartHandler } from './flowchart/handler';
export type { FlowchartModel } from './flowchart/handler';

// 导出 ER 图相关
export { ERDiagramHandler } from './erDiagram/handler';
export type { ERDiagramModel, Entity, Attribute, Relationship } from './erDiagram/handler';

// 导出序列图相关
export { SequenceDiagramHandler } from './sequence/handler';
export type { SequenceDiagramModel, Participant, Message } from './sequence/handler';
