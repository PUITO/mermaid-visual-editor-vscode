import * as vscode from 'vscode';

export class MermaidEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'mermaidVisualEditor.editor';

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * 当打开 .mmd 文件时调用，创建 webview 编辑器
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    // 设置 webview 配置
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'out'),
        vscode.Uri.joinPath(this.context.extensionUri, 'node_modules')
      ]
    };

    // 设置初始 HTML 内容
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // 处理来自 webview 的消息
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'updateContent': {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            message.content || ''
          );
          await vscode.workspace.applyEdit(edit);
          break;
        }
        
        case 'getContent': {
          webviewPanel.webview.postMessage({
            type: 'initContent',
            content: document.getText()
          });
          break;
        }
        
        case 'updateNode': {
          // Handle node updates if needed
          break;
        }
      }
    });

    // 监听文档变化
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        webviewPanel.webview.postMessage({
          type: 'externalUpdate',
          content: e.document.getText()
        });
      }
    });

    // 监听主题变化并通知 webview
    const themeSubscription = vscode.window.onDidChangeActiveColorTheme((theme) => {
      webviewPanel.webview.postMessage({
        type: 'themeChanged',
        themeKind: theme.kind
      });
    });

    // 清理订阅
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      themeSubscription.dispose();
      
      // 注意：不在这里再次保存，因为每次编辑操作都已经立即保存了
      // onDidDispose 时 webview 可能已经销毁，发送消息会失败
      // 依赖之前的即时保存机制即可
    });

    // 发送初始内容
    webviewPanel.webview.postMessage({
      type: 'initContent',
      content: document.getText()
    });
  }

  /**
   * 生成 webview 的 HTML 内容
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview.js')
    );

    // 获取当前主题的颜色
    const colorTheme = vscode.window.activeColorTheme;
    const isDark = colorTheme.kind === vscode.ColorThemeKind.Dark || 
                   colorTheme.kind === vscode.ColorThemeKind.HighContrast;

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}' ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline' https:; font-src ${webview.cspSource}; connect-src ${webview.cspSource};">
  <title>Mermaid Visual Editor</title>
  <style>
    :root {
      --vscode-editor-background: ${isDark ? '#1e1e1e' : '#ffffff'};
      --vscode-editor-foreground: ${isDark ? '#d4d4d4' : '#000000'};
      --vscode-panel-border: ${isDark ? '#454545' : '#cccccc'};
      --vscode-toolbar-background: ${isDark ? '#252526' : '#f3f3f3'};
      --vscode-button-background: ${isDark ? '#0e639c' : '#007acc'};
      --vscode-button-foreground: ${isDark ? '#ffffff' : '#ffffff'};
      --vscode-button-hoverBackground: ${isDark ? '#1177bb' : '#0062a3'};
      --vscode-button-border: ${isDark ? '#454545' : '#bebebe'};
      --vscode-panelSectionHeader-background: ${isDark ? '#252526' : '#e8e8e8'};
      --vscode-panelSectionHeader-foreground: ${isDark ? '#cccccc' : '#000000'};
      --vscode-errorForeground: #f00;
      --vscode-inputValidation-errorBackground: ${isDark ? '#5a1d1d' : '#f2dede'};
      --vscode-inputValidation-errorBorder: #be1100;
      --vscode-input-background: ${isDark ? '#3c3c3c' : '#ffffff'};
      --vscode-input-foreground: ${isDark ? '#cccccc' : '#000000'};
      --vscode-input-border: ${isDark ? '#3c3c3c' : '#cecece'};
      --vscode-focusBorder: #007acc;
      --vscode-scrollbarSlider-background: ${isDark ? '#79797966' : '#64646466'};
      --vscode-scrollbarSlider-hoverBackground: ${isDark ? '#646464b3' : '#646464b3'};
      --vscode-scrollbarSlider-activeBackground: ${isDark ? '#bfbfbf66' : '#bfbfbf66'};
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    
    #root {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">
    window.vscode = acquireVsCodeApi();
  </script>
  <script src="${scriptUri}" nonce="${nonce}"></script>
</body>
</html>`;
  }

  /**
   * 生成随机 nonce 用于 CSP
   */
  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
