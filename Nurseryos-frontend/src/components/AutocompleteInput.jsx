import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';

export default function AutocompleteInput({
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  placeholder = 'Type to search...',
  displayKey = 'name',
  subKey = null,
  className = '',
  disabled = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = value?.trim();
      if (query && query.length >= 1) {
        setLoading(true);
        try {
          const results = await fetchSuggestions(query);
          setSuggestions(results || []);
          setShowDropdown(true);
          setHighlightIndex(-1);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    onChange?.(item[displayKey]);
    onSelect?.(item);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const clearValue = () => {
    onChange?.('');
    onSelect?.(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
        {value && (
          <button
            type="button"
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                idx === highlightIndex ? 'bg-emerald-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="min-w-0">
                <p className={`font-semibold truncate ${idx === highlightIndex ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {item[displayKey]}
                </p>
                {subKey && item[subKey] && (
                  <p className="text-[11px] text-slate-400 truncate">{item[subKey]}</p>
                )}
              </div>
              {item.isOwn && (
                <span className="shrink-0 ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  YOURS
                </span>
              )}
              {idx === highlightIndex && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}

      {showDropdown && !loading && suggestions.length === 0 && value?.trim().length >= 1 && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs text-slate-400">
          No matching plants found. You can create a new one.
        </div>
      )}
    </div>
  );
}
