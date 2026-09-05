import React from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
  style = {},
  disabled = false,
  onClear,
  autoFocus = false,
  id,
  name
}) => {
  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div 
      className={`search-input-wrapper relative flex items-center w-full ${className}`}
      style={style}
    >
      <Search 
        size={18} 
        className="search-input-icon absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors"
        style={{ left: '0.85rem', position: 'absolute', pointerEvents: 'none' }}
      />
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="search-input-field w-full pl-10 pr-9 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="search-input-clear absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full focus:outline-none transition-colors"
          style={{ right: '0.65rem', position: 'absolute' }}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
