import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchBar.css';

interface SearchBarProps {
  onSearch?: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      
      if (onSearch) {
        onSearch(searchTerm.trim());
      }
      
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    navigate('/');
    setIsExpanded(false);
  };

  return (
    <div className={`search-bar-container ${isExpanded ? 'expanded' : ''}`}>
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-bar-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek evenementen..."
            className="search-bar-input"
            onFocus={() => setIsExpanded(true)}
          />
          <button 
            type="submit" 
            className="search-bar-submit"
            disabled={!searchTerm.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          {searchTerm && (
            <button 
              type="button" 
              onClick={handleClear}
              className="search-bar-clear"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;