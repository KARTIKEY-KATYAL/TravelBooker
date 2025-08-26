import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface FiltersProps {
  types: string[];
  priceRange: number[];
  timeRanges: string[];
}

interface FiltersSidebarProps {
  filters: FiltersProps;
  onFiltersChange: (filters: FiltersProps) => void;
}

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const updateFilters = (key: keyof FiltersProps, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    updateFilters('types', newTypes);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      types: ['flight', 'train', 'bus'],
      priceRange: [0, 1000],
      timeRanges: [],
    });
  };

  return (
    <Card className="sticky top-24" data-testid="filters-sidebar">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        {/* Travel Type Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Travel Type</h4>
          <div className="space-y-2">
            {[
              { id: 'flight', label: 'Flights' },
              { id: 'train', label: 'Trains' },
              { id: 'bus', label: 'Buses' },
            ].map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.types.includes(type.id)}
                  onCheckedChange={(checked) => handleTypeChange(type.id, !!checked)}
                  data-testid={`filter-type-${type.id}`}
                />
                <label htmlFor={type.id} className="text-sm cursor-pointer">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Price Range</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">${filters.priceRange[0]}</span>
              <span className="text-sm">${filters.priceRange[1]}</span>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilters('priceRange', value)}
              max={1000}
              min={0}
              step={25}
              className="w-full"
              data-testid="price-range-slider"
            />
          </div>
        </div>

        {/* Departure Time */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Departure Time</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'morning', label: '6AM-12PM' },
              { id: 'afternoon', label: '12PM-6PM' },
              { id: 'evening', label: '6PM-12AM' },
              { id: 'night', label: '12AM-6AM' },
            ].map((time) => (
              <Button
                key={time.id}
                variant={filters.timeRanges.includes(time.id) ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => {
                  const newTimeRanges = filters.timeRanges.includes(time.id)
                    ? filters.timeRanges.filter(t => t !== time.id)
                    : [...filters.timeRanges, time.id];
                  updateFilters('timeRanges', newTimeRanges);
                }}
                data-testid={`filter-time-${time.id}`}
              >
                {time.label}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="w-full text-primary hover:text-primary"
          data-testid="clear-filters"
        >
          Clear all filters
        </Button>
      </CardContent>
    </Card>
  );
}
