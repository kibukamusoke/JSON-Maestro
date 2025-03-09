import React, { useState, useEffect } from 'react';

interface StatusMessageProps {
  message: string;
  type: 'success' | 'error' | 'none';
  duration?: number;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ 
  message, 
  type, 
  duration = 3000 
}) => {
  const [visible, setVisible] = useState(type !== 'none');

  useEffect(() => {
    setVisible(type !== 'none');
    
    if (type !== 'none') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, type, duration]);

  if (!visible) {
    return null;
  }

  return (
    <div className={`status-message status-${type}`}>
      {message}
    </div>
  );
};

export default StatusMessage; 