import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SearchParams } from "@shared/schema";

export default function HeroSearch() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<'flight' | 'train' | 'bus'>('flight');

  const form = useForm<SearchParams>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      type: 'flight',
      source: '',
      destination: '',
      departureDate: '',
      passengers: 1,
    },
  });

  const onSubmit = (data: SearchParams) => {
    const searchParams = new URLSearchParams();
    if (data.type) searchParams.set('type', data.type);
    searchParams.set('source', data.source);
    searchParams.set('destination', data.destination);
    searchParams.set('departureDate', data.departureDate);
    searchParams.set('passengers', data.passengers.toString());
    
    setLocation(`/search?${searchParams.toString()}`);
  };

  const travelTypes = [
    { id: 'flight', label: 'Flights', icon: 'fas fa-plane' },
    { id: 'train', label: 'Trains', icon: 'fas fa-train' },
    { id: 'bus', label: 'Buses', icon: 'fas fa-bus' },
  ] as const;

  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* Background Image */}
      <div 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
        className="absolute inset-0 opacity-20"
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-testid="hero-title">
            Your Journey Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto" data-testid="hero-subtitle">
            Discover amazing destinations with flights, trains, and buses. Book your perfect trip today.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Travel Type Selector */}
              <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
                {travelTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(type.id);
                      form.setValue('type', type.id);
                    }}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                      selectedType === type.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    data-testid={`travel-type-${type.id}`}
                  >
                    <i className={type.icon}></i>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">From</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                          <Input 
                            placeholder="Departure city" 
                            className="pl-10"
                            data-testid="input-source"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">To</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                          <Input 
                            placeholder="Destination city" 
                            className="pl-10"
                            data-testid="input-destination"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">Departure</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <i className="fas fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                          <Input 
                            type="date" 
                            className="pl-10"
                            min={new Date().toISOString().split('T')[0]}
                            data-testid="input-departure-date"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">Passengers</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <i className="fas fa-users absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"></i>
                          <Select 
                            value={field.value.toString()} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger className="pl-10" data-testid="select-passengers">
                              <SelectValue placeholder="Select passengers" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Passenger{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Search Button */}
              <Button 
                type="submit" 
                className="w-full font-semibold py-4 text-lg"
                data-testid="search-button"
              >
                <i className="fas fa-search mr-2"></i>
                Search Travel Options
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
