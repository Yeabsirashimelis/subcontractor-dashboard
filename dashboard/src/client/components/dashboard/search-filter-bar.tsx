import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useFilterOptions } from "@/hooks/use-stats";
import { useDebounce } from "@/hooks/use-debounce";
import type { SubcontractorFilters } from "@/hooks/use-subcontractors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function SearchFilterBar({ filters, onFilterChange }: Props) {
  const { data } = useFilterOptions();
  const options = data?.data;

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, city, or trade..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchInput("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 sm:hidden"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAll} className="shrink-0">
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear all</span>
          </Button>
        )}
      </div>

      {/* Desktop filters - always visible */}
      <div className="hidden sm:flex sm:flex-wrap sm:items-end sm:gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 w-5 justify-center rounded-full p-0 text-[10px]">
              {activeFilterCount}
            </Badge>
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

      {/* Mobile filters - collapsible */}
      {filtersOpen && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-3 sm:hidden">
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
      )}
    </div>
  );
}
