/**
 * 图表处理器接口
 * 所有图表类型都需要实现此接口
 */
export interface DiagramHandler<T = any> {
  /** 图表类型标识 */
  type: string;
  
  /** 检测代码是否属于此图表类型 */
  detect(code: string): boolean;
  
  /** 解析 Mermaid 代码为内部模型 */
  parse(code: string): T;
  
  /** 将内部模型转换为 Mermaid 代码 */
  toMermaid(model: T): string;
  
  /** 获取编辑器组件 */
  getEditorComponent(): React.ComponentType<any>;
  
  /** 获取默认模型 */
  getDefaultModel(): T;
  
  /** 自动布局（可选） */
  layout?(model: T): Promise<T>;
}

/**
 * 编辑器属性
 */
export interface EditorProps<T = any> {
  model: T;
  onChange: (model: T) => void;
  readOnly?: boolean;
}

/**
 * 图表注册表
 */
export class DiagramRegistry {
  private handlers = new Map<string, DiagramHandler>();
  private defaultHandler: DiagramHandler | null = null;

  /**
   * 注册图表处理器
   */
  register(handler: DiagramHandler, isDefault = false) {
    this.handlers.set(handler.type, handler);
    if (isDefault) {
      this.defaultHandler = handler;
    }
  }

  /**
   * 根据代码获取对应的处理器
   */
  getHandler(code: string): DiagramHandler {
    for (const handler of this.handlers.values()) {
      if (handler.detect(code)) {
        return handler;
      }
    }
    
    // 返回默认处理器或第一个注册的处理器
    return this.defaultHandler || Array.from(this.handlers.values())[0];
  }

  /**
   * 获取所有已注册的图表类型
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 根据类型获取处理器
   */
  getHandlerByType(type: string): DiagramHandler | undefined {
    return this.handlers.get(type);
  }
}

// 创建全局注册表实例
export const diagramRegistry = new DiagramRegistry();
