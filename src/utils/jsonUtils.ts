import * as vscode from 'vscode';

/**
 * Updates the JSON content in the active editor
 */
export function updateJsonInEditor(editor: vscode.TextEditor, newJson: any): void {
    try {
        const formatted = JSON.stringify(newJson, null, 2);
        const document = editor.document;
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        
        editor.edit(editBuilder => {
            editBuilder.replace(fullRange, formatted);
        });
    } catch (e) {
        vscode.window.showErrorMessage('Failed to update JSON: ' + e);
    }
}

/**
 * Helper function to escape HTML in strings
 */
export function escapeHtml(str: string): string {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
} 