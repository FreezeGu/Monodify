import React, { useState, useEffect } from 'react';

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Search...',
  className = '',
  defaultValue = '',
  ...props 
}) {
  const [query, setQuery] = useState(defaultValue);
  
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      // Debounce search
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => onSearch(value), 300);
    }
  };
  
  return (
    <div className={`glass-search-bar ${className}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
