# Mermaid 图表类型综合示例

本文件汇总了 tests 目录中所有不同格式的 Mermaid 图表示例，用于对比不同插件的渲染效果。

## 前置要求

**需要安装 Markdown Preview Enhanced 扩展**

本文件使用 Markdown Preview Enhanced 的图表嵌入语法来加载外部 Mermaid 文件。请确保已安装以下扩展：

- **Markdown Preview Enhanced** (by Yiyi Wang)
  - VS Code Marketplace: [链接](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced)
  - GitHub: [项目地址](https://github.com/shd101wyy/vscode-markdown-preview-enhanced)

### 重要说明

**文件格式与渲染方式：**

1. **`.mmd` 文件**：仅作为代码文件存储，不会自动渲染为图片
2. **`.mermaid` 文件**：可以被 Markdown Preview Enhanced 识别并渲染为图表

**嵌入语法：**

Markdown Preview Enhanced **仅支持**以下语法导入 `.mermaid` 文件：

```markdown
<!-- @import "./diagram.mermaid" -->
```

**注意**：
- `<!-- mmd: diagram.mmd -->` 语法**不被支持**，无法渲染图表
- 必须使用 `.mermaid` 后缀的文件才能被正确识别和渲染
- `.mmd` 文件只能显示原始代码，不会生成可视化图表

### 使用方法

1. 安装 Markdown Preview Enhanced 扩展
2. 打开此文件
3. 右键选择 "Markdown Preview Enhanced: Open Preview to the Side"
4. 只有使用 `<!-- @import "...mermaid" -->` 语法的图表才会被渲染

---

## 1. Graph (基础图)

来源：[test-graph.mermaid](./test-graph.mermaid)

<!-- @import "./test-graph.mermaid" -->

---

## 2. Flowchart (流程图)

来源：[test-flowchart.mmd](./test-flowchart.mmd)

<!-- @import "./test-flowchart.mermaid" -->

---

## 3. Sequence Diagram (时序图)

来源：[test-sequence.mmd](./test-sequence.mmd)

<!-- @import "./test-sequence.mmd" {class="mermaid"} -->

---

## 4. Class Diagram (类图)

来源：[test-class.mmd](./test-class.mmd)

<!-- @import "./test-class.mmd" {class="mermaid"} -->

---

## 5. State Diagram (状态图)

来源：[test-state.mmd](./test-state.mmd)

<!-- @import "./test-state.mmd" {class="mermaid"} -->

---

## 6. Gantt Chart (甘特图)

来源：[test-gantt.mmd](./test-gantt.mmd)

<!-- @import "./test-gantt.mmd" {class="mermaid"} -->

---

## 7. Pie Chart (饼图)

来源：[test-pie.mmd](./test-pie.mmd)

<!-- @import "./test-pie.mmd" {class="mermaid"} -->

---

## 8. User Journey (用户旅程图)

来源：[test-journey.mmd](./test-journey.mmd)

<!-- @import "./test-journey.mmd" {class="mermaid"} -->

---

## 9. Git Graph (Git 提交历史图)

来源：[test-gitgraph.mmd](./test-gitgraph.mmd)

<!-- @import "./test-gitgraph.mmd" {class="mermaid"} -->

---

## 10. ER Diagram (实体关系图)

来源：[test-er.mmd](./test-er.mmd)

<!-- @import "./test-er.mmd" {class="mermaid"} -->

---

## 11. Requirement Diagram (需求图)

来源：[test-requirement.mmd](./test-requirement.mmd)

> **注意**: `requirementDiagram` 语法需要 Mermaid 11+ 版本。当前项目使用 Mermaid 10.6.0，此图表可能无法正确渲染。

<!-- @import "./test-requirement.mmd" {class="mermaid"} -->

---

## 12. Architecture Diagram (架构图)

来源：[test-architecture.mmd](./test-architecture.mmd)

> **注意**: `architecture-beta` 语法需要 Mermaid 11+ 版本。当前项目使用 Mermaid 10.6.0，此图表可能无法正确渲染。

<!-- @import "./test-architecture.mmd" {class="mermaid"} -->

---

## 使用说明

### 在 VS Code 中查看

1. 安装支持 Mermaid 预览的扩展（如 "Mermaid Preview"）
2. 打开此文件
3. 每个代码块都会自动渲染为对应的图表

### 对比不同插件的渲染效果

此文件包含所有主要的 Mermaid 图表类型，可以用于：
- 测试不同 VS Code 扩展的渲染能力
- 验证语法兼容性
- 对比渲染质量和样式
- 检查对各图表类型的支持程度

### 相关文件

- [README.md](./README.md) - 测试文件详细说明
- [TESTING.md](./TESTING.md) - 完整测试清单
- [SUMMARY.md](./SUMMARY.md) - 工作总结
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考

---

**总计：12 种图表类型**

所有示例均来自 `tests/` 目录中的独立测试文件，确保语法的准确性和完整性。
