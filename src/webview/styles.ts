/**
 * CSS styles for the JSON Maestro webview
 */
export const webviewStyles = `
    :root {
        --node-icon-size: 16px;
        --node-spacing: 8px;
        --node-indent: 24px;
        --item-radius: 6px;
        --transition-speed: 0.15s;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        padding: 20px;
        margin: 0;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        line-height: 1.5;
    }
    
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: 100%;
        overflow: hidden;
    }
    
    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 10px 0 20px 0;
        border-bottom: 1px solid var(--vscode-panel-border, rgba(128, 128, 128, 0.35));
        margin-bottom: 20px;
    }
    
    .app-title {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
    }
    
    .app-title svg {
        margin-right: 8px;
        color: var(--vscode-terminal-ansiBlue);
    }
    
    .controls {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
    }
    
    .count-badge {
        font-size: 13px;
        padding: 3px 8px;
        border-radius: 12px;
        background-color: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
    }
    
    .search-container {
        position: relative;
        width: 250px;
    }
    
    .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--vscode-input-placeholderForeground);
        opacity: 0.7;
        font-size: 14px;
    }
    
    .search-box {
        padding: 6px 10px 6px 30px;
        border-radius: var(--item-radius);
        border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.5));
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        width: 100%;
        font-size: 14px;
        transition: border-color var(--transition-speed) ease;
    }
    
    .search-box:focus {
        outline: none;
        border-color: var(--vscode-focusBorder);
    }
    
    .content-area {
        flex: 1;
        overflow: auto;
        padding-right: 10px;
    }
    
    .json-container {
        display: flex;
        flex-direction: column;
        gap: var(--node-spacing);
    }
    
    .json-item {
        display: flex;
        flex-direction: column;
        padding-left: 0;
        position: relative;
    }
    
    .json-key-container {
        display: flex;
        align-items: flex-start;
        padding: 4px 6px;
        border-radius: var(--item-radius);
        cursor: pointer;
        user-select: none;
        transition: background-color var(--transition-speed) ease;
    }
    
    .json-key-container:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
    
    .json-key-container.active {
        background-color: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
    }
    
    .json-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--node-icon-size);
        height: var(--node-icon-size);
        margin-right: 6px;
        color: var(--vscode-foreground);
        opacity: 0.7;
        transition: transform var(--transition-speed) ease;
    }
    
    .json-toggle svg {
        width: 14px;
        height: 14px;
        transition: transform var(--transition-speed) ease;
    }
    
    .json-key.expanded .json-toggle svg {
        transform: rotate(90deg);
    }
    
    .json-key {
        color: var(--vscode-symbolIcon-propertyForeground, #4EC9B0);
        font-weight: 500;
        display: flex;
        align-items: center;
    }
    
    .json-key-text {
        margin-right: 4px;
    }
    
    .json-value-preview {
        color: var(--vscode-foreground);
        opacity: 0.7;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 300px;
    }
    
    .json-value-type {
        display: inline-flex;
        align-items: center;
        color: var(--vscode-foreground);
        opacity: 0.5;
        font-size: 12px;
        margin-left: 6px;
        padding: 0 6px;
        border-radius: 4px;
        background-color: var(--vscode-badge-background, rgba(128, 128, 128, 0.2));
    }
    
    .json-value-type svg {
        margin-right: 4px;
        width: 12px;
        height: 12px;
    }
    
    .json-item-counts {
        display: flex;
        font-size: 12px;
        color: var(--vscode-foreground);
        opacity: 0.6;
        margin-left: 8px;
    }
    
    .json-children {
        display: none;
        padding-left: var(--node-indent);
    }
    
    .json-children.visible {
        display: block;
        animation: fadeIn var(--transition-speed) ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .json-value {
        color: var(--vscode-foreground);
        padding: 4px 8px;
        margin-left: var(--node-indent);
        display: flex;
        align-items: center;
        position: relative;
    }
    
    .json-value-label {
        font-size: 13px;
        margin-right: 8px;
        color: var(--vscode-symbolIcon-propertyForeground, #4EC9B0);
        opacity: 0.8;
    }
    
    .json-value-content {
        display: flex;
        align-items: center;
        flex: 1;
    }
    
    .editable {
        cursor: text;
        padding: 2px 8px;
        border-radius: var(--item-radius);
        transition: background-color var(--transition-speed) ease;
        flex: 1;
        display: flex;
        align-items: center;
    }
    
    .editable:hover {
        background-color: var(--vscode-editor-selectionBackground);
    }
    
    .editable svg {
        margin-right: 6px;
        width: 14px;
        height: 14px;
        opacity: 0.7;
    }
    
    .json-string {
        color: var(--vscode-symbolIcon-stringForeground, #ce9178);
    }
    
    .json-number {
        color: var(--vscode-symbolIcon-numberForeground, #b5cea8);
    }
    
    .json-boolean {
        color: var(--vscode-symbolIcon-booleanForeground, #569cd6);
    }
    
    .json-null {
        color: var(--vscode-symbolIcon-nullForeground, #569cd6);
        font-style: italic;
    }
    
    .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        margin-top: 20px;
        border-top: 1px solid var(--vscode-panel-border, rgba(128, 128, 128, 0.35));
    }
    
    .path-display {
        font-size: 13px;
        color: var(--vscode-foreground);
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%;
    }
    
    .path-segment {
        color: var(--vscode-symbolIcon-propertyForeground, #4EC9B0);
    }
    
    .buttons {
        display: flex;
        gap: 10px;
    }
    
    button {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 6px 12px;
        border-radius: var(--item-radius);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color var(--transition-speed) ease;
    }
    
    button svg {
        margin-right: 6px;
    }
    
    button:hover {
        background-color: var(--vscode-button-hoverBackground);
    }
    
    .secondary-button {
        background-color: transparent;
        border: 1px solid var(--vscode-button-background);
        color: var(--vscode-button-background);
    }
    
    .secondary-button:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    
    .clipboard-button {
        opacity: 0;
        background-color: transparent;
        padding: 2px 4px;
        margin-left: 6px;
        transition: opacity var(--transition-speed) ease;
    }
    
    .json-value:hover .clipboard-button {
        opacity: 0.7;
    }
    
    .clipboard-button:hover {
        opacity: 1 !important;
        background-color: var(--vscode-button-secondaryHoverBackground, rgba(90, 93, 94, 0.31));
    }
    
    .highlighted {
        background-color: var(--vscode-editor-findMatchHighlightBackground, rgba(234, 92, 0, 0.33)) !important;
        border-radius: var(--item-radius);
    }
    
    .new-property {
        background-color: var(--vscode-diffEditor-insertedTextBackground, rgba(155, 185, 85, 0.2)) !important;
        animation: fade-new-property 2s ease-in-out;
    }
    
    .editing {
        background-color: var(--vscode-editor-selectionBackground, rgba(38, 79, 120, 0.3)) !important;
    }
    
    @keyframes fade-new-property {
        0% { background-color: var(--vscode-diffEditor-insertedTextBackground, rgba(155, 185, 85, 0.4)); }
        100% { background-color: var(--vscode-diffEditor-insertedTextBackground, rgba(155, 185, 85, 0.2)); }
    }
    
    .path-navigation {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 4px 8px;
        border-radius: var(--item-radius);
        background-color: var(--vscode-breadcrumb-background, transparent);
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: thin;
    }
    
    .path-navigation::-webkit-scrollbar {
        height: 4px;
    }
    
    .path-navigation::-webkit-scrollbar-thumb {
        background-color: var(--vscode-scrollbarSlider-background);
        border-radius: 4px;
    }
    
    .path-segment-item {
        display: inline-flex;
        align-items: center;
        color: var(--vscode-breadcrumb-foreground, var(--vscode-foreground));
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
    }
    
    .path-segment-item:hover {
        background-color: var(--vscode-breadcrumb-focusForeground, rgba(255, 255, 255, 0.1));
    }
    
    .path-segment-separator {
        margin: 0 4px;
        opacity: 0.5;
    }
    
    .status-message {
        padding: 4px 8px;
        border-radius: var(--item-radius);
        font-size: 13px;
        margin-top: 10px;
        display: none;
    }
    
    .status-success {
        background-color: var(--vscode-debugConsole-infoForeground, #3794ff);
        color: var(--vscode-editor-background);
        display: block;
    }
    
    .status-error {
        background-color: var(--vscode-debugConsole-errorForeground, #f48771);
        color: var(--vscode-editor-background);
        display: block;
    }
    
    .loading-indicator {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: var(--vscode-symbolIcon-propertyForeground, #4EC9B0);
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .add-property-button {
        display: flex !important;
        align-items: center;
        justify-content: flex-start;
        padding: 8px 16px;
        margin: 10px 0 8px var(--node-indent);
        font-size: 13px;
        font-weight: 500;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-button-background);
        border: 2px solid var(--vscode-button-background);
        border-radius: var(--item-radius);
        cursor: pointer;
        position: relative;
        z-index: 10;
        transition: all 0.2s ease;
    }
    
    .add-property-button svg {
        margin-right: 8px;
    }
    
    .add-property-button:hover {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
    }
    
    .add-property-button:active {
        transform: translateY(1px);
    }
    
    input {
        font-family: inherit;
        font-size: inherit;
    }
`; 