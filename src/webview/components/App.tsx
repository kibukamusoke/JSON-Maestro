import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import PathNavigation from './PathNavigation';
import JsonTree from './JsonTree';
import StatusMessage from './StatusMessage';

interface AppProps {
  initialData: any;
  vscode: {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
  };
}

const App: React.FC<AppProps> = ({ initialData, vscode }) => {
  const [jsonData, setJsonData] = useState<any>(initialData);
  const [originalJson, setOriginalJson] = useState<any>(JSON.parse(JSON.stringify(initialData)));
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'none' as 'success' | 'error' | 'none' });
  const [hasChanges, setHasChanges] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Update jsonData when initialData changes
  useEffect(() => {
    // Log to extension for debugging
    vscode.postMessage({
      command: 'logMessage',
      text: `initialData updated: ${JSON.stringify(initialData).substring(0, 100)}...`
    });
    
    setJsonData(initialData);
    setOriginalJson(JSON.parse(JSON.stringify(initialData)));
    setHasChanges(false);
  }, [initialData, vscode]);

  // Update item count when data changes
  useEffect(() => {
    let count = 0;
    const countItems = (obj: any) => {
      if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj);
        count += keys.length;
        keys.forEach(key => {
          if (obj[key] && typeof obj[key] === 'object') {
            countItems(obj[key]);
          }
        });
      }
    };
    
    countItems(jsonData);
    setItemCount(count);
  }, [jsonData]);

  // Get current object based on path
  const getCurrentObject = () => {
    let current = jsonData;
    currentPath.forEach(segment => {
      current = current[segment];
    });
    return current;
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Handle path navigation
  const handleNavigate = (path: string[]) => {
    setCurrentPath(path);
  };

  // Handle adding a new property
  const handleAddProperty = (
    path: string[], 
    isArray: boolean, 
    value: any = '', 
    valueType: string = 'string',
    key: string = ''
  ) => {
    const newData = JSON.parse(JSON.stringify(jsonData));
    let current = newData;
    
    // Navigate to the target object
    path.forEach((segment, index) => {
      if (index < path.length) {
        current = current[segment];
      }
    });
    
    if (isArray) {
      // Add new item to array
      current.push(value);
    } else {
      // Add new property to object
      let propertyName = key || 'newProperty';
      let counter = 1;
      
      // Find a unique property name if not provided or if it already exists
      if (!key || current.hasOwnProperty(propertyName)) {
        while (current.hasOwnProperty(propertyName)) {
          propertyName = `newProperty${counter}`;
          counter++;
        }
      }
      
      current[propertyName] = value;
    }
    
    setJsonData(newData);
    setHasChanges(true);
    showStatus('Property added!', 'success');
  };

  // Handle editing a value
  const handleEditValue = (path: string[], value: any, type: string) => {
    const newData = JSON.parse(JSON.stringify(jsonData));
    let current = newData;
    
    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Update the value
    const key = path[path.length - 1];
    current[key] = value;
    
    setJsonData(newData);
    setHasChanges(true);
    showStatus('Value updated!', 'success');
  };

  // Handle renaming a key
  const handleRenameKey = (path: string[], oldKey: string, newKey: string) => {
    // Log for debugging
    console.log(`Renaming key: path=${JSON.stringify(path)}, oldKey=${oldKey}, newKey=${newKey}`);
    
    // Don't do anything if the key doesn't change
    if (oldKey === newKey) {
      return;
    }
    
    try {
      const newData = JSON.parse(JSON.stringify(jsonData));
      let parent: any;
      
      // Navigate to the parent object containing the key to rename
      if (path.length === 0) {
        // We're at the root level
        parent = newData;
      } else if (path.length === 1 && path[0] === oldKey) {
        // Special case: we're renaming a root level key and the path contains the key itself
        parent = newData;
      } else {
        // We're in a nested object, navigate to parent
        parent = newData;
        for (let i = 0; i < path.length - 1; i++) {
          parent = parent[path[i]];
        }
        
        // Handle case where path ends with the key we're renaming
        if (path.length > 0 && path[path.length - 1] === oldKey) {
          // We're already at the parent, the key is included in the path
        } else {
          // The parent is the object pointed to by the full path
          parent = parent[path[path.length - 1]];
        }
      }
      
      // Additional logging to debug parent object
      console.log(`Parent object keys: ${Object.keys(parent)}`);
      
      // Check if the old key exists in the parent
      if (!parent.hasOwnProperty(oldKey)) {
        console.error(`Key ${oldKey} not found in the parent object.`);
        showStatus(`Failed to rename key: ${oldKey} not found`, 'error');
        return;
      }
      
      // Check if the new key already exists
      if (parent.hasOwnProperty(newKey)) {
        showStatus(`Key '${newKey}' already exists!`, 'error');
        return;
      }
      
      // Get the value we need to preserve
      const valueToPreserve = parent[oldKey];
      
      // Create a new object with the renamed key while preserving order
      const tempObj: Record<string, any> = {};
      
      Object.keys(parent).forEach(k => {
        if (k === oldKey) {
          // Replace with new key
          tempObj[newKey] = valueToPreserve;
        } else {
          tempObj[k] = parent[k];
        }
      });
      
      // Update the parent object
      if (path.length === 0 || (path.length === 1 && path[0] === oldKey)) {
        // For root level, replace the entire data object
        Object.keys(newData).forEach(k => {
          delete newData[k];
        });
        
        Object.keys(tempObj).forEach(k => {
          newData[k] = tempObj[k];
        });
      } else if (path.length > 0 && path[path.length - 1] === oldKey) {
        // Special case where the path ends with the key being renamed
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
        }
        
        // Delete the old key
        delete current[oldKey];
        
        // Add the new key
        current[newKey] = valueToPreserve;
      } else {
        // For nested objects, replace the parent with the new object
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
        }
        
        current[path[path.length - 1]] = tempObj;
      }
      
      setJsonData(newData);
      setHasChanges(true);
      showStatus(`Key renamed from '${oldKey}' to '${newKey}'!`, 'success');
    } catch (error) {
      console.error('Error renaming key:', error);
      showStatus(`Failed to rename key: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  // Handle deletion of a property
  const handleDeleteProperty = (path: string[], key: string) => {
    const newData = JSON.parse(JSON.stringify(jsonData));
    let current = newData;
    
    // Navigate to the parent object
    if (path.length === 0) {
      // If we're at the root level
      if (Array.isArray(jsonData)) {
        // For root level arrays
        const index = parseInt(key, 10);
        if (!isNaN(index)) {
          newData.splice(index, 1);
        }
      } else {
        // For root level objects
        delete newData[key];
      }
    } else {
      // If we're not at the root level
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      
      if (Array.isArray(current)) {
        // For arrays, we need to splice the item
        const index = parseInt(key, 10);
        if (!isNaN(index)) {
          current.splice(index, 1);
        }
      } else if (typeof current === 'object' && current !== null) {
        // For objects, we use delete
        delete current[key];
      }
    }
    
    setJsonData(newData);
    setHasChanges(true);
    showStatus(`Property '${key}' deleted!`, 'success');
  };

  // Handle copying a value to clipboard
  const handleCopyValue = (value: any) => {
    let textToCopy;
    
    if (typeof value === 'object' && value !== null) {
      textToCopy = JSON.stringify(value, null, 2);
    } else {
      textToCopy = String(value);
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => showStatus('Copied to clipboard!', 'success'))
      .catch(err => showStatus(`Failed to copy: ${err}`, 'error'));
  };

  // Handle copying the entire JSON
  const handleCopyJson = () => {
    const currentObject = getCurrentObject();
    const json = JSON.stringify(currentObject, null, 2);
    
    navigator.clipboard.writeText(json)
      .then(() => showStatus('JSON copied to clipboard!', 'success'))
      .catch(err => showStatus(`Failed to copy: ${err}`, 'error'));
  };

  // Handle formatting the JSON
  const handleFormatJson = () => {
    // Format the JSON with standard 2-space indentation
    const formattedData = JSON.parse(JSON.stringify(jsonData));
    
    // Set the data, which will trigger a save even if no content changes
    setJsonData(formattedData);
    
    // Always mark as having changes to enable the save button
    setHasChanges(true);
    
    showStatus('JSON formatted! Click Save to apply formatting.', 'success');
  };

  // Handle saving changes
  const handleSaveChanges = () => {
    // Format the JSON with standard 2-space indentation before saving
    const formattedJson = JSON.parse(JSON.stringify(jsonData));
    
    vscode.postMessage({
      command: 'updateJson',
      json: formattedJson
    });
    
    setOriginalJson(JSON.parse(JSON.stringify(formattedJson)));
    setHasChanges(false);
    showStatus('Changes saved to editor!', 'success');
  };

  // Show status message
  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    
    // Reset status after 3 seconds
    setTimeout(() => {
      setStatusMessage({ text: '', type: 'none' });
    }, 3000);
  };

  return (
    <div className="app-container">
      <Header 
        itemCount={itemCount} 
        onSearch={handleSearch} 
      />
      
      <PathNavigation 
        currentPath={currentPath} 
        onNavigate={handleNavigate} 
      />
      
      <StatusMessage 
        message={statusMessage.text} 
        type={statusMessage.type} 
      />
      
      <JsonTree 
        data={getCurrentObject()}
        path={currentPath}
        searchTerm={searchTerm}
        onNavigate={handleNavigate}
        onAddProperty={handleAddProperty}
        onEditValue={handleEditValue}
        onCopyValue={handleCopyValue}
        onRenameKey={handleRenameKey}
        onDeleteProperty={handleDeleteProperty}
      />
      
      <Footer 
        currentPath={currentPath}
        onCopyJson={handleCopyJson}
        onSaveChanges={handleSaveChanges}
        onFormatJson={handleFormatJson}
        hasChanges={hasChanges}
      />
    </div>
  );
};

export default App;