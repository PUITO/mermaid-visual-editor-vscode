import * as vscode from 'vscode';
import { MermaidEditorProvider } from './mermaidEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Mermaid Visual Editor extension is now active!');

  // 注册自定义编辑器提供者
  const editorProvider = new MermaidEditorProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      MermaidEditorProvider.viewType,
      editorProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        },
        supportsMultipleEditorsPerDocument: false
      }
    )
  );

  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand('mermaid-visual-editor.openEditor', async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        await vscode.commands.executeCommand(
          'vscode.openWith',
          activeEditor.document.uri,
          MermaidEditorProvider.viewType
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mermaid-visual-editor.togglePreview', async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        await vscode.commands.executeCommand(
          'vscode.openWith',
          activeEditor.document.uri,
          MermaidEditorProvider.viewType
        );
      }
    })
  );
}

export function deactivate() {
  console.log('Mermaid Visual Editor extension deactivated');
}
