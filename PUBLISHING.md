# 发布指南

本文档说明如何发布 Mermaid Visual Editor 插件到 VSCode Marketplace 和生成离线安装包。

## 📋 前置准备

### 0. 准备插件图标（可选但推荐）

在发布之前，建议准备好插件图标以获得更好的展示效果：

1. **图标要求**：
   - 文件路径：`images/icon.png`
   - 尺寸：128x128 像素
   - 格式：PNG（支持透明背景）
   - 当前状态：✅ 已配置

2. **横幅配置**（已在 package.json 中设置）：
   ```json
   "galleryBanner": {
     "color": "#252526",
     "theme": "dark"
   }
   ```

3. **如果暂无图标**：
   - 可以暂时使用任意 128x128 PNG 图片
   - 或从 [Mermaid 官方资源](https://mermaid.js.org/) 获取灵感设计
   - 使用在线工具如 [Figma](https://www.figma.com/) 或 [Canva](https://www.canva.com/) 创建

---

### 1. 获取 VSCode Marketplace Personal Access Token (PAT)

1. 访问 [Azure DevOps Personal Access Tokens](https://dev.azure.com/)
2. 创建新的 Organization（如果还没有）
3. 创建 Personal Access Token：
   - Name: `VSCode Marketplace`
   - Organization: 选择你创建的 organization
   - Expiration: 建议设置为 1 年
   - Scopes: 选择 **All accessible organizations** → **Marketplace** → **Manage**
4. 复制生成的 Token

### 2. 获取 Open VSX Registry PAT

1. 访问 [Open VSX Registry](https://open-vsx.org/)
2. 使用 GitHub 账号登录
3. 进入 [Access Tokens](https://open-vsx.org/user-settings/tokens)
4. 创建新的 Token
5. 复制生成的 Token

### 3. 配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

1. 进入仓库的 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `VSCE_PAT` | Azure DevOps PAT | VSCode Marketplace 发布令牌 |
| `OVSX_PAT` | Open VSX PAT | Open VSX Registry 发布令牌 |

---

## 🚀 发布方式

### 方式一：通过 Git Tag 自动发布（推荐）

这是最简单的发布方式，只需推送版本标签即可触发自动发布。

#### 步骤：

1. **更新版本号**

   编辑 `package.json`，修改 `version` 字段：
   ```json
   {
     "version": "1.0.0"  // 修改为你想要的版本号
   }
   ```

2. **提交更改**
   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.0"
   ```

3. **创建并推送标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **等待 GitHub Actions 完成**
   
   GitHub Actions 会自动：
   - ✅ 构建项目
   - ✅ 打包 VSIX 文件
   - ✅ 创建 GitHub Release（附带 VSIX 下载链接）
   - ✅ 发布到 VSCode Marketplace
   - ✅ 发布到 Open VSX Registry

5. **验证发布**
   - 访问 [GitHub Releases](https://github.com/PUITO/mermaid-visual-editor-vscode/releases)
   - 访问 [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=PUITO.mermaid-visual-editor-vscode)
   - 访问 [Open VSX](https://open-vsx.org/extension/PUITO/mermaid-visual-editor-vscode)

---

### 方式二：手动触发工作流

如果你不想创建 Git 标签，可以手动触发工作流。

#### 步骤：

1. **进入 Actions 页面**
   
   访问仓库的 **Actions** 标签页

2. **选择工作流**
   
   点击左侧的 **Release and Publish** 工作流

3. **点击 "Run workflow"**
   
   在右侧面板中：
   - **Use workflow from**: 选择 `Branch: main`
   - **版本号**: 输入版本号（如 `1.0.0`）
   - **发布到 VSCode Marketplace**: 勾选 ☑️
   - **创建 GitHub Release**: 勾选 ☑️

4. **点击绿色按钮 "Run workflow"**

5. **等待完成**
   
   工作流会自动执行所有发布步骤。

---

### 方式三：本地打包（离线安装）

如果你只需要生成离线的 `.vsix` 文件，可以在本地执行：

```bash
# 安装依赖
npm install

# 编译项目
npm run compile

# 打包 VSIX
npx vsce package

# 生成的文件：mermaid-visual-editor-vscode-1.0.0.vsix
```

#### 安装离线插件：

1. 打开 VSCode
2. 进入扩展视图（Ctrl+Shift+X）
3. 点击右上角的 **"..."** 菜单
4. 选择 **"Install from VSIX..."**
5. 选择生成的 `.vsix` 文件

---

## 📦 生成的产物

每次发布会生成以下产物：

### 1. GitHub Release
- **位置**: [Releases 页面](https://github.com/PUITO/mermaid-visual-editor-vscode/releases)
- **包含**: 
  - 自动生成发布说明
  - VSIX 文件下载链接
  - Git 标签对应的代码快照

### 2. VSCode Marketplace
- **位置**: `https://marketplace.visualstudio.com/items?itemName=publisher.extension-name`
- **特点**: 
  - 官方市场，用户最多
  - 支持自动更新
  - 需要 Microsoft 账号

### 3. Open VSX Registry
- **位置**: `https://open-vsx.org/extension/publisher/extension-name`
- **特点**:
  - 开源替代方案
  - VSCodium 等编辑器默认使用
  - 完全开源

### 4. GitHub Actions Artifacts
- **位置**: Actions 运行结果的 Artifacts 标签
- **保留时间**: 30 天
- **用途**: 临时下载，测试用

---

## 🔧 故障排查

### 问题 1：发布失败，提示 "Authentication failed"

**原因**: VSCE_PAT 或 OVSX_PAT 配置错误或已过期

**解决**:
1. 检查 GitHub Secrets 是否正确配置
2. 重新生成 PAT 并更新 Secrets
3. 确保 PAT 有足够的权限

### 问题 2：版本号冲突

**原因**: Marketplace 上已存在相同版本号的插件

**解决**:
1. 增加 `package.json` 中的版本号
2. 创建新的 Git 标签
3. 重新推送标签

### 问题 3：构建失败

**原因**: 代码有语法错误或依赖问题

**解决**:
1. 查看 Actions 日志，定位错误
2. 本地运行 `npm run compile` 测试
3. 修复错误后重新推送

### 问题 4：VSIX 文件过大

**原因**: 包含了不必要的文件（如 node_modules）

**解决**:
检查 `.vscodeignore` 文件，确保排除以下内容：
```
node_modules/
.git/
.github/
.vscode/
*.md
!.vscodeignore
```

---

## 📝 版本管理建议

遵循 [语义化版本规范](https://semver.org/)：

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

示例：
- `1.0.0` → 首次正式发布
- `1.0.1` → Bug 修复
- `1.1.0` → 新功能
- `2.0.0` → 重大变更

---

## 🎯 最佳实践

1. **发布前测试**
   - 本地运行 `npm run compile` 确保无错误
   - 本地打包 VSIX 并测试安装
   - 检查所有功能是否正常

2. **编写清晰的发布说明**
   - 在 Git 标签消息中描述变更
   - 或在 PR 中详细说明新功能
   - GitHub Actions 会自动生成 Release Notes

3. **定期更新依赖**
   - 运行 `npm outdated` 检查过时依赖
   - 及时更新安全补丁

4. **保持向后兼容**
   - 避免破坏性变更
   - 如需重大变更，考虑提供迁移指南

5. **监控发布状态**
   - 关注 Actions 运行结果
   - 检查 Marketplace 上的用户反馈
   - 及时处理 Issue

---

## 📞 支持

如有问题，请：
1. 查看 [GitHub Issues](https://github.com/PUITO/mermaid-visual-editor-vscode/issues)
2. 阅读 [README.md](./README.md)
3. 联系维护者

祝发布顺利！🎉
