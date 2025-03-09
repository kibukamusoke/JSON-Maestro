import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/global.css';

// Acquire the VS Code API
declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

// Initialize VS Code API
const vscode = window.acquireVsCodeApi();

// Helper function to log messages back to the extension
const logToExtension = (message: string) => {
  vscode.postMessage({
    command: 'logMessage',
    text: message
  });
};

// Get initial JSON data from the extension
let initialData: any = {};
let root: ReactDOM.Root | null = null; // Initialize as null

// Initialize the root once
const initRoot = () => {
  if (root) return; // Prevent multiple initializations
  
  const container = document.getElementById('root');
  if (container) {
    root = ReactDOM.createRoot(container);
    logToExtension('React root created');
  } else {
    logToExtension('Error: Root element not found');
  }
};

// Listen for messages from the extension
window.addEventListener('message', event => {
  logToExtension('Message received from extension: ' + event.data.command);
  
  const message = event.data;
  
  switch (message.command) {
    case 'initializeData':
      logToExtension('Received JSON data with ' + (message.data ? Object.keys(message.data).length : 0) + ' top-level keys');
      initialData = message.data;
      renderApp();
      break;
    default:
      logToExtension('Unknown command: ' + message.command);
  }
});

// Render the React app
function renderApp() {
  logToExtension('Rendering app with data: ' + JSON.stringify(initialData).substring(0, 100) + '...');
  
  initRoot(); // Ensure root is initialized
  
  if (root) {
    root.render(
      <App 
        initialData={initialData} 
        vscode={vscode} 
      />
    );
  } else {
    logToExtension('Error: Cannot render app, root is not initialized');
  }
}

// Signal to the extension that the webview is ready to receive data
setTimeout(() => {
  logToExtension('Webview is ready to receive data');
  vscode.postMessage({
    command: 'webviewReady'
  });
}, 100);