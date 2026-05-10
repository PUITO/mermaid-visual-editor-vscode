# 新架构快速参考

## 核心概念

### DiagramHandler 接口

每个图表类型必须实现的接口：

```typescript
interface DiagramHandler<T> {
  type: string;                      // 图表类型标识符
  detect(code: string): boolean;     // 检测是否为此类型
  parse(code: string): T;            // Mermaid → 模型
  toMermaid(model: T): string;       // 模型 → Mermaid
  getEditorComponent(): React.ComponentType;  // 编辑器组件
  getDefaultModel(): T;              // 默认空模型
}
```

### DiagramRegistry 注册表

管理所有图表处理器的单例：

```typescript
// 获取全局实例
import { diagramRegistry } from './diagrams';

// 检测图表类型
const handler = diagramRegistry.getHandler(mermaidCode);

// 根据类型获取
const flowchartHandler = diagramRegistry.getHandlerByType('flowchart');

// 获取所有已注册类型
const types = diagramRegistry.getRegisteredTypes();
```

## 添加新图表类型（5 步）

### 步骤 1: 创建目录

```bash
mkdir -p webview-src/diagrams/myDiagram
```

### 步骤 2: 定义模型

```typescript
// webview-src/diagrams/myDiagram/model.ts
export interface MyDiagramModel {
  // 定义你的数据结构
  items: Array<{ id: string; name: string }>;
}
```

### 步骤 3: 实现处理器

```typescript
// webview-src/diagrams/myDiagram/handler.tsx
import { DiagramHandler, EditorProps } from '../types';
import { MyDiagramModel } from './model';

const MyDiagramEditor: React.FC<EditorProps<MyDiagramModel>> = ({ model, onChange }) => {
  return (
    <div>
      <h3>My Diagram Editor</h3>
      {/* 实现编辑界面 */}
    </div>
  );
};

export class MyDiagramHandler implements DiagramHandler<MyDiagramModel> {
  type = 'myDiagram';

  detect(code: string): boolean {
    return code.trim().startsWith('myDiagram');
  }

  parse(code: string): MyDiagramModel {
    // 解析 Mermaid 代码
    // TODO: 实现解析逻辑
    return { items: [] };
  }

  toMermaid(model: MyDiagramModel): string {
    // 转换为 Mermaid 代码
    let code = 'myDiagram\n';
    model.items.forEach(item => {
      code += `    ${item.name}\n`;
    });
    return code;
  }

  getEditorComponent() {
    return MyDiagramEditor;
  }

  getDefaultModel(): MyDiagramModel {
    return { items: [] };
  }
}
```

### 步骤 4: 注册处理器

编辑 `webview-src/diagrams/index.ts`：

```typescript
import { MyDiagramHandler } from './myDiagram/handler';

export function initializeDiagramRegistry() {
  // ... 现有注册
  
  // 添加新处理器
  diagramRegistry.register(new MyDiagramHandler());
}
```

### 步骤 5: 测试

1. 编译项目：`npm run compile`
2. 按 F5 启动调试
3. 打开对应的 .mmd 文件
4. 验证检测和编辑功能

## 常用模式

### 模式 1: 仅支持代码编辑（初期推荐）

对于复杂图表，先实现代码保留，稍后再添加可视化：

```typescript
parse(code: string): MyDiagramModel {
  // 暂时不解析，返回空模型
  console.log('Parsing not implemented yet');
  return this.getDefaultModel();
}

toMermaid(model: MyDiagramModel): string {
  // 直接使用保存的原始代码
  return model.originalCode || '';
}
```

### 模式 2: 表单编辑 + 实时预览

适合 ER 图、序列图等结构化数据：

```typescript
const MyDiagramEditor: React.FC<EditorProps<MyDiagramModel>> = ({ model, onChange }) => {
  const addItem = () => {
    onChange({
      ...model,
      items: [...model.items, { id: Date.now().toString(), name: 'New Item' }]
    });
  };

  return (
    <div>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {model.items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### 模式 3: React Flow 可视化

适合流程图、状态图等节点-边结构：

```typescript
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';

const MyDiagramEditor: React.FC<EditorProps<MyDiagramModel>> = ({ model, onChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(model.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(model.edges);

  useEffect(() => {
    onChange({ ...model, nodes, edges });
  }, [nodes, edges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};
```

## 调试技巧

### 查看检测日志

```typescript
// 在 App.tsx 中已添加
console.log('Detected diagram type:', handler.type);
```

### 测试解析器

```typescript
// 在浏览器控制台中
import { diagramRegistry } from './diagrams';

const code = `graph TB
    A[Start] --> B[End]`;

const handler = diagramRegistry.getHandler(code);
console.log('Type:', handler.type);
console.log('Parsed:', handler.parse(code));
```

### 验证双向同步

```typescript
// 确保 parse ↔ toMermaid 可逆
const original = 'graph TB\n    A --> B';
const model = handler.parse(original);
const regenerated = handler.toMermaid(model);
console.log('Match:', original === regenerated);
```

## 常见问题

### Q: 如何调试检测失败？

A: 检查 `detect()` 方法的正则表达式或字符串匹配逻辑。

### Q: 如何处理解析错误？

A: 在 `parse()` 中使用 try-catch，返回默认模型并记录错误。

### Q: 可以动态加载处理器吗？

A: 可以，使用 Webpack 的 `import()` 实现懒加载。

### Q: 如何测试新图表类型？

A: 在 `tests/` 目录创建测试文件，用插件打开验证。

## 最佳实践

1. **类型安全**: 为每个模型定义清晰的 TypeScript 接口
2. **错误处理**: 在 parse 和 toMermaid 中添加错误处理
3. **单元测试**: 为每个处理器编写测试用例
4. **文档**: 在处理器中添加注释说明格式和限制
5. **渐进增强**: 先实现基本功能，再逐步添加高级特性

## 资源链接

- [架构文档](./ARCHITECTURE.md)
- [重构总结](./REFACTORING_SUMMARY.md)
- [temp.md](./temp.md) - 原始设计建议
- [React Flow 文档](https://reactflow.dev/)
- [Mermaid 文档](https://mermaid.js.org/)
