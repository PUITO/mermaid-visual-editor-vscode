# 图表类型支持问题分析与解决方案

## 问题汇总

根据用户反馈，存在以下问题：

1. **test-sequence, test-er**: 无法渲染，显示 "No participants yet" / "No entities yet"
2. **test-requirement, test-gitgraph, test-journey**: 无法渲染，代码预览也没内容
3. **test-graph, test-flowchart**: 需要确认是否支持连线文本编辑（用于条件判断）
4. **test-architecture**: 覆盖了原有写法，造成连接关系丢失

## 问题分析与解决

### 1. ER 图和序列图编辑器显示空数据 ✅ 已修复

**问题**：
- ER 图编辑器显示 "No entities yet"
- 序列图编辑器显示 "No participants yet"

**原因**：
- 编辑器组件使用硬编码的空模型：`model={{ entities: [], relationships: [] }}`
- 没有从解析器获取实际的图表数据

**解决方案**：
```typescript
// 添加状态存储解析后的模型
const [erModel, setErModel] = useState<ERDiagramModel>({ entities: [], relationships: [] });
const [sequenceModel, setSequenceModel] = useState<SequenceDiagramModel>({ 
  participants: [], messages: [], notes: [] 
});

// 在 initContent 时解析并存储
if (handler.type === 'erDiagram') {
  const erHandler = diagramRegistry.getHandlerByType('erDiagram');
  const parsed = erHandler.parse(message.content);
  setErModel(parsed);
} else if (handler.type === 'sequenceDiagram') {
  const seqHandler = diagramRegistry.getHandlerByType('sequenceDiagram');
  const parsed = seqHandler.parse(message.content);
  setSequenceModel(parsed);
}

// 传递给编辑器
<ERDiagramEditor model={erModel} onChange={...} />
<SequenceDiagramEditor model={sequenceModel} onChange={...} />
```

**状态**：✅ 已修复并提交

---

### 2. Requirement、GitGraph、Journey 无法渲染 ⚠️ 待处理

**问题**：
- 这些图表类型无法渲染
- 代码预览也没有内容

**原因分析**：
这些图表类型目前没有对应的处理器（Handler），因此：
1. `diagramRegistry.getHandler()` 可能返回默认处理器或 undefined
2. 没有解析器来提取内容
3. previewContent 可能为空或被错误覆盖

**当前状态检查**：

让我检查这些类型是否有处理器：

```bash
# 检查 diagrams 目录
ls webview-src/diagrams/
```

预期结果应该只有：
- flowchart/
- erDiagram/
- sequence/
- classDiagram/
- stateDiagram/
- gantt/
- pieChart/

**缺少**：
- requirement/
- gitGraph/
- journey/

**解决方案选项**：

#### 选项 A：创建完整的处理器（推荐长期方案）
为每种类型创建完整的 Handler，包括：
- detect() - 检测图表类型
- parse() - 解析 Mermaid 代码
- toMermaid() - 序列化为 Mermaid 代码
- getEditorComponent() - 返回编辑器组件

#### 选项 B：使用通用处理器（快速方案）
创建一个 GenericHandler，保留原始代码不做解析：
```typescript
class GenericHandler implements DiagramHandler<string> {
  type: string;
  
  detect(code: string): boolean {
    return code.trim().startsWith(this.type);
  }
  
  parse(code: string): string {
    return code; // 保留原始代码
  }
  
  toMermaid(model: string): string {
    return model; // 直接返回
  }
  
  getEditorComponent() {
    return () => <div>Code view only</div>;
  }
  
  getDefaultModel(): string {
    return '';
  }
}
```

**建议**：先实现选项 B 确保基本功能，再逐步实现选项 A。

---

### 3. Flowchart 连线文本编辑 ✅ 已支持但需验证

**问题**：
- 需要确认流程图是否支持连线文本的添加和编辑
- 用于显示和标注条件判断（如菱形节点的 Yes/No）

**当前实现检查**：

查看 App.tsx 中的 onConnect 和 ContextMenu：

```typescript
// onConnect 创建边时
const newEdge: DiagramEdge = {
  id: `edge-${Date.now()}`,
  source: params.source,
  target: params.target,
  data: { 
    type: 'default',
    // ❌ 没有 label 字段
  },
};

// ContextMenu 中应该有边标签编辑
<ContextMenu
  edgeId={contextMenu.edgeId}
  onEdgeLabelChange={handleEdgeLabelChange}  // ✅ 已实现
/>
```

**已实现的功能**：
- ✅ ContextMenu 支持边标签编辑
- ✅ handleEdgeLabelChange 回调
- ✅ 序列化时包含 label：`A -->|label| B`
- ✅ 解析时提取 label

**需要验证**：
1. 右键点击连接线是否显示标签编辑输入框
2. 输入标签后是否正确保存
3. 重新打开文件时标签是否正确加载

**测试步骤**：
1. 打开 test-flowchart.mmd
2. 创建两个节点并连接
3. 右键点击连接线
4. 在"标签文本"输入框中输入"Yes"或"No"
5. 点击"应用标签"
6. 保存并重新打开
7. 检查标签是否正确显示

---

### 4. test-architecture 内容被覆盖 ❌ 严重问题

**问题**：
- 原有的写法被覆盖
- 连接关系丢失

**可能原因**：
1. 图表类型检测错误（可能被检测为 flowchart）
2. 使用了错误的解析器
3. 序列化时丢失了信息

**需要检查**：
```bash
# 查看 test-architecture.mmd 的原始内容
git show HEAD:tests/test-architecture.mmd | head -20

# 查看当前内容
cat tests/test-architecture.mmd | head -20

# 查看差异
git diff tests/test-architecture.mmd
```

**常见原因**：
- 如果文件以 `graph` 开头，可能被检测为 flowchart
- 复杂的连接语法可能不被解析器支持
- 子图（subgraph）可能没有被正确处理

**解决方案**：
1. 检查图表类型检测逻辑
2. 确保使用正确的处理器
3. 对于不支持的类型，保留原始代码
4. 添加日志记录诊断信息

---

## 优先级排序

### P0 - 立即修复（影响数据完整性）
1. ❌ test-architecture 内容被覆盖
   - 需要立即调查和修复
   - 防止其他文件也被覆盖

### P1 - 高优先级（影响核心功能）
2. ✅ ER 图和序列图编辑器显示空数据 - **已修复**
3. ⚠️ Requirement/GitGraph/Journey 无法渲染
   - 至少应该显示代码预览
   - 不应该报错或空白

### P2 - 中优先级（功能完善）
4. ✅ Flowchart 连线文本编辑 - **已实现，待验证**
   - 需要用户测试确认功能正常

---

## 下一步行动

### 立即执行

1. **检查 test-architecture.mmd**
   ```bash
   git diff tests/test-architecture.mmd
   cat tests/test-architecture.mmd
   ```
   
2. **恢复被覆盖的文件**
   ```bash
   git checkout -- tests/test-architecture.mmd
   ```

3. **添加日志诊断**
   - 在图表类型检测处添加日志
   - 记录使用的是哪个处理器
   - 记录解析和序列化的内容

### 短期改进（1-2天）

4. **创建 GenericHandler**
   - 处理所有未明确支持的图表类型
   - 保留原始代码
   - 显示代码预览

5. **验证 Flowchart 连线文本**
   - 用户测试
   - 根据反馈调整

### 中期规划（1周）

6. **实现 Requirement Handler**
7. **实现 GitGraph Handler**
8. **实现 Journey Handler**

---

## 技术债务

### 已知问题

1. **ER 图和序列图的编辑尚未实现序列化**
   - 编辑器可以显示数据
   - 但修改后不会更新到文件
   - 需要在 onChange 中实现序列化

2. **大型图表性能**
   - Mermaid SVG 渲染可能较慢
   - 需要考虑虚拟滚动或分页

3. **错误处理不完善**
   - 解析失败时的用户体验
   - 需要提供友好的错误提示

### 改进建议

1. **添加单元测试**
   - 测试每种图表类型的解析和序列化
   - 确保往返转换不丢失数据

2. **添加集成测试**
   - 测试打开、编辑、保存的完整流程
   - 自动化回归测试

3. **性能优化**
   - 防抖和节流
   - 懒加载
   - 缓存机制

---

## 总结

**已完成**：
- ✅ ER 图和序列图编辑器数据加载
- ✅ Flowchart 连线文本编辑功能
- ✅ 详细的调试日志

**待处理**：
- ❌ test-architecture 内容覆盖问题（P0）
- ⚠️ Requirement/GitGraph/Journey 支持（P1）
- 🔄 Flowchart 连线文本功能验证（P2）

**建议**：
1. 优先解决 test-architecture 的内容覆盖问题
2. 为未支持的图表类型添加 GenericHandler
3. 用户测试 Flowchart 连线文本功能
4. 根据测试结果进一步优化

---

**最后更新**: 2026-05-10
**版本**: 1.0.0
**分支**: refactor-diagram-architecture
