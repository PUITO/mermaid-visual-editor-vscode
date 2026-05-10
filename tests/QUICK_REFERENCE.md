# 测试文件快速参考

## 📊 可视化编辑（2个文件）

| 文件 | 类型 | 节点数 | 特性 |
|------|------|--------|------|
| [test-graph.mmd](test-graph.mmd) | graph TB | 8 | 多种形状、样式定义 |
| [test-flowchart.mmd](test-flowchart.mmd) | flowchart TD | 7 | 循环逻辑、条件分支 |

## 📖 只读模式（10个文件）

| 文件 | 类型 | 复杂度 | 主要特性 |
|------|------|--------|----------|
| [test-sequence.mmd](test-sequence.mmd) | sequenceDiagram | ⭐⭐ | 参与者、消息、注释 |
| [test-class.mmd](test-class.mmd) | classDiagram | ⭐⭐⭐ | 类、继承、注释 |
| [test-state.mmd](test-state.mmd) | stateDiagram-v2 | ⭐⭐ | 状态转换、注释块 |
| [test-gantt.mmd](test-gantt.mmd) | gantt | ⭐⭐⭐⭐ | 时间轴、任务依赖 |
| [test-pie.mmd](test-pie.mmd) | pie | ⭐ | 简单饼图 |
| [test-journey.mmd](test-journey.mmd) | journey | ⭐⭐ | 旅程阶段、评分 |
| [test-gitgraph.mmd](test-gitgraph.mmd) | gitGraph | ⭐⭐⭐ | 分支、合并、提交 |
| [test-er.mmd](test-er.mmd) | erDiagram | ⭐⭐⭐ | 实体、关系、属性 |
| [test-requirement.mmd](test-requirement.mmd) | requirementDiagram | ⭐⭐⭐ | 需求、风险等级 |
| [test-architecture.mmd](test-architecture.mmd) | architecture-beta | ⭐⭐⭐⭐ | 分组、服务、连接 |

## 🎯 快速测试指南

### 测试 flowchart/graph（应显示编辑器）
```bash
# 打开任意一个
test-graph.mmd
test-flowchart.mmd

# 预期结果：
✅ 显示可视化画布
✅ 可以拖拽节点
✅ 可以添加/删除节点
✅ 可以连接节点
```

### 测试其他类型（应显示警告）
```bash
# 打开任意一个
test-sequence.mmd
test-class.mmd
test-state.mmd
# ... 等等

# 预期结果：
⚠️ 工具栏显示黄色警告标签
📄 预览面板显示原始代码
🔒 内容不会被修改
```

## 📝 文件统计

- **总文件数**: 12 个测试文件
- **文档数**: 3 个（README, TESTING, SUMMARY）
- **总大小**: ~15 KB
- **覆盖率**: 100% Mermaid 主要图表类型

## 🔗 相关链接

- [完整说明](README.md)
- [测试清单](TESTING.md)
- [工作总结](SUMMARY.md)
- [项目 README](../README.md)
