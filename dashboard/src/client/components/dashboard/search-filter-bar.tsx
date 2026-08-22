import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useFilterOptions } from "@/hooks/use-stats";
import { useDebounce } from "@/hooks/use-debounce";
import type { SubcontractorFilters } from "@/hooks/use-subcontractors";

interface Props {
  filters: SubcontractorFilters;
  onFilterChange: (filters: Partial<SubcontractorFilters>) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full min-w-[140px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">All {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SearchFilterBar({ filters, onFilterChange }: Props) {
  const { data } = useFilterOptions();
  const options = data?.data;

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  const activeFilterCount = [filters.trade, filters.city, filters.companyType]
    .filter(Boolean).length;

  const hasActiveFilters = !!filters.search || activeFilterCount > 0;

  function clearAll() {
    setSearchInput("");
    onFilterChange({
      search: "",
      trade: "",
      city: "",
      companyType: "",
      page: 1,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, city, or trade..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-input px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>

        <FilterSelect
          label="Trade"
          value={filters.trade ?? ""}
          options={options?.trades ?? []}
          onChange={(trade) => onFilterChange({ trade, page: 1 })}
        />
        <FilterSelect
          label="City"
          value={filters.city ?? ""}
          options={options?.cities ?? []}
          onChange={(city) => onFilterChange({ city, page: 1 })}
        />
        <FilterSelect
          label="Company Type"
          value={filters.companyType ?? ""}
          options={options?.companyTypes ?? []}
          onChange={(companyType) =>
            onFilterChange({ companyType, page: 1 })
          }
        />
      </div>
    </div>
  );
}
