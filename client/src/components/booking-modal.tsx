import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { TravelOption } from "@shared/schema";

const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  numberOfSeats: z.number().min(1).max(10),
  seatNumbers: z.string().optional(),
});

type PassengerForm = z.infer<typeof passengerSchema>;

interface BookingModalProps {
  travelOption: TravelOption;
  onClose: () => void;
}

export default function BookingModal({ travelOption, onClose }: BookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const form = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      numberOfSeats: 1,
      seatNumbers: '',
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: PassengerForm) => {
      const totalPrice = (parseFloat(travelOption.price) * data.numberOfSeats).toFixed(2);
      
      const bookingData = {
        travelOptionId: travelOption.id,
        numberOfSeats: data.numberOfSeats,
        totalPrice,
        seatNumbers: selectedSeats.join(', ') || undefined,
        passengerDetails: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
      };

      await apiRequest('POST', '/api/bookings', bookingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Success!",
        description: "Your booking has been confirmed",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PassengerForm) => {
    bookingMutation.mutate(data);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'flight':
        return 'fas fa-plane';
      case 'train':
        return 'fas fa-train';
      case 'bus':
        return 'fas fa-bus';
      default:
        return 'fas fa-map-marker-alt';
    }
  };

  const getOperatorName = () => {
    if (travelOption.airline) return travelOption.airline;
    if (travelOption.trainOperator) return travelOption.trainOperator;
    if (travelOption.busOperator) return travelOption.busOperator;
    return 'Unknown';
  };

  // Simple seat selection (for demo purposes)
  const generateSeats = () => {
    const seats = [];
    const numberOfSeats = form.watch('numberOfSeats');
    
    for (let i = 1; i <= Math.min(numberOfSeats, 10); i++) {
      const seatNumber = `${15 + Math.floor((i - 1) / 6)}${String.fromCharCode(65 + ((i - 1) % 6))}`;
      seats.push(seatNumber);
    }
    
    setSelectedSeats(seats);
    form.setValue('seatNumbers', seats.join(', '));
    return seats;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="booking-modal">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
          
          {/* Booking Progress */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div className="flex-1 h-0.5 bg-primary"></div>
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div className="flex-1 h-0.5 bg-muted"></div>
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-primary font-medium">Passenger Details</span>
              <span className="text-muted-foreground">Payment</span>
              <span className="text-muted-foreground">Confirmation</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Summary */}
          <div className="bg-muted/50 rounded-lg p-4" data-testid="trip-summary">
            <h3 className="font-semibold mb-3">Trip Summary</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className={`${getIconForType(travelOption.type)} text-primary`}></i>
                <div>
                  <div className="font-medium" data-testid="trip-route">
                    {travelOption.source} → {travelOption.destination}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid="trip-datetime">
                    {new Date(travelOption.departureDate).toLocaleDateString()} • {travelOption.departureTime} - {travelOption.arrivalTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getOperatorName()} • {travelOption.vehicleNumber}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg" data-testid="trip-price">${travelOption.price}</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
            </div>
          </div>

          {/* Passenger Information Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Passenger Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input data-testid="input-first-name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input data-testid="input-last-name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" data-testid="input-email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input type="tel" data-testid="input-phone" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Seats</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10"
                            data-testid="input-seats"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value));
                              generateSeats();
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seat Selection Display */}
              {selectedSeats.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selected Seats</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <div key={seat} className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
                          {seat}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Seats have been automatically assigned for your convenience.
                    </p>
                  </div>
                </div>
              )}

              {/* Total and Actions */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Price</div>
                    <div className="text-3xl font-bold" data-testid="total-price">
                      ${(parseFloat(travelOption.price) * form.watch('numberOfSeats')).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Includes taxes and fees</div>
                    <div>Free cancellation until 24h before</div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                    data-testid="cancel-booking"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={bookingMutation.isPending}
                    data-testid="confirm-booking"
                  >
                    {bookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
