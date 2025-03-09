import React from 'react';
import { LogoIcon, SearchIcon } from './icons';
import '../styles/Header.css';

interface HeaderProps {
  itemCount: number;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ itemCount, onSearch }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="header">
      <h1 className="app-title">
        <LogoIcon />
        JSON Maestro
      </h1>
      <div className="controls">
        <div className="search-container">
          <div className="search-icon">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            className="search-box" 
            placeholder="Search keys or values..." 
            onChange={handleSearchChange}
          />
        </div>
        <div className="count-badge">{itemCount} items</div>
      </div>
    </div>
  );
};

export default Header; 