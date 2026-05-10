# 发布指南

## 概述

本插件仅通过 GitHub Releases 发布，不发布到 VSCode Marketplace 或 Open VSX。

## 发布流程

### 1. 准备发布

确保你的代码已经提交并推送到 GitHub：

```bash
git add .
git commit -m "Prepare for release v1.0.0"
git push origin main
```

### 2. 创建版本标签

使用语义化版本号（Semantic Versioning）：

```bash
# 正式版本
git tag -a v1.0.0 -m "Release version 1.0.0"

# 预发布版本（alpha/beta/rc）
git tag -a v1.0.0-beta.1 -m "Beta release 1.0.0"
git tag -a v1.0.0-rc.1 -m "Release candidate 1.0.0"
```

### 3. 推送标签触发自动发布

```bash
git push origin v1.0.0
```

推送标签后，GitHub Actions 会自动：
1. 构建插件
2. 打包成 `.vsix` 文件
3. 创建 GitHub Release 并附加 `.vsix` 文件
4. 自动生成发布说明

### 4. 手动触发（可选）

如果需要手动测试构建，可以：
1. 进入 GitHub 仓库的 **Actions** 页面
2. 选择 **CI Build and Test** 工作流
3. 点击 **Run workflow**
4. 选择分支并运行

## 版本号规范

遵循 [语义化版本](https://semver.org/)：

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 预发布标识

- `-alpha`: 内部测试版本
- `-beta`: 公开测试版本
- `-rc`: 候选发布版本

示例：
- `v1.0.0-alpha.1`
- `v1.0.0-beta.2`
- `v1.0.0-rc.1`
- `v1.0.0` (正式发布)

## 用户安装方式

用户可以通过以下方式安装插件：

### 方法 1: 从 GitHub Releases 下载

1. 访问 [Releases 页面](https://github.com/PUITO/mermaid-visual-editor-vscode/releases)
2. 下载最新版本的 `.vsix` 文件
3. 在 VSCode 中：
   - 按 `Ctrl+Shift+P` (或 `Cmd+Shift+P`)
   - 输入 "Extensions: Install from VSIX..."
   - 选择下载的 `.vsix` 文件

### 方法 2: 从源码安装

```bash
git clone https://github.com/PUITO/mermaid-visual-editor-vscode.git
cd mermaid-visual-editor-vscode
npm install
npm run package
```

然后安装生成的 `.vsix` 文件。

## CI/CD 工作流说明

### CI Build and Test (ci.yml)

**触发条件**:
- 推送版本标签 (`v*`)
- 手动触发（用于测试）

**执行步骤**:
1. 安装依赖
2. 运行 Lint（可选，失败不中断）
3. 编译 TypeScript
4. 构建 Webview
5. 打包 VSIX
6. 上传构建产物

### Release and Publish (release.yml)

**触发条件**:
- 推送版本标签 (`v*`)
- 手动触发（用于测试发布）

**执行步骤**:
1. 安装依赖
2. 编译项目
3. 打包 VSIX
4. 创建 GitHub Release
5. 自动附加 VSIX 文件
6. 生成发布说明

**预发布检测**:
- 如果标签包含 `-alpha`、`-beta` 或 `-rc`，自动标记为预发布版本

## 常见问题

### Q: 为什么我的 Actions 没有触发？

A: 确保你推送的是标签而不是普通提交：
```bash
# 检查标签是否推送成功
git tag -l
git push origin --tags
```

### Q: 如何取消预发布标记？

A: 使用不带预发布标识的标签：
```bash
git tag -a v1.0.0 -m "Stable release"
git push origin v1.0.0
```

### Q: 构建失败了怎么办？

A: 
1. 查看 Actions 日志了解具体错误
2. 本地运行 `npm run compile` 测试构建
3. 修复问题后重新创建标签（需要删除旧标签）：
   ```bash
   git tag -d v1.0.0
   git push --delete origin v1.0.0
   # 修复问题后重新打标签
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

### Q: 可以发布到 VSCode Marketplace 吗？

A: 当前配置不支持。如需添加，需要：
1. 在 `package.json` 中添加 `publisher` 字段
2. 获取 Personal Access Token
3. 在 GitHub Secrets 中添加 `VSCE_PAT`
4. 修改 `release.yml` 添加发布步骤

## 维护建议

1. **定期更新依赖**: 每月检查一次依赖更新
2. **保持 CHANGELOG.md 更新**: 记录每个版本的变更
3. **测试预发布版本**: 正式发布前先用 `-beta` 标签测试
4. **备份标签**: 重要的版本标签不要随意删除
