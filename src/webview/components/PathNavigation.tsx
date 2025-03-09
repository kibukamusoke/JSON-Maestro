import React from 'react';
import '../styles/PathNavigation.css';

interface PathNavigationProps {
  currentPath: string[];
  onNavigate: (path: string[]) => void;
}

const PathNavigation: React.FC<PathNavigationProps> = ({ currentPath, onNavigate }) => {
  const handlePathClick = (index: number) => {
    // Navigate to the clicked path segment
    const newPath = index === -1 ? [] : currentPath.slice(0, index + 1);
    onNavigate(newPath);
  };

  return (
    <div className="path-navigation">
      <span 
        className="path-segment-item" 
        onClick={() => handlePathClick(-1)}
      >
        root
      </span>
      
      {currentPath.map((segment, index) => (
        <React.Fragment key={index}>
          <span className="path-segment-separator">/</span>
          <span 
            className="path-segment-item" 
            onClick={() => handlePathClick(index)}
          >
            {segment}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default PathNavigation; 