**推荐架构调整方案**（面向多图表类型、可扩展）

你的插件目前基于 **React Flow + Dagre** 强绑定流程图（Flowchart），这是“正侧”（正向可视化）处理的核心限制。下面给出**清晰、可落地**的架构重构方案，支持后续轻松扩展 **erDiagram、sequenceDiagram、classDiagram、stateDiagram、gantt** 等多种语法，同时保持拖拽编辑体验。

### 1. 整体架构分层设计（推荐）

```mermaid
flowchart TD
    A[VS Code Extension Layer] --> B[Webview Core]
    B --> C[Diagram Type Registry]
    C --> D1[Flowchart Handler]
    C --> D2[ER Diagram Handler]
    C --> D3[Sequence Handler]
    C --> D4[... Other Handlers]
    
    B --> E[Unified Model / AST]
    E --> F[Renderer Bridge\n(Mermaid.js)]
    E --> G[Editor Bridge\n(React Flow / 专用编辑器)]
    
    subgraph "可扩展核心"
        C
        E
    end
```

### 2. 核心模块拆分建议

| 模块 | 职责 | 推荐实现方式 | 是否替换现有 |
|------|------|-------------|-------------|
| **Diagram Detector** | 自动检测当前 Mermaid 代码属于哪种图表（`flowchart`、`erDiagram`、`sequenceDiagram` 等） | 正则 + Mermaid.parse() + 关键字检测 | 新增 |
| **Diagram Registry** | 注册所有支持的图表类型（类似插件系统） | TypeScript Map / Registry 模式 | 新增（核心） |
| **Abstract Diagram Handler** | 定义每个图表类型的接口（parse、toModel、toMermaid、getEditorComponent 等） | Interface + Factory | 新增 |
| **Unified Internal Model** | 所有图表共用的中间模型 + 各自特有扩展 | Zod / TypeScript 类型 | 替换现有节点/边模型 |
| **Editor Layer** | 拖拽编辑界面 | React Flow（Flowchart） + 专用组件（Sequence、ER 等） | 部分保留 |
| **Renderer Layer** | 最终渲染 | Mermaid.js render() | 保留 |
| **Bidirectional Sync** | 代码 ↔ 画布 双向同步 | Debounced parser + Diff | 优化现有 |

### 3. 详细实现方案

**步骤 1：创建 Diagram Type 系统**

在 `webview-src/src` 下新建目录结构：

```
diagrams/
├── index.ts                 # Registry
├── types.ts                 # 公共类型
├── flowchart/
│   ├── handler.ts
│   ├── model.ts
│   └── components/
├── erDiagram/
│   ├── handler.ts
│   └── components/          # 可考虑使用 react-flow 或自定义 SVG 编辑
├── sequence/
└── ...
```

**核心接口示例**：

```ts
export interface DiagramHandler<T = any> {
  type: string;                    // 'flowchart' | 'erDiagram' | ...
  detect(code: string): boolean;
  parse(code: string): T;          // 转为内部模型
  toMermaid(model: T): string;
  getEditorComponent(): React.ComponentType<EditorProps<T>>;
  getDefaultModel(): T;
  layout?(model: T): Promise<T>;   // Dagre / elkjs / custom
}
```

**步骤 2：Registry（注册中心）**

```ts
class DiagramRegistry {
  private handlers = new Map<string, DiagramHandler>();

  register(handler: DiagramHandler) { ... }
  
  getHandler(code: string): DiagramHandler {
    for (const h of this.handlers.values()) {
      if (h.detect(code)) return h;
    }
    return defaultFlowchartHandler;
  }
}
```

**步骤 3：内部模型设计**

- 通用部分：`id`、`position`、`label`、`style` 等
- 特定部分：使用 `type` + `data: any` 或继承具体 Model 类

对于 **ER Diagram**，推荐单独模型（实体、关系、属性），不强行塞进 React Flow 的 node/edge（除非你想做可视化拖拽）。

**步骤 4：不同图表编辑策略**

- **Flowchart** → 继续使用 **React Flow**（已成熟）
- **ER Diagram** → 可选方案：
  1. 轻量模式：只读 Mermaid 渲染 + 属性表单编辑（推荐先做）
  2. 完整拖拽：React Flow + 自定义节点（Entity Node）
- **Sequence Diagram** → 时间轴为主，推荐自定义 Canvas 或 ElkJS 布局 + React Flow（垂直泳道）
- **Class / State** → 类似 ER 的混合模式

**步骤 5：VS Code 侧调整**

- `package.json` 的 `customEditors` 保持不变
- Webview 收到代码后 → `detector` → `registry.getHandler()` → 渲染对应组件
- 增加配置项：`mermaidVisualEditor.defaultDiagramType`

### 4. 迁移路线图（最小改动）

1. **短期（1-2 周）**：保留现有 Flowchart，引入 Registry + Detector，实现自动识别并 fallback。
2. **中期**：添加 ER Diagram（先表单 + Mermaid 渲染模式）。
3. **长期**：为每种图表开发专用可视化编辑器。

### 5. 推荐额外技术/库

- **布局**：Dagre（保留） + ElkJS（更强大，支持多种图）
- **解析**：`mermaid` 官方 parser（越来越强）
- **状态管理**：继续用 Zustand（很好）
- **验证**：Zod schema per diagram type
- **测试**：每个 Handler 写单元测试（parse ↔ toMermaid 可逆性）

---

**需要我立刻提供哪些具体代码？**

1. `DiagramRegistry` + `Handler` 接口完整代码
2. ER Diagram Handler 骨架（含实体-关系模型）
3. 改进后的 Webview 主入口（Detector + 动态组件加载）
4. 项目目录结构调整建议

告诉我你优先想实现哪个图表类型（ER Diagram？），我马上给你对应代码模板。