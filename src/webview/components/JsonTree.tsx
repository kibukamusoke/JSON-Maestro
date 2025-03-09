import React, { useState, useEffect, useRef } from 'react';
import { 
  StringIcon, NumberIcon, BooleanIcon, NullIcon, 
  ObjectIcon, ArrayIcon, ChevronIcon, CopyIcon, AddPropertyIcon,
  EditIcon, DeleteIcon
} from './icons';
import '../styles/JsonTree.css';

interface JsonTreeProps {
  data: any;
  path: string[];
  searchTerm: string;
  onNavigate: (path: string[]) => void;
  onAddProperty: (path: string[], isArray: boolean, value?: any, valueType?: string, key?: string) => void;
  onEditValue: (path: string[], value: any, type: string) => void;
  onCopyValue: (value: any) => void;
  onRenameKey?: (path: string[], oldKey: string, newKey: string) => void;
  onDeleteProperty?: (path: string[], key: string) => void;
}

const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  path,
  searchTerm,
  onNavigate,
  onAddProperty,
  onEditValue,
  onCopyValue,
  onRenameKey,
  onDeleteProperty
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState<string | null>(null);

  // Automatically expand the first level when component mounts
  useEffect(() => {
    const newExpandedKeys = new Set<string>();
    
    // Expand root level keys
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object' && data[key] !== null) {
          newExpandedKeys.add(key);
        }
      });
    }
    
    setExpandedKeys(newExpandedKeys);
  }, [data]); // Add data as dependency to re-run when data changes

  // Get the type icon based on value type
  const getTypeIcon = (value: any) => {
    if (value === null) return <NullIcon />;
    if (typeof value === 'string') return <StringIcon />;
    if (typeof value === 'number') return <NumberIcon />;
    if (typeof value === 'boolean') return <BooleanIcon />;
    if (Array.isArray(value)) return <ArrayIcon />;
    return <ObjectIcon />;
  };

  // Format preview value for display
  const formatPreviewValue = (value: any) => {
    if (value === null) return 'null';
    if (typeof value === 'object') return Array.isArray(value) ? '[]' : '{}';
    if (typeof value === 'string') {
      return `"${value.length > 30 ? value.substring(0, 30) + '...' : value}"`;
    }
    return String(value);
  };

  // Toggle expanded state for a key
  const toggleExpand = (keyPath: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(keyPath)) {
      newExpandedKeys.delete(keyPath);
    } else {
      newExpandedKeys.add(keyPath);
    }
    setExpandedKeys(newExpandedKeys);
  };

  // Start editing a value
  const startEditing = (keyPath: string, key: string, isArrayItem: boolean = false) => {
    setEditingPath(keyPath);
    // We no longer set editingKey here, as key editing is separated
  };

  // Start editing a key (separate function kept for backward compatibility)
  const startEditingKey = (keyPath: string, key: string) => {
    if (onRenameKey) {
      setEditingKey(keyPath);
      setEditingPath(null);
    }
  };

  // Handle deletion of a property
  const handleDeleteProperty = (keyPath: string, key: string) => {
    if (onDeleteProperty) {
      onDeleteProperty(keyPath.split('.'), key);
    }
  };

  // Handle value edit
  const handleValueEdit = (keyPath: string, value: any, type: string) => {
    setEditingPath(null);
    onEditValue(keyPath.split('.'), value, type);
  };

  // Handle key rename
  const handleKeyRename = (keyPath: string, oldKey: string, newKey: string) => {
    setEditingKey(null);
    if (onRenameKey) {
      onRenameKey(keyPath.split('.'), oldKey, newKey);
    }
  };

  // Check if a node matches the search term
  const matchesSearch = (key: string, value: any) => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    
    if (key.toLowerCase().includes(searchLower)) return true;
    
    if (value === null) {
      return 'null'.includes(searchLower);
    }
    
    if (typeof value !== 'object') {
      return String(value).toLowerCase().includes(searchLower);
    }
    
    return false;
  };

  // Render a JSON node
  const renderNode = (key: string, value: any, nodePath: string, isArrayItem: boolean = false) => {
    const isObjectOrArray = value !== null && typeof value === 'object';
    const isExpanded = expandedKeys.has(nodePath);
    const isHighlighted = matchesSearch(key, value);
    const isHovered = hoveredPath === nodePath;
    const displayKey = isArrayItem ? `[${key}]` : key;
    
    return (
      <div 
        className="json-item" 
        key={nodePath}
        onMouseEnter={() => setHoveredPath(nodePath)}
        onMouseLeave={() => setHoveredPath(null)}
      >
        <div 
          className={`json-key-container ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''}`}
        >
          <div className={`json-key ${isExpanded ? 'expanded' : ''}`}>
            <span 
              className="json-toggle"
              onClick={() => isObjectOrArray && toggleExpand(nodePath)}
            >
              {isObjectOrArray && <ChevronIcon />}
            </span>
            
            {editingKey === nodePath ? (
              <EditableKey
                initialKey={key}
                isArrayItem={isArrayItem}
                onSave={(newKey) => handleKeyRename(nodePath, key, newKey)}
                onCancel={() => setEditingKey(null)}
              />
            ) : (
              <span 
                className="json-key-text"
                onClick={isArrayItem ? undefined : () => startEditingKey(nodePath, key)}
              >
                {displayKey}
              </span>
            )}
            
            {isObjectOrArray && (
              <>
                <span className="json-item-counts">
                  {Object.keys(value).length} {Object.keys(value).length === 1 ? 'item' : 'items'}
                </span>
                <span className="json-value-type">
                  {getTypeIcon(value)}
                  {Array.isArray(value) ? 'Array' : 'Object'}
                </span>
                {Object.keys(value).length > 0 && (
                  <span 
                    className="json-value-preview"
                    onClick={() => isObjectOrArray && toggleExpand(nodePath)}
                  >
                    {Array.isArray(value) ? '[ ' : '{ '}
                    {Object.keys(value).slice(0, 3).map(k => {
                      // Use type assertion to handle both array and object access
                      const itemValue = value[k as keyof typeof value];
                      return Array.isArray(value) 
                        ? formatPreviewValue(itemValue)
                        : `${k}: ${formatPreviewValue(itemValue)}`;
                    }).join(', ')}
                    {Object.keys(value).length > 3 ? ', ...' : ''}
                    {Array.isArray(value) ? ' ]' : ' }'}
                  </span>
                )}
              </>
            )}
            
            <div className="json-actions">
              {onDeleteProperty && (
                <button 
                  className="action-button delete-button"
                  onClick={() => handleDeleteProperty(nodePath, key)}
                  title="Delete property"
                >
                  <DeleteIcon />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isObjectOrArray ? (
          <div className={`json-children ${isExpanded ? 'visible' : ''}`}>
            {Object.keys(value).length === 0 ? (
              <div className="json-value">
                <span className="json-value-label">
                  {Array.isArray(value) ? 'Empty array' : 'Empty object'}
                </span>
              </div>
            ) : (
              Object.keys(value).map(childKey => 
                renderNode(
                  childKey, 
                  value[childKey as keyof typeof value], 
                  nodePath ? `${nodePath}.${childKey}` : childKey,
                  Array.isArray(value)
                )
              )
            )}
            
            <button 
              className="add-property-button"
              onClick={() => setShowAddProperty(nodePath)}
            >
              <AddPropertyIcon />
              Add {Array.isArray(value) ? 'item' : 'property'}
            </button>
            
            {showAddProperty === nodePath && (
              <div className="add-property-dialog">
                <NewPropertyEditor
                  isArray={Array.isArray(value)}
                  onSave={(newKey, newValue, valueType) => {
                    setShowAddProperty(null);
                    if (Array.isArray(value)) {
                      // For arrays, just add the value
                      onAddProperty(nodePath.split('.'), true, newValue, valueType);
                    } else {
                      // For objects, add key-value pair
                      onAddProperty(nodePath.split('.'), false, newValue, valueType, newKey);
                    }
                  }}
                  onCancel={() => setShowAddProperty(null)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="json-value">
            <div className="json-value-content">
              {editingPath === nodePath ? (
                <EditableValue 
                  value={value}
                  keyName={key}
                  isArrayItem={isArrayItem}
                  onSave={(newValue, type) => {
                    // No longer handling key renaming during value edit
                    handleValueEdit(nodePath, newValue, type);
                  }}
                  onCancel={() => setEditingPath(null)}
                />
              ) : (
                <span 
                  className={`editable json-${typeof value === 'object' ? (value === null ? 'null' : 'object') : typeof value}`}
                  onClick={() => startEditing(nodePath, key, isArrayItem)}
                >
                  {getTypeIcon(value)}
                  {value === null ? 'null' : (
                    typeof value === 'string' ? `"${value}"` : String(value)
                  )}
                </span>
              )}
              
              <div className="value-actions">
                <button 
                  className="action-button"
                  onClick={() => startEditing(nodePath, key, isArrayItem)}
                  title="Edit value"
                >
                  <EditIcon />
                </button>
                
                <button 
                  className="action-button"
                  onClick={() => onCopyValue(value)}
                  title="Copy value"
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="content-area">
      <div className="json-container">
        {/* Only render the actual data keys, no duplicate rendering */}
        {Object.keys(data).map(key => 
          renderNode(key, data[key as keyof typeof data], key)
        )}
        
        {/* Always show Add Property button at root level */}
        {typeof data === 'object' && (
          <>
            <button 
              className="add-property-button root-add-button"
              onClick={() => setShowAddProperty("root")}
            >
              <AddPropertyIcon />
              Add {Array.isArray(data) ? 'item' : 'property'}
            </button>
            
            {showAddProperty === "root" && (
              <div className="add-property-dialog">
                <NewPropertyEditor
                  isArray={Array.isArray(data)}
                  onSave={(newKey, newValue, valueType) => {
                    setShowAddProperty(null);
                    if (Array.isArray(data)) {
                      // For arrays, just add the value
                      onAddProperty([], true, newValue, valueType);
                    } else {
                      // For objects, add key-value pair
                      onAddProperty([], false, newValue, valueType, newKey);
                    }
                  }}
                  onCancel={() => setShowAddProperty(null)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* The EditableValue component definition */
interface EditableValueProps {
  value: any;
  keyName: string;
  isArrayItem?: boolean;
  onSave: (value: any, type: string) => void;
  onCancel: () => void;
}

const EditableValue: React.FC<EditableValueProps> = ({ 
  value, 
  keyName, 
  isArrayItem = false, 
  onSave, 
  onCancel 
}) => {
  const [editValue, setEditValue] = useState(
    typeof value === 'string' ? value : 
    typeof value === 'object' && value !== null ? 
      JSON.stringify(value, null, 2) : 
      String(value)
  );
  const [valueType, setValueType] = useState(
    value === null ? 'null' : typeof value === 'object' ? 
      (Array.isArray(value) ? 'array' : 'object') : typeof value
  );
  const valueInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    // Focus the value input when the component mounts
    if (valueInputRef.current) {
      valueInputRef.current.focus();
      if ('select' in valueInputRef.current) {
        valueInputRef.current.select();
      }
    }
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setValueType(newType);
    
    // Convert value based on new type
    if (newType === 'object' && valueType !== 'object') {
      setEditValue('{}');
    } else if (newType === 'array' && valueType !== 'array') {
      setEditValue('[]');
    } else if (newType === 'boolean' && valueType !== 'boolean') {
      setEditValue('false');
    } else if (newType === 'number' && valueType !== 'number') {
      setEditValue('0');
    } else if (newType === 'string' && valueType !== 'string') {
      setEditValue('');
    } else if (newType === 'null') {
      setEditValue('null');
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleSave = () => {
    let parsedValue: any;
    
    try {
      switch (valueType) {
        case 'string':
          parsedValue = editValue;
          break;
        case 'number':
          parsedValue = Number(editValue);
          if (isNaN(parsedValue)) throw new Error('Invalid number');
          break;
        case 'boolean':
          if (editValue.toLowerCase() === 'true') parsedValue = true;
          else if (editValue.toLowerCase() === 'false') parsedValue = false;
          else throw new Error('Boolean must be true or false');
          break;
        case 'null':
          parsedValue = null;
          break;
        case 'object':
          parsedValue = editValue === '' || editValue === '{}' ? {} : JSON.parse(editValue);
          if (Array.isArray(parsedValue)) throw new Error('Value must be an object');
          break;
        case 'array':
          parsedValue = editValue === '' || editValue === '[]' ? [] : JSON.parse(editValue);
          if (!Array.isArray(parsedValue)) throw new Error('Value must be an array');
          break;
        default:
          parsedValue = editValue;
      }
      
      // No longer passing the key name for editing, just the value and type
      onSave(parsedValue, valueType);
    } catch (error) {
      alert(`Invalid value: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'value') => {
    // For objects and arrays, we don't want to save on Enter as it's used for line breaks
    if (field === 'value' && valueType !== 'object' && valueType !== 'array') {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    }
    
    if (e.key === 'Escape') {
      onCancel();
    }
    
    // Save with Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  // Render a textarea for object/array types and an input for simple types
  const renderValueInput = () => {
    if (valueType === 'object' || valueType === 'array') {
      return (
        <textarea
          ref={valueInputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={handleValueChange}
          onKeyDown={(e) => handleKeyDown(e, 'value')}
          className="editable-value-textarea"
          rows={Math.min(10, (editValue.match(/\n/g) || []).length + 2)}
        />
      );
    }
    
    if (valueType === 'boolean') {
      return (
        <select
          ref={valueInputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'value')}
          className="editable-value-input boolean-select"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    
    return (
      <input
        ref={valueInputRef as React.RefObject<HTMLInputElement>}
        type={valueType === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={handleValueChange}
        onKeyDown={(e) => handleKeyDown(e, 'value')}
        className="editable-value-input"
      />
    );
  };

  return (
    <div className="editable-value-container">
      <div className="editable-value-header">
        <div className="editable-value-title">
          {isArrayItem ? 'Edit Array Item' : `Edit "${keyName}"`}
        </div>
        <div className="editable-value-type">
          <select 
            value={valueType} 
            onChange={handleTypeChange}
            className="type-selector"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="null">Null</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>
        </div>
        
        <div className="editable-value-actions">
          <button 
            className="action-button save-button"
            onClick={handleSave}
            title="Save (Ctrl+Enter)"
          >
            Save
          </button>
          <button 
            className="action-button cancel-button"
            onClick={onCancel}
            title="Cancel (Escape)"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div className="editable-value-wrapper">
        <label className="editable-value-label">Value:</label>
        {renderValueInput()}
      </div>
    </div>
  );
};



interface NewPropertyEditorProps {
  isArray: boolean;
  onSave: (key: string, value: any, valueType: string) => void;
  onCancel: () => void;
}

const NewPropertyEditor: React.FC<NewPropertyEditorProps> = ({ isArray, onSave, onCancel }) => {
  const [keyName, setKeyName] = useState(isArray ? '' : 'newProperty');
  const [valueType, setValueType] = useState<string>('string');
  const [valueContent, setValueContent] = useState<string>('');
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  
  useEffect(() => {
    // Focus the key input when the component mounts
    if (!isArray && keyInputRef.current) {
      keyInputRef.current.focus();
      keyInputRef.current.select();
    } else if (valueInputRef.current) {
      valueInputRef.current.focus();
    }
  }, [isArray]);
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setValueType(newType);
    
    // Reset value when type changes
    switch (newType) {
      case 'string':
        setValueContent('');
        break;
      case 'number':
        setValueContent('0');
        break;
      case 'boolean':
        setValueContent('false');
        break;
      case 'null':
        setValueContent('null');
        break;
      case 'object':
        setValueContent('{}');
        break;
      case 'array':
        setValueContent('[]');
        break;
    }
  };
  
  const handleSaveClick = () => {
    if (!isArray && keyName.trim() === '') {
      alert('Property name cannot be empty');
      if (keyInputRef.current) {
        keyInputRef.current.focus();
      }
      return;
    }
    
    try {
      let parsedValue: any;
      
      switch (valueType) {
        case 'string':
          parsedValue = valueContent;
          break;
        case 'number':
          parsedValue = Number(valueContent);
          if (isNaN(parsedValue)) throw new Error('Invalid number');
          break;
        case 'boolean':
          if (valueContent.toLowerCase() === 'true') parsedValue = true;
          else if (valueContent.toLowerCase() === 'false') parsedValue = false;
          else throw new Error('Boolean must be true or false');
          break;
        case 'null':
          parsedValue = null;
          break;
        case 'object':
          parsedValue = valueContent === '' || valueContent === '{}' ? {} : JSON.parse(valueContent);
          if (Array.isArray(parsedValue)) throw new Error('Value must be an object');
          break;
        case 'array':
          parsedValue = valueContent === '' || valueContent === '[]' ? [] : JSON.parse(valueContent);
          if (!Array.isArray(parsedValue)) throw new Error('Value must be an array');
          break;
        default:
          parsedValue = valueContent;
      }
      
      onSave(keyName, parsedValue, valueType);
    } catch (error) {
      alert(`Invalid value: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const renderValueInput = () => {
    if (valueType === 'object' || valueType === 'array') {
      return (
        <textarea
          ref={valueInputRef as React.RefObject<HTMLTextAreaElement>}
          value={valueContent}
          onChange={(e) => setValueContent(e.target.value)}
          className="editable-value-textarea"
          rows={3}
        />
      );
    }
    
    if (valueType === 'boolean') {
      return (
        <select
          ref={valueInputRef as React.RefObject<HTMLSelectElement>}
          value={valueContent}
          onChange={(e) => setValueContent(e.target.value)}
          className="editable-value-input boolean-select"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    
    return (
      <input
        ref={valueInputRef as React.RefObject<HTMLInputElement>}
        type={valueType === 'number' ? 'number' : 'text'}
        value={valueContent}
        onChange={(e) => setValueContent(e.target.value)}
        className="editable-value-input"
        placeholder={valueType === 'string' ? 'Enter value' : ''}
      />
    );
  };
  
  return (
    <div className="new-property-editor">
      <div className="new-property-header">
        <h3>Add {isArray ? 'Array Item' : 'Property'}</h3>
        <div className="new-property-actions">
          <button className="action-button cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="action-button save-button" onClick={handleSaveClick}>
            Add
          </button>
        </div>
      </div>
      
      {!isArray && (
        <div className="property-field">
          <label>Property Name:</label>
          <input
            ref={keyInputRef}
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="property-name-input"
            placeholder="Enter property name"
          />
        </div>
      )}
      
      <div className="property-field">
        <label>Type:</label>
        <select 
          value={valueType}
          onChange={handleTypeChange}
          className="property-type-select"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="null">Null</option>
          <option value="object">Object</option>
          <option value="array">Array</option>
        </select>
      </div>
      
      <div className="property-field">
        <label>Value:</label>
        {renderValueInput()}
      </div>
    </div>
  );
};

interface EditableKeyProps {
  initialKey: string;
  isArrayItem: boolean;
  onSave: (newKey: string) => void;
  onCancel: () => void;
}

const EditableKey: React.FC<EditableKeyProps> = ({ initialKey, isArrayItem, onSave, onCancel }) => {
  const [keyValue, setKeyValue] = useState(initialKey);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (keyValue.trim() !== '') {
        onSave(keyValue.trim());
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (keyValue.trim() !== '') {
      onSave(keyValue.trim());
    } else {
      onCancel();
    }
  };

  if (isArrayItem) {
    return <span className="json-key-text">[{initialKey}]</span>;
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={keyValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="editable-key-input"
    />
  );
};


export default JsonTree; 