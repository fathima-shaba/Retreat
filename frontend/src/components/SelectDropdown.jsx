import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const SelectDropdown = ({
  options = [],
  value,
  onChange,
  name = '',
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  style = {},
  id = '',
  required = false,
  label = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Normalize options to unified format: { value, label, badgeColor, subtext }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? String(opt.label) : String(opt.value),
        badgeColor: opt.badgeColor,
        subtext: opt.subtext
      };
    }
    return { value: opt, label: String(opt) };
  });

  // Currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset keyboard focus index on open
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: optionValue
        }
      });
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[focusedIndex].value);
      } else {
        setIsOpen(prev => !prev);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) => (prev + 1) % normalizedOptions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
      }
    }
  };

  // Helper function to resolve indicator dot colors
  const getStatusDot = (opt) => {
    if (!opt) return null;
    if (opt.badgeColor) return opt.badgeColor;

    const valStr = String(opt.value).toLowerCase();
    const lblStr = String(opt.label).toLowerCase();

    if (valStr === 'paid' || valStr === 'available' || lblStr.includes('paid')) return '#10b981'; // Emerald Green
    if (valStr === 'pending' || valStr === 'maintenance' || lblStr.includes('pending')) return '#f59e0b'; // Amber
    if (valStr === 'overdue' || valStr === 'occupied' || lblStr.includes('overdue')) return '#ef4444'; // Red
    if (valStr === 'cash' || valStr === 'student' || valStr === 'admin') return '#3b82f6'; // Blue
    if (valStr === 'upi' || valStr === 'employee' || valStr === 'staff') return '#8b5cf6'; // Purple
    if (valStr === 'card' || valStr === 'bank transfer') return '#06b6d4'; // Cyan

    return null;
  };

  return (
    <div 
      className={`select-dropdown-container relative w-full ${className}`} 
      ref={dropdownRef} 
      style={{ width: '100%', position: 'relative', ...style }}
    >
      {label && (
        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Pro Dropdown Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          minHeight: '44px',
          width: '100%',
          boxSizing: 'border-box',
          background: 'var(--input-bg, rgba(0, 0, 0, 0.25))',
          border: isOpen ? '1px solid var(--accent-primary, #10b981)' : '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
          boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
          color: 'var(--text-primary, #f8fafc)',
          borderRadius: '10px',
          padding: '0.6rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span className="truncate flex items-center gap-2 text-sm font-medium">
          {selectedOption ? (
            <>
              {getStatusDot(selectedOption) && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStatusDot(selectedOption) }}
                />
              )}
              <span className="truncate" style={{ color: 'var(--text-primary)' }}>{selectedOption.label}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>
          )}
        </span>

        <ChevronDown
          size={18}
          style={{
            color: isOpen ? 'var(--accent-primary, #10b981)' : 'var(--text-secondary, #94a3b8)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease, color 0.2s ease'
          }}
          className="flex-shrink-0 ml-2"
        />
      </button>

      {/* Pro Floating Overlay Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 99999,
            boxSizing: 'border-box',
            background: 'var(--dropdown-bg, #16201d)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 10px 15px -5px rgba(0, 0, 0, 0.3)',
            padding: '6px',
            maxHeight: '230px',
            overflowY: 'auto',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
          className="animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-thin"
        >
          {normalizedOptions.length === 0 ? (
            <div 
              style={{ 
                padding: '0.75rem', 
                fontSize: '0.8rem', 
                textAlign: 'center', 
                color: 'var(--text-secondary)' 
              }}
            >
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              const isFocused = index === focusedIndex;
              const dotColor = getStatusDot(opt);

              return (
                <div
                  key={`${opt.value}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: '2px',
                    background: isSelected 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : isFocused 
                      ? 'var(--dropdown-hover, rgba(16, 185, 129, 0.1))' 
                      : 'transparent',
                    color: isSelected 
                      ? 'var(--accent-primary, #10b981)' 
                      : 'var(--text-primary, #f8fafc)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dotColor && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: dotColor,
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                      {opt.subtext && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} style={{ color: 'var(--accent-primary, #10b981)', flexShrink: 0, marginLeft: '0.5rem' }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
