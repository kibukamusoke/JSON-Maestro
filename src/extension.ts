import * as vscode from 'vscode';
import * as path from 'path';
import { updateJsonInEditor } from './utils/jsonUtils';

export function activate(context: vscode.ExtensionContext) {
    console.log('JSON Maestro is now active!');

    let disposable = vscode.commands.registerCommand('json-maestro.openBrowser', () => {
        // Create webview panel
        const panel = vscode.window.createWebviewPanel(
            'jsonMaestro',
            'JSON Maestro',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'dist'))
                ]
            }
        );

        // Load JSON from current editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'json') {
            vscode.window.showErrorMessage('Active file is not a JSON file');
            return;
        }

        try {
            const json = document.getText();
            const jsonObj = JSON.parse(json);
            
            console.log('JSON parsed successfully, sending to webview:', Object.keys(jsonObj).length, 'top-level keys');
            
            // Get webview content
            panel.webview.html = getWebviewContent(panel.webview, context);
            
            // Data sent flag to prevent duplicate data initialization
            let dataSent = false;
            
            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'webviewReady':
                            // Send the JSON data when the webview signals it's ready
                            // Only send once
                            if (!dataSent) {
                                console.log('Webview is ready, sending JSON data...');
                                panel.webview.postMessage({
                                    command: 'initializeData',
                                    data: jsonObj
                                });
                                dataSent = true;
                                console.log('JSON data sent to webview');
                            }
                            return;
                        case 'updateJson':
                            updateJsonInEditor(editor, message.json);
                            vscode.window.showInformationMessage('JSON updated successfully!');
                            return;
                        case 'logMessage':
                            console.log('From Webview:', message.text);
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );
            
            // Remove the fallback setTimeout since we have the webviewReady event
            // This prevents duplicate data initialization
        } catch (e) {
            vscode.window.showErrorMessage('Failed to parse JSON: ' + e);
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext): string {
    // Get the local path to the webview bundle
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview', 'webview.js'))
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
        <title>JSON Maestro</title>
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function deactivate() {}