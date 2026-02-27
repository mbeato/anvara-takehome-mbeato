'use client';

import { useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

export interface DropdownConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface ToggleConfig {
  key: string;
  label: string;
}

export interface SortOption {
  label: string;
  value: string;       // field name
  direction: 'asc' | 'desc';
}

export interface FilterBarConfig {
  searchPlaceholder?: string;
  dropdowns?: DropdownConfig[];
  toggles?: ToggleConfig[];
  sortOptions?: SortOption[];
}

export interface FilterBarValues {
  search: string;
  dropdowns: Record<string, string>;
  toggles: Record<string, boolean>;
  sortIndex: number;
}

interface FilterBarProps {
  config: FilterBarConfig;
  values: FilterBarValues;
  onChange: (values: FilterBarValues) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function initialFilterValues(config: FilterBarConfig): FilterBarValues {
  return {
    search: '',
    dropdowns: Object.fromEntries((config.dropdowns ?? []).map((d) => [d.key, ''])),
    toggles: Object.fromEntries((config.toggles ?? []).map((t) => [t.key, false])),
    sortIndex: 0,
  };
}

// ---------------------------------------------------------------------------
// Debounced search sub-component (isolates local state from parent)
// ---------------------------------------------------------------------------

function DebouncedSearch({
  placeholder,
  value,
  onDebouncedChange,
  className,
}: {
  placeholder: string;
  value: string;
  onDebouncedChange: (text: string) => void;
  className: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onDebouncedChange(text), 300);
    },
    [onDebouncedChange]
  );

  // key={value} on the parent forces a re-mount when the external value changes
  // (e.g. URL-driven reset). For normal typing, external value matches so no re-mount.
  return (
    <input
      key={value}
      type="text"
      defaultValue={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FilterBar({ config, values, onChange }: FilterBarProps) {
  const { searchPlaceholder, dropdowns, toggles, sortOptions } = config;

  const controlClass =
    'h-11 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)]';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      {searchPlaceholder && (
        <DebouncedSearch
          placeholder={searchPlaceholder}
          value={values.search}
          onDebouncedChange={(text) => onChange({ ...values, search: text })}
          className={`${controlClass} w-full sm:w-56`}
        />
      )}

      {/* Dropdown filters + Sort (side by side) */}
      <div className="flex items-center gap-3">
        {dropdowns?.map((dd) => (
          <select
            key={dd.key}
            value={values.dropdowns[dd.key] ?? ''}
            onChange={(e) =>
              onChange({
                ...values,
                dropdowns: { ...values.dropdowns, [dd.key]: e.target.value },
              })
            }
            className={controlClass}
          >
            <option value="">All {dd.label}</option>
            {dd.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* Sort */}
        {sortOptions && sortOptions.length > 0 && (
          <select
            value={values.sortIndex}
            onChange={(e) => onChange({ ...values, sortIndex: Number(e.target.value) })}
            className={controlClass}
          >
            {sortOptions.map((opt, i) => (
              <option key={i} value={i}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Toggles */}
      {toggles?.map((tg) => (
        <label key={tg.key} className="flex min-h-[44px] items-center gap-2 text-sm text-[var(--color-foreground)]">
          <input
            type="checkbox"
            checked={values.toggles[tg.key] ?? false}
            onChange={(e) =>
              onChange({
                ...values,
                toggles: { ...values.toggles, [tg.key]: e.target.checked },
              })
            }
            className="accent-[var(--color-primary)]"
          />
          {tg.label}
        </label>
      ))}
    </div>
  );
}
