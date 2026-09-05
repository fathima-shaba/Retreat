import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option...', 
  disabled = false,
  className = '',
  style = {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to object format { value, label, badgeColor }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label || opt.value,
        badgeColor: opt.badgeColor,
        subtext: opt.subtext
      };
    }
    return { value: opt, label: String(opt) };
  });

  // Get selected option details
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  // Helper for status badge color dot
  const getStatusDot = (opt) => {
    const valStr = String(opt.value).toLowerCase();
    const lblStr = String(opt.label).toLowerCase();

    if (opt.badgeColor) return opt.badgeColor;
    if (valStr === 'available' || lblStr.includes('available')) return '#10b981'; // Green
    if (valStr === 'occupied' || lblStr.includes('occupied')) return '#ef4444'; // Red
    if (valStr === 'maintenance' || lblStr.includes('maintenance')) return '#f59e0b'; // Amber
    if (valStr === 'student' || valStr === 'floor a') return '#3b82f6'; // Blue
    if (valStr === 'employee' || valStr === 'floor b') return '#8b5cf6'; // Purple
    if (valStr === 'other' || valStr === 'floor c') return '#ec4899'; // Pink
    return null;
  };

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'is-open' : ''} ${className}`} 
      ref={dropdownRef} 
      style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1050 : 'auto', ...style }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">
          {selectedOption ? (
            <span className="custom-select-selected-content">
              {getStatusDot(selectedOption) && (
                <span 
                  className="custom-select-dot" 
                  style={{ backgroundColor: getStatusDot(selectedOption) }}
                />
              )}
              {selectedOption.label}
            </span>
          ) : (
            <span className="custom-select-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown 
          size={18} 
          className={`custom-select-chevron ${isOpen ? 'rotated' : ''}`} 
        />
      </button>

      {/* Floating Popover Options Menu */}
      {isOpen && (
        <div className="custom-select-menu animate-popover" role="listbox">
          {normalizedOptions.length === 0 ? (
            <div className="custom-select-no-options">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              const dotColor = getStatusDot(opt);

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="custom-select-option-label">
                    {dotColor && (
                      <span 
                        className="custom-select-dot" 
                        style={{ backgroundColor: dotColor }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={16} className="custom-select-check" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
