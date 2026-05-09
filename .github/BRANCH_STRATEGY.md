# 分支策略与 GitHub Actions 配置

## 🌿 分支说明

### `master` 分支（主分支）
- **用途**: 生产环境，稳定版本
- **保护**: 受保护分支，需要 PR 审核
- **发布**: ✅ 支持自动发布到 VSCode Marketplace

**触发条件**：
- 推送到 master 分支 → 运行 CI 测试
- 在 master 分支推送标签（如 `v1.0.0`）→ 自动发布

---

### `dev` 分支（开发分支）
- **用途**: 日常开发，功能测试
- **保护**: 可选保护
- **发布**: ❌ 不发布，仅用于测试

**触发条件**：
- 推送到 dev 分支 → 运行 CI 测试和打包
- 生成的 VSIX 作为 Artifact 保存（7天）
- **不会**发布到 Marketplace

---

### `feature/*` 分支（功能分支）
- **用途**: 新功能开发
- **示例**: `feature/dark-mode`, `feature/export-pdf`
- **流程**: 从 dev 分支创建，完成后合并回 dev

**触发条件**：
- 推送到 feature 分支 → 运行 CI 测试
- 创建 PR 到 dev 分支时 → 运行 CI 测试

---

## 🔄 工作流程

### 日常开发流程

```bash
# 1. 从 dev 分支创建功能分支
git checkout dev
git pull origin dev
git checkout -b feature/new-feature

# 2. 开发和提交代码
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 3. 创建 PR 到 dev 分支
# GitHub 会自动运行 CI 测试

# 4. PR 合并后，dev 分支自动运行 CI
```

### 发布流程

```bash
# 1. 确保 dev 分支稳定
git checkout dev
git pull origin dev

# 2. 合并到 master 分支（通过 PR）
# 创建 PR: dev → master
# 审核通过后合并

# 3. 在 master 分支上创建版本标签
git checkout master
git pull origin master
git tag v1.0.0
git push origin v1.0.0

# 4. GitHub Actions 自动执行：
#    ✅ 构建项目
#    ✅ 打包 VSIX
#    ✅ 创建 GitHub Release
#    ✅ 发布到 VSCode Marketplace
#    ✅ 发布到 Open VSX Registry
```

---

## ⚙️ GitHub Actions 配置详解

### 1. CI 工作流 (`.github/workflows/ci.yml`)

**触发条件**：
```yaml
on:
  push:
    branches: [ main, master, dev ]  # 三个分支都会触发
  pull_request:
    branches: [ main, master, dev ]
```

**执行步骤**：
1. ✅ 代码检查（lint）
2. ✅ TypeScript 编译
3. ✅ 验证构建产物
4. ✅ 测试打包 VSIX
5. ✅ 上传 Artifact（包含分支名）

**Artifact 命名**：
- `test-extension-vsix-master` - master 分支的测试包
- `test-extension-vsix-dev` - dev 分支的测试包
- `test-extension-vsix-feature-xxx` - 功能分支的测试包

**保留时间**: 7 天

---

### 2. Release 工作流 (`.github/workflows/release.yml`)

**触发条件**：
```yaml
on:
  push:
    branches:
      - master  # ⚠️ 只在 master 分支监听
    tags:
      - 'v*'    # 只响应版本标签
  workflow_dispatch:  # 手动触发
```

**关键限制**：
- ✅ **只在 master 分支推送标签时触发**
- ❌ dev 分支推送标签不会触发发布
- ❌ feature 分支推送标签不会触发发布

**执行步骤**：
1. ✅ 构建项目
2. ✅ 打包 VSIX
3. ✅ 上传 Artifact（30天）
4. ✅ 创建 GitHub Release
5. ✅ 发布到 VSCode Marketplace
6. ✅ 发布到 Open VSX Registry

---

## 🛡️ 分支保护建议

### master 分支保护规则

在 GitHub 仓库设置中配置：

1. **Require pull request reviews before merging**
   - 至少 1 个审核者
   - Dismiss stale pull request approvals on new commits

2. **Require status checks to pass before merging**
   - 选择 "CI Build and Test" 工作流
   - Require branches to be up to date before merging

3. **Include administrators**
   - 管理员也遵守保护规则

4. **Restrict who can push to matching branches**
   - 仅允许特定人员或团队推送

---

### dev 分支保护规则（可选）

1. **Require pull request reviews before merging**
   - 至少 1 个审核者（可从 feature 分支合并）

2. **Require status checks to pass before merging**
   - 选择 "CI Build and Test" 工作流

---

## 📊 分支对比

| 特性 | master | dev | feature/* |
|------|--------|-----|-----------|
| **稳定性** | 🔴 生产稳定 | 🟡 开发中 | 🟢 实验中 |
| **CI 测试** | ✅ | ✅ | ✅ |
| **打包 VSIX** | ✅ | ✅ | ✅ |
| **发布到 Marketplace** | ✅ (标签触发) | ❌ | ❌ |
| **创建 GitHub Release** | ✅ (标签触发) | ❌ | ❌ |
| **Artifact 保留** | 7 天 | 7 天 | 7 天 |
| **PR 审核要求** | 必需 | 推荐 | 可选 |
| **直接推送** | ❌ 禁止 | ⚠️ 谨慎 | ✅ 允许 |

---

## 🎯 最佳实践

### 1. 不要在 dev 分支打标签
```bash
# ❌ 错误做法
git checkout dev
git tag v1.0.0
git push origin v1.0.0
# 结果：不会触发发布（因为 release.yml 只监听 master）

# ✅ 正确做法
git checkout master
git merge dev
git tag v1.0.0
git push origin v1.0.0
# 结果：触发完整发布流程
```

### 2. 使用语义化版本
```bash
# Bug 修复
git tag v1.0.1

# 新功能（向下兼容）
git tag v1.1.0

# 重大变更（不兼容）
git tag v2.0.0
```

### 3. 发布前检查清单
- [ ] dev 分支所有测试通过
- [ ] PR 已合并到 master
- [ ] CHANGELOG.md 已更新
- [ ] package.json 版本号已更新
- [ ] 本地测试 VSIX 安装正常
- [ ] README.md 已更新（如需要）

### 4. 测试 dev 分支的 VSIX
```bash
# 1. 推送到 dev 分支
git push origin dev

# 2. 等待 CI 完成
# 访问: https://github.com/PUITO/mermaid-visual-editor-vscode/actions

# 3. 下载 Artifact
# - 进入 Actions 页面
# - 点击最新的 CI 运行
# - 下载 "test-extension-vsix-dev"

# 4. 本地安装测试
# VSCode → 扩展 → ... → Install from VSIX
```

---

## 🔍 常见问题

### Q1: 为什么在 dev 分支推送标签没有发布？
**A**: 这是预期行为！`release.yml` 配置为只在 master 分支监听标签。这样做是为了防止意外发布不稳定的代码。

### Q2: 如何测试即将发布的版本？
**A**: 
1. 推送到 dev 分支
2. 下载 CI 生成的 VSIX Artifact
3. 本地安装测试
4. 确认无误后再合并到 master 并打标签

### Q3: 能否强制从 dev 分支发布？
**A**: 可以，但不推荐。如果确实需要：
1. 手动触发 release 工作流
2. 选择 "Run workflow"
3. 输入版本号
4. 勾选发布选项

或者临时修改 `release.yml` 的 branches 配置。

### Q4: master 和 main 有什么区别？
**A**: 当前配置同时支持 `main` 和 `master`。如果您的仓库使用 `main` 作为默认分支，CI 也会在该分支上运行。但发布只在 `master` 分支生效。

---

## 📝 总结

**核心原则**：
- ✅ **dev 分支**: 日常开发，自动测试，不发布
- ✅ **master 分支**: 稳定版本，标签触发自动发布
- ✅ **feature 分支**: 功能开发，PR 合并到 dev

**安全保障**：
- 🛡️ 只有 master 分支的标签能触发发布
- 🛡️ CI 测试必须通过才能合并
- 🛡️ PR 审核机制防止错误代码进入

**灵活性**：
- 🔄 可随时手动触发工作流
- 🔄 dev 分支可生成测试用 VSIX
- 🔄 支持多分支并行开发

---

**祝开发顺利！** 🚀
