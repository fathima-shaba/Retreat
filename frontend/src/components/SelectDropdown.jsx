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

  // Normalize options to unified object format: { value, label, badgeColor, subtext }
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

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focus index when opening dropdown
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

  // Helper function to resolve color indicator dots for common status/role values
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
      className={`relative w-full ${className}`} 
      ref={dropdownRef} 
      style={{ width: '100%', position: 'relative', ...style }}
    >
      {label && (
        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{ minHeight: '44px', width: '100%', boxSizing: 'border-box' }}
        className={`w-full box-border flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-400'
            : isOpen
            ? 'bg-white dark:bg-gray-800 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-emerald-500/70 dark:hover:border-emerald-500/70 text-gray-900 dark:text-gray-100 shadow-xs'
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {getStatusDot(selectedOption) && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStatusDot(selectedOption) }}
                />
              )}
              <span className="truncate text-gray-900 dark:text-gray-100">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          size={18}
          className={`flex-shrink-0 ml-2 text-gray-400 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Options Menu Overlay - Solid opaque background & high z-index */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 99999,
            boxSizing: 'border-box',
            backgroundColor: 'var(--dropdown-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
          className="absolute left-0 right-0 top-full mt-1 w-full z-[99999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg overflow-y-auto max-h-60 py-1 text-gray-900 dark:text-gray-100"
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-center text-gray-500 dark:text-gray-400">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer select-none transition-colors duration-150 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : isFocused
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {dotColor && (
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                    )}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.subtext && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} className="flex-shrink-0 ml-2 text-emerald-500 dark:text-emerald-400" />
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
