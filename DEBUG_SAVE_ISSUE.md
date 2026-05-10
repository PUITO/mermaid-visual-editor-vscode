# 保存覆盖问题调试指南

## 问题描述

序列图和状态图可以正常渲染和加载，但在保存后内容被覆盖为 `flowchart TB`。

## 调试步骤

### 1. 打开开发者工具

在 VS Code 中：
1. 打开一个序列图或状态图文件（如 `tests/test-sequence.mmd`）
2. 按 `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (Mac) 打开开发者工具
3. 切换到 **Console** 标签

### 2. 观察日志

打开文件时，应该看到类似这样的日志：

```
[App] Detected diagram type: sequenceDiagram
[App] Skipping serialization for non-flowchart type: sequenceDiagram
```

**如果看到这些日志，说明初始化正确。**

### 3. 触发保存

尝试以下操作来触发保存：

1. **关闭 webview 面板** - 这会触发 `requestSave`
2. **切换焦点** - 从 webview 切换到其他编辑器
3. **手动保存** - 按 `Ctrl+S`

### 4. 检查保存日志

保存时应该看到：

```
[App] requestSave triggered, diagramType: sequenceDiagram
[App] previewContent length: XXX
[App] previewContent preview: sequenceDiagram...
[App] Using previewContent for non-flowchart
[App] Saving content, length: XXX
[App] Content preview: sequenceDiagram...
```

**关键点**：
- `diagramType` 应该是 `sequenceDiagram` 或 `stateDiagram`，而不是 `flowchart`
- `previewContent preview` 应该以 `sequenceDiagram` 或 `stateDiagram-v2` 开头
- 不应该看到 `flowchart TB`

### 5. 如果看到错误的日志

#### 情况 A：diagramType 是 flowchart

```
[App] requestSave triggered, diagramType: flowchart
[App] Serializing flowchart
```

**原因**：diagramType 被错误地设置为 flowchart
**可能的问题**：
- 图表类型检测失败
- diagramType 状态被意外修改

#### 情况 B：previewContent 是 flowchart TB

```
[App] previewContent preview: flowchart TB
```

**原因**：previewContent 被 useEffect 覆盖了
**可能的问题**：
- useEffect 的条件检查没有生效
- nodes/edges 不为空导致触发了序列化

#### 情况 C：看到序列化日志

```
[App] Serialized flowchart: flowchart TB
```

**原因**：非 flowchart 类型触发了序列化
**可能的问题**：
- diagramType 检查失效
- 有其他代码路径触发了序列化

### 6. 报告问题

请提供以下信息：

1. **完整的控制台日志**（从打开文件到保存的整个过程）
2. **测试的文件**（test-sequence.mmd 还是 test-state.mmd）
3. **触发保存的操作**（关闭面板、切换焦点、还是手动保存）
4. **最终文件内容**（保存后文件变成了什么）

## 预期的正确行为

### 序列图

**打开时**：
```
[App] Detected diagram type: sequenceDiagram
[App] Skipping serialization for non-flowchart type: sequenceDiagram
```

**保存时**：
```
[App] requestSave triggered, diagramType: sequenceDiagram
[App] previewContent length: 500
[App] previewContent preview: sequenceDiagram
    participant User as 用户
    ...
[App] Using previewContent for non-flowchart
[App] Saving content, length: 500
[App] Content preview: sequenceDiagram
    participant User as 用户
    ...
```

**保存后**：文件内容保持不变

### 状态图

**打开时**：
```
[App] Detected diagram type: stateDiagram
[App] Skipping serialization for non-flowchart type: stateDiagram
```

**保存时**：
```
[App] requestSave triggered, diagramType: stateDiagram
[App] previewContent length: 400
[App] previewContent preview: stateDiagram-v2
    [*] --> Created
    ...
[App] Using previewContent for non-flowchart
[App] Saving content, length: 400
[App] Content preview: stateDiagram-v2
    [*] --> Created
    ...
```

**保存后**：文件内容保持不变

## 常见问题

### Q: 为什么只有序列图和状态图有问题？

A: 可能是因为这两种类型的解析器或编辑器有特殊的行为，或者它们在初始化时的处理流程不同。

### Q: 流程图是否正常？

A: 是的，流程图使用 React Flow 编辑，nodes/edges 不为空，序列化是正确的。

### Q: ER 图和甘特图是否正常？

A: 需要测试确认。如果也有问题，日志会帮助我们定位。

## 下一步

根据日志输出，我们可以：

1. **如果 diagramType 错误**：修复图表类型检测逻辑
2. **如果 previewContent 被覆盖**：找出是哪个 useEffect 或代码路径导致的
3. **如果有其他序列化触发**：添加更多的条件检查或移除错误的调用

---

**请按照上述步骤测试，并提供完整的日志输出。**
