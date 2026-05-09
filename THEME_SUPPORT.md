# VSCode 主题适配说明

## ✅ 已完成的主题适配功能

Mermaid Visual Editor 现已完全支持 VSCode 主题系统，能够自动跟随您当前的主题设置进行调整。

## 🎨 主题特性

### 1. **自动主题检测**
- 插件启动时自动检测当前 VSCode 主题类型（浅色/深色）
- 根据背景色亮度智能判断主题类型
- 自动应用对应的 Mermaid 主题（default/dark）

### 2. **实时主题同步**
- 当您在 VSCode 中切换主题时，编辑器会立即更新
- 所有 UI 元素都会使用新主题的颜色
- 无需刷新或重新打开文件

### 3. **完整的 CSS 变量覆盖**
使用 VSCode 原生颜色变量，确保与编辑器风格完全一致：

#### 编辑器区域
- `--vscode-editor-background` - 编辑器背景色
- `--vscode-editor-foreground` - 编辑器前景色（文字）

#### 工具栏
- `--vscode-toolbar-background` - 工具栏背景
- `--vscode-button-background` - 按钮背景
- `--vscode-button-foreground` - 按钮文字
- `--vscode-button-hoverBackground` - 按钮悬停背景

#### 面板和边框
- `--vscode-panel-border` - 面板边框颜色
- `--vscode-panelSectionHeader-background` - 面板头部背景
- `--vscode-panelSectionHeader-foreground` - 面板头部文字

#### 输入控件
- `--vscode-input-background` - 输入框背景
- `--vscode-input-foreground` - 输入框文字
- `--vscode-input-border` - 输入框边框

#### 错误提示
- `--vscode-errorForeground` - 错误文字颜色
- `--vscode-inputValidation-errorBackground` - 错误背景
- `--vscode-inputValidation-errorBorder` - 错误边框

#### 其他
- `--vscode-focusBorder` - 焦点边框
- `--vscode-scrollbarSlider-*` - 滚动条样式

## 🌓 支持的场景

### 浅色主题（Light Themes）
例如：
- Default Light+
- Light (Visual Studio)
- GitHub Light Theme

自动应用：
- Mermaid `default` 主题
- 浅色配色方案

### 深色主题（Dark Themes）
例如：
- Default Dark+
- Dark (Visual Studio)
- One Dark Pro
- Dracula
- Nord

自动应用：
- Mermaid `dark` 主题
- 深色配色方案

### 高对比度主题（High Contrast）
例如：
- High Contrast
- High Contrast Light

自动应用：
- 增强的边框和对比度
- 清晰的视觉边界

## 💡 使用技巧

### 手动切换主题
1. 在 VSCode 中按 `Ctrl+K Ctrl+T`（Mac: `Cmd+K Cmd+T`）
2. 选择您喜欢的主题
3. Mermaid 编辑器会立即跟随变化

### 推荐主题搭配

#### 编程工作流
- **浅色**: Default Light+ → 清晰易读
- **深色**: Default Dark+ → 减少眼部疲劳

#### 演示场景
- **浅色**: GitHub Light → 专业外观
- **深色**: One Dark Pro → 现代感强

#### 长时间编辑
- 推荐使用深色主题，减少眼睛疲劳
- 启用 VSCode 的自动主题切换（如果系统支持）

## 🔧 技术实现

### 前端实现
```typescript
// 检测 VSCode 主题颜色
const getThemeColors = (): VsCodeThemeColors => {
  const style = getComputedStyle(document.documentElement);
  return {
    backgroundColor: style.getPropertyValue('--vscode-editor-background'),
    foregroundColor: style.getPropertyValue('--vscode-editor-foreground'),
    // ... 其他颜色
  };
};

// 监听主题变化
window.addEventListener('message', (event) => {
  if (event.data.type === 'themeChanged') {
    // 更新主题
    handleThemeChange();
  }
});
```

### 后端实现
```typescript
// 监听 VSCode 主题变化
const themeSubscription = vscode.window.onDidChangeActiveColorTheme(
  (theme) => {
    webviewPanel.webview.postMessage({
      type: 'themeChanged',
      themeKind: theme.kind
    });
  }
);
```

### Mermaid 主题自动切换
```typescript
// 根据背景色判断主题类型
const isDark = themeColors.backgroundColor.startsWith('#1') || 
               themeColors.backgroundColor.startsWith('#2');

config.theme = isDark ? 'dark' : 'default';
```

## 🎯 适配效果

### 节点样式
- 默认使用 VSCode 编辑器背景色
- 边框使用面板边框颜色
- 文字使用编辑器前景色
- 选中时显示焦点边框

### 画布样式
- 背景跟随编辑器背景
- 控制按钮使用 VSCode 按钮样式
- 滚动条使用 VSCode 滚动条样式

### 预览面板
- 语法高亮适应主题
- 错误提示使用主题错误样式
- 代码块背景适应主题

## 📊 对比示例

### 浅色主题
```
工具栏: #f3f3f3 (浅灰)
画布: #ffffff (白色)
节点: #ffffff (白色背景)
文字: #000000 (黑色)
边框: #cccccc (浅灰)
```

### 深色主题
```
工具栏: #252526 (深灰)
画布: #1e1e1e (深色)
节点: #1e1e1e (深色背景)
文字: #d4d4d4 (浅灰)
边框: #454545 (深灰)
```

## 🐛 常见问题

### Q: 主题切换后没有变化？
**A**: 
1. 确保已保存文件
2. 尝试重新打开 .mmd 文件
3. 检查 VSCode 开发者工具是否有错误

### Q: 某些颜色不正确？
**A**: 
- 这是预期行为，某些自定义颜色可能不会完全匹配
- 核心 UI 元素会正确适配
- 可以手动调整节点样式

### Q: 如何让 Mermaid 图表也使用深色主题？
**A**: 
- 插件会自动根据 VSCode 主题设置 Mermaid 主题
- 深色主题 → Mermaid dark 主题
- 浅色主题 → Mermaid default 主题

## 🚀 未来改进

计划中的主题增强功能：
- [ ] 自定义主题颜色选择器
- [ ] 更多 Mermaid 主题支持（forest, neutral, base）
- [ ] 节点样式预设
- [ ] 主题导入/导出
- [ ] 更细粒度的颜色自定义

## 📚 相关资源

- [VSCode 主题文档](https://code.visualstudio.com/api/references/theme-color)
- [Mermaid 主题配置](https://mermaid.js.org/config/theming.html)
- [React Flow 样式指南](https://reactflow.dev/guide/styling/)

---

**享受完美的主题体验！** 🎨✨
