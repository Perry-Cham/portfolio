'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ProjectSort =
  'featured' | 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

export type ProjectFilters = {
  sort: ProjectSort;
  tags: string[];
};

export const DEFAULT_PROJECT_SORT: ProjectSort = 'featured';

export const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: 'featured', label: 'Default' },
  { value: 'name-asc', label: 'Name (asc)' },
  { value: 'name-desc', label: 'Name (desc)' },
  { value: 'date-asc', label: 'Date (asc)' },
  { value: 'date-desc', label: 'Date (desc)' },
];

type FilterMenuProps = {
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
  availableTags: string[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
};

export function FilterMenu({
  sort,
  onSortChange,
  availableTags,
  selectedTags,
  onSelectedTagsChange,
}: FilterMenuProps) {
  const isDefaultSort = sort === 'featured';
  const hasActiveFilters = !isDefaultSort || selectedTags.length > 0;
  const activeFilterCount = (isDefaultSort ? 0 : 1) + selectedTags.length;

  function handleTagToggle(tag: string, checked: boolean) {
    onSelectedTagsChange(
      checked
        ? [...selectedTags, tag].sort((a, b) => a.localeCompare(b))
        : selectedTags.filter((t) => t !== tag)
    );
  }

  function handleClearFilters() {
    onSortChange('featured');
    onSelectedTagsChange([]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => onSortChange(value as ProjectSort)}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Technology</DropdownMenuLabel>
          {availableTags.length === 0 ? (
            <DropdownMenuLabel className="px-2 py-1.5 text-sm text-muted-foreground">
              No tags yet
            </DropdownMenuLabel>
          ) : (
            availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) =>
                  handleTagToggle(tag, checked === true)
                }
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuGroup>
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearFilters}>
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
