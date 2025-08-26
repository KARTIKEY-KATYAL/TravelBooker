import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import FiltersSidebar from "@/components/filters-sidebar";
import TravelOptionCard from "@/components/travel-option-card";
import BookingModal from "@/components/booking-modal";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TravelOption } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<TravelOption | null>(null);
  const [sortBy, setSortBy] = useState("price");
  const [filters, setFilters] = useState({
    types: ['flight', 'train', 'bus'],
    priceRange: [0, 1000],
    timeRanges: [] as string[],
  });

  // Parse search params from URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const queryParams = {
    type: searchParams.get('type') || undefined,
    source: searchParams.get('source') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    passengers: parseInt(searchParams.get('passengers') || '1'),
  };

  const { data: travelOptions, isLoading, error } = useQuery<TravelOption[]>({
    queryKey: ['/api/travel-options/search', queryParams],
    enabled: !!(queryParams.source && queryParams.destination && queryParams.departureDate),
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const filteredOptions = travelOptions?.filter(option => {
    const matchesType = filters.types.includes(option.type);
    const matchesPrice = parseFloat(option.price) >= filters.priceRange[0] && parseFloat(option.price) <= filters.priceRange[1];
    return matchesType && matchesPrice;
  }) || [];

  const sortedOptions = [...filteredOptions].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'duration':
        return a.duration.localeCompare(b.duration);
      case 'departure':
        return a.departureTime.localeCompare(b.departureTime);
      default:
        return 0;
    }
  });

  if (!queryParams.source || !queryParams.destination || !queryParams.departureDate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Search</h1>
            <p className="text-muted-foreground">Please provide valid search parameters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="results-title">Available Travel Options</h2>
              <p className="text-muted-foreground" data-testid="results-summary">
                Found {sortedOptions.length} options for {queryParams.source} → {queryParams.destination} on {new Date(queryParams.departureDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <select 
                className="px-4 py-2 border border-border rounded-lg text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                data-testid="sort-select"
              >
                <option value="price">Sort by Price</option>
                <option value="duration">Sort by Duration</option>
                <option value="departure">Sort by Departure Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Results List */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : sortedOptions.length === 0 ? (
                <div className="text-center py-12" data-testid="no-results">
                  <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedOptions.map((option) => (
                    <TravelOptionCard
                      key={option.id}
                      option={option}
                      onSelect={() => setSelectedOption(option)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedOption && (
        <BookingModal
          travelOption={selectedOption}
          onClose={() => setSelectedOption(null)}
        />
      )}
    </div>
  );
}
