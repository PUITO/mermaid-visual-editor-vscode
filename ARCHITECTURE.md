# Mermaid Visual Editor 架构文档

## 概述

本项目采用可扩展的图表处理器架构，支持多种 Mermaid 图表类型的可视化和编辑。

## 架构设计

### 核心组件

```
webview-src/
├── diagrams/                    # 图表处理器目录
│   ├── types.ts                # 核心接口和注册表
│   ├── index.ts                # 注册表初始化
│   ├── flowchart/              # 流程图处理器
│   │   └── handler.ts
│   ├── erDiagram/              # ER 图处理器
│   │   └── handler.tsx
│   └── sequence/               # 序列图处理器
│       └── handler.tsx
├── App.tsx                     # 主应用组件
├── mermaidSerializer.ts        # Mermaid 序列化/反序列化
└── store.ts                    # 状态管理
```

### 核心接口

#### DiagramHandler

所有图表类型都必须实现此接口：

```typescript
interface DiagramHandler<T = any> {
  type: string;                    // 图表类型标识
  detect(code: string): boolean;   // 检测代码类型
  parse(code: string): T;          // 解析为内部模型
  toMermaid(model: T): string;     // 转换为 Mermaid 代码
  getEditorComponent(): React.ComponentType;  // 获取编辑器组件
  getDefaultModel(): T;            // 获取默认模型
  layout?(model: T): Promise<T>;   // 自动布局（可选）
}
```

#### DiagramRegistry

图表注册表负责管理和分发图表处理器：

```typescript
class DiagramRegistry {
  register(handler: DiagramHandler, isDefault?: boolean): void;
  getHandler(code: string): DiagramHandler;
  getHandlerByType(type: string): DiagramHandler | undefined;
  getRegisteredTypes(): string[];
}
```

## 支持的图表类型

### 1. Flowchart (流程图) - ✅ 完全支持

- **检测**: `graph` 或 `flowchart` 开头
- **编辑器**: React Flow + Dagre 自动布局
- **功能**: 
  - 拖拽节点
  - 连接节点
  - 自定义形状和样式
  - 自动布局

### 2. ER Diagram (实体关系图) - 🔧 部分支持

- **检测**: `erDiagram` 开头
- **编辑器**: 表单编辑 + Mermaid 渲染（初期）
- **计划功能**:
  - 实体和关系的可视化编辑
  - 属性管理
  - 关系类型配置

### 3. Sequence Diagram (序列图) - 🔧 部分支持

- **检测**: `sequenceDiagram` 开头
- **编辑器**: 表单编辑 + Mermaid 渲染（初期）
- **计划功能**:
  - 参与者管理
  - 消息流编辑
  - 时间轴可视化

## 工作流程

### 1. 文件打开流程

```
VS Code 打开 .mmd 文件
    ↓
Webview 接收文件内容
    ↓
DiagramRegistry.getHandler(code) 检测图表类型
    ↓
根据类型选择对应的处理器
    ↓
处理器解析代码为内部模型
    ↓
渲染对应的编辑器组件
```

### 2. 编辑保存流程

```
用户编辑图表
    ↓
内部模型更新
    ↓
处理器.toMermaid(model) 转换为 Mermaid 代码
    ↓
发送保存请求到 VS Code
    ↓
VS Code 更新文件内容
```

## 扩展新图表类型

### 步骤 1: 创建处理器目录

```bash
mkdir -p webview-src/diagrams/yourDiagram
```

### 步骤 2: 实现处理器

创建 `handler.tsx` 文件：

```typescript
import { DiagramHandler, EditorProps } from '../types';

interface YourDiagramModel {
  // 定义你的模型结构
}

const YourDiagramEditor: React.FC<EditorProps<YourDiagramModel>> = ({ model, onChange }) => {
  // 实现编辑器组件
  return <div>Your Editor</div>;
};

export class YourDiagramHandler implements DiagramHandler<YourDiagramModel> {
  type = 'yourDiagram';

  detect(code: string): boolean {
    return code.trim().startsWith('yourDiagram');
  }

  parse(code: string): YourDiagramModel {
    // 实现解析逻辑
    return { /* ... */ };
  }

  toMermaid(model: YourDiagramModel): string {
    // 实现序列化逻辑
    return 'yourDiagram\n...';
  }

  getEditorComponent() {
    return YourDiagramEditor;
  }

  getDefaultModel(): YourDiagramModel {
    return { /* ... */ };
  }
}
```

### 步骤 3: 注册处理器

在 `diagrams/index.ts` 中添加：

```typescript
import { YourDiagramHandler } from './yourDiagram/handler';

export function initializeDiagramRegistry() {
  // ... 现有注册
  
  diagramRegistry.register(new YourDiagramHandler());
}
```

## 技术栈

- **前端框架**: React 19
- **流程图引擎**: React Flow (@xyflow/react)
- **布局引擎**: Dagre
- **状态管理**: Zustand
- **构建工具**: Webpack 5
- **语言**: TypeScript

## 开发指南

### 本地开发

```bash
npm install
npm run compile
F5 (在 VS Code 中启动调试)
```

### 添加新功能

1. 在对应的处理器中实现功能
2. 确保双向同步（parse ↔ toMermaid）
3. 添加单元测试
4. 更新文档

## 未来计划

- [ ] 完善 ER 图可视化编辑器
- [ ] 完善序列图可视化编辑器
- [ ] 添加类图支持 (classDiagram)
- [ ] 添加状态图支持 (stateDiagram)
- [ ] 添加甘特图支持 (gantt)
- [ ] 改进布局算法（集成 ElkJS）
- [ ] 添加更多自定义样式选项
- [ ] 支持导入/导出功能

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

MIT License
