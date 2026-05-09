# 快速发布指南 🚀

## 📝 发布前检查清单

### 1. 修改 package.json
```json
{
  "publisher": "PUITO",                    // ✅ 已配置
  "version": "1.0.0",                      // ← 修改版本号
  "repository": {
    "url": "https://github.com/PUITO/mermaid-visual-editor-vscode.git"  // ✅ 已配置
  }
}
```

### 2. 配置 GitHub Secrets
进入：**Settings → Secrets and variables → Actions**

添加两个 secrets：
- `VSCE_PAT` = 你的 Azure DevOps PAT
- `OVSX_PAT` = 你的 Open VSX PAT

### 3. 提交并推送
```bash
git add .
git commit -m "Prepare for v1.0.0 release"
git push origin main
```

### 4. 创建标签并发布
```bash
git tag v1.0.0
git push origin v1.0.0
```

✅ **GitHub Actions 会自动完成所有发布步骤！**

---

## 🔧 常用命令

### 本地开发
```bash
npm install              # 安装依赖
npm run compile          # 编译项目
npm run watch            # 监听模式（开发用）
```

### 打包测试
```bash
npm run package          # 生成 .vsix 文件
```

### 手动发布
```bash
npx vsce publish         # 发布到 VSCode Marketplace
npx ovsx publish         # 发布到 Open VSX
```

---

## 📦 生成的产物

| 产物 | 位置 | 说明 |
|------|------|------|
| VSIX 文件 | [GitHub Releases](https://github.com/PUITO/mermaid-visual-editor-vscode/releases) | 离线安装包 |
| VSCode Marketplace | [marketplace.visualstudio.com](https://marketplace.visualstudio.com/items?itemName=PUITO.mermaid-visual-editor-vscode) | 官方市场 |
| Open VSX | [open-vsx.org](https://open-vsx.org/extension/PUITO/mermaid-visual-editor-vscode) | 开源市场 |
| Artifacts | Actions 页面 | 临时下载（30天） |

---

## ⚠️ 常见问题

### Q: 发布失败，提示认证错误？
**A**: 检查 GitHub Secrets 中的 PAT 是否正确且未过期

### Q: 版本号冲突？
**A**: 增加 package.json 中的版本号，创建新标签

### Q: 想重新发布同一版本？
**A**: 不允许！必须增加版本号（语义化版本规范）

### Q: 如何获取 PAT？
**A**: 详见 [PUBLISHING.md](./PUBLISHING.md) 前置准备章节

---

## 📚 详细文档

- **完整发布指南**: [PUBLISHING.md](./PUBLISHING.md)
- **变更日志**: [CHANGELOG.md](./CHANGELOG.md)
- **工作流总结**: [.github/WORKFLOW_SUMMARY.md](./.github/WORKFLOW_SUMMARY.md)
- **Git 仓库**: [https://github.com/PUITO/mermaid-visual-editor-vscode](https://github.com/PUITO/mermaid-visual-editor-vscode)

---

**祝发布顺利！** 🎉
