"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export interface Select2Option {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface Select2Props {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  options?: Select2Option[];
  children?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string) => void;
}

function extractText(node: ReactNode): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children);
  }
  return "";
}

function parseChildrenToOptions(children: ReactNode): Select2Option[] {
  const result: Select2Option[] = [];

  const traverse = (nodes: ReactNode, groupName?: string) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;

      const type = child.type;
      const props = child.props as { value?: unknown; children?: ReactNode; disabled?: boolean; label?: string };

      if (type === "option") {
        const val = props.value !== undefined ? String(props.value) : extractText(props.children);
        result.push({
          value: val,
          label: props.children ?? val,
          disabled: props.disabled,
          group: groupName,
        });
      } else if (type === "optgroup") {
        traverse(props.children, props.label);
      } else if (props && props.children) {
        traverse(props.children, groupName);
      }
    });
  };

  traverse(children);
  return result;
}

/**
 * Select2 Composant Universel Hautement Ergonomique & 100% Responsive
 * - Mobile (<640px) : Tiroir Modal Bottom-Sheet avec recherche tactile et cibles confortables (>=44px)
 * - Tablette & Desktop (>=640px) : Menu contextuel intelligent avec détection d'espace haut/bas et alignement anti-débordement
 */
export const Select2: React.FC<Select2Props> = ({
  id,
  name,
  value,
  defaultValue,
  options: propOptions,
  children,
  placeholder = "Sélectionner...",
  disabled = false,
  required = false,
  searchable,
  clearable = false,
  className = "",
  containerClassName = "",
  dropdownClassName = "",
  onChange,
  onValueChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Parse options either from options prop or children (<option>)
  const options = useMemo(() => {
    if (propOptions && propOptions.length > 0) {
      return propOptions;
    }
    if (children) {
      return parseChildrenToOptions(children);
    }
    return [];
  }, [propOptions, children]);

  // Controlled or uncontrolled state
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    if (options.length > 0) return options[0].value;
    return "";
  });

  const selectedValue = isControlled ? value : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpwards, setOpenUpwards] = useState(false);

  // Determine if searchable: true by default if options count >= 5, or if explicitly passed
  const isSearchable = searchable !== undefined ? searchable : options.length >= 5;

  // Selected option finding
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === selectedValue);
  }, [options, selectedValue]);

  // Détection de l'espace pour ouvrir vers le haut ou le bas sur desktop
  useEffect(() => {
    if (isOpen && containerRef.current && typeof window !== "undefined") {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > 280) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable) {
      const timer = setTimeout(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 640) {
          searchInputRef.current?.focus();
        } else {
          mobileSearchInputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, isSearchable]);

  const handleSelect = useCallback(
    (newVal: string) => {
      if (!isControlled) {
        setInternalValue(newVal);
      }
      setIsOpen(false);
      setSearchQuery("");

      if (onValueChange) {
        onValueChange(newVal);
      }
      if (onChange) {
        onChange({
          target: { value: newVal, name: name || "" },
        });
      }
    },
    [isControlled, name, onChange, onValueChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect("");
  };

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const text = extractText(opt.label).toLowerCase();
      const val = String(opt.value).toLowerCase();
      return text.includes(query) || val.includes(query);
    });
  }, [options, searchQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = filteredOptions.findIndex((opt) => opt.value === selectedValue);
      let nextIndex = e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0) nextIndex = filteredOptions.length - 1;
      if (nextIndex >= filteredOptions.length) nextIndex = 0;
      const targetOption = filteredOptions[nextIndex];
      if (targetOption && !targetOption.disabled) {
        handleSelect(targetOption.value);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-full text-left ${containerClassName} ${
        disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
      }`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for form submits */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={selectedValue ?? ""}
        required={required}
      />

      {/* Main Trigger Button : Touch-friendly (>=42px mobile, 38px desktop) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 sm:px-3 sm:py-2 min-h-[42px] sm:min-h-[38px] text-xs font-medium text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 ${
          isOpen ? "ring-2 ring-brand-500/20 border-brand-500 bg-white dark:bg-gray-800" : ""
        } ${className}`}
      >
        <span className="truncate text-left flex-1 min-w-0 block">
          {selectedOption ? selectedOption.label : <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
        </span>

        <span className="flex items-center gap-1.5 shrink-0 text-gray-400 dark:text-gray-500">
          {clearable && selectedValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="rounded p-1 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-brand-600 dark:text-brand-400" : ""
            }`}
          />
        </span>
      </button>

      {/* ========================================================= */}
      {/* 1. MOBILE BOTTOM SHEET (Écrans < 640px)                  */}
      {/* Ergonomie tactile maximale, pas de clipping ni overflow */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[85vh] flex-col rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom duration-250 dark:border-gray-800 dark:bg-gray-900">
            {/* Header with pill and close button */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 pt-3 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white truncate">
                  {placeholder || "Sélectionner une option"}
                </span>
                <span className="text-[10px] text-gray-400">({options.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Mobile Search Input */}
            {isSearchable && (
              <div className="border-b border-gray-100 p-3 dark:border-gray-800">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer parmi les choix..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Options List with comfortable >=44px touch targets */}
            <div
              role="listbox"
              tabIndex={-1}
              className="flex-1 overflow-y-auto p-2 space-y-1 overscroll-contain"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                  Aucun résultat ne correspond à votre recherche
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === selectedValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      className={`flex w-full min-h-[44px] items-center justify-between rounded-xl px-4 py-3 text-sm text-left transition ${
                        opt.disabled
                          ? "cursor-not-allowed opacity-40 text-gray-400"
                          : isSelected
                          ? "bg-brand-50 font-bold text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 ring-1 ring-brand-500/30"
                          : "text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700"
                      }`}
                    >
                      <span className="flex-1 pr-3 break-words leading-tight">{opt.label}</span>
                      {isSelected && (
                        <Check className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TABLET & DESKTOP POPPING DROPDOWN (Écrans >= 640px)    */}
      {/* Alignement contextuel précis, anti-clipping viewport      */}
      {/* ========================================================= */}
      {isOpen && (
        <div
          className={`hidden sm:block absolute left-0 z-50 w-full min-w-full max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl transition-all duration-150 animate-in fade-in zoom-in-95 dark:border-gray-700 dark:bg-gray-800 dark:shadow-2xl ${
            openUpwards ? "bottom-full mb-1.5 top-auto" : "top-full mt-1.5"
          } ${dropdownClassName}`}
        >
          {/* Desktop Search Input */}
          {isSearchable && (
            <div className="relative mb-1.5 px-1 pt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 dark:text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900/60 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Desktop Options List */}
          <div
            role="listbox"
            tabIndex={-1}
            className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-gray-400 dark:text-gray-500">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === selectedValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition ${
                      opt.disabled
                        ? "cursor-not-allowed opacity-40 text-gray-400"
                        : isSelected
                        ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/60 dark:hover:text-white"
                    }`}
                  >
                    <span className="truncate flex-1 min-w-0 pr-2">{opt.label}</span>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-brand-600 dark:text-brand-400 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select2;
