import React from 'react';
import { CopyIcon, SaveIcon, FormatIcon } from './icons';
import '../styles/Footer.css';

interface FooterProps {
  currentPath: string[];
  onCopyJson: () => void;
  onSaveChanges: () => void;
  onFormatJson: () => void;
  hasChanges?: boolean;
}

const Footer: React.FC<FooterProps> = ({ 
  currentPath, 
  onCopyJson, 
  onSaveChanges,
  onFormatJson,
  hasChanges = false
}) => {
  const displayPath = currentPath.length === 0 
    ? 'root' 
    : `root.${currentPath.join('.')}`;

  return (
    <div className="footer">
      <div className="path-display">
        Path: <span className="path-segment">{displayPath}</span>
        {hasChanges && <span className="unsaved-indicator">• Unsaved changes</span>}
      </div>
      <div className="buttons">
        <button className="secondary-button" onClick={onCopyJson}>
          <CopyIcon />
          Copy JSON
        </button>
        <button className="secondary-button" onClick={onFormatJson}>
          <FormatIcon />
          Format JSON
        </button>
        <button 
          onClick={onSaveChanges} 
          className={hasChanges ? 'primary-button highlight-button' : 'primary-button'}
          disabled={!hasChanges}
        >
          <SaveIcon />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Footer;