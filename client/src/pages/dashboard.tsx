import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Booking, TravelOption } from "@shared/schema";

type BookingWithTravelOption = Booking & { travelOption: TravelOption };

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, user, toast]);

  const { data: bookings, isLoading } = useQuery<BookingWithTravelOption[]>({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await apiRequest('PATCH', `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
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
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.travelOption.departureDate) > new Date()) || [];
  const pastBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.travelOption.departureDate) <= new Date()) || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];

  const totalSpent = bookings?.reduce((sum, booking) => {
    if (booking.status === 'confirmed') {
      return sum + parseFloat(booking.totalPrice);
    }
    return sum;
  }, 0) || 0;

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

  const getOperatorName = (option: TravelOption) => {
    if (option.airline) return option.airline;
    if (option.trainOperator) return option.trainOperator;
    if (option.busOperator) return option.busOperator;
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-primary text-lg"></i>
                    </div>
                    <div>
                      <div className="font-semibold" data-testid="user-name">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid="user-email">{user.email}</div>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    <div className="block px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg font-medium">My Bookings</div>
                    <a href="/api/logout" className="block px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg">
                      Logout
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="dashboard-title">My Bookings</h2>
                <p className="text-muted-foreground">Manage your current and past travel bookings</p>
              </div>

              {/* Booking Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-calendar-check text-primary"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-bold" data-testid="upcoming-trips">{upcomingBookings.length}</div>
                        <div className="text-sm text-muted-foreground">Upcoming Trips</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check-circle text-green-600"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-bold" data-testid="completed-trips">{pastBookings.length}</div>
                        <div className="text-sm text-muted-foreground">Completed Trips</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-dollar-sign text-orange-600"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-bold" data-testid="total-spent">${totalSpent.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Total Spent</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bookings List */}
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6 animate-pulse">
                        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : bookings?.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center" data-testid="no-bookings">
                    <i className="fas fa-calendar-times text-4xl text-muted-foreground mb-4"></i>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">Start planning your next adventure!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Bookings */}
                  {upcomingBookings.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Upcoming Trips</h3>
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <Card key={booking.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <i className={`${getIconForType(booking.travelOption.type)} text-primary`}></i>
                                  </div>
                                  <div>
                                    <div className="font-semibold" data-testid={`booking-route-${booking.id}`}>
                                      {booking.travelOption.source} → {booking.travelOption.destination}
                                    </div>
                                    <div className="text-sm text-muted-foreground" data-testid={`booking-date-${booking.id}`}>
                                      {new Date(booking.travelOption.departureDate).toLocaleDateString()} • {booking.travelOption.departureTime}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                  <div className="text-right">
                                    <div className="font-semibold" data-testid={`booking-price-${booking.id}`}>${booking.totalPrice}</div>
                                    <div className="text-sm text-muted-foreground">{booking.numberOfSeats} passenger{booking.numberOfSeats > 1 ? 's' : ''}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Booking ID:</span>
                                  <span className="font-medium ml-2" data-testid={`booking-id-${booking.id}`}>{booking.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Operator:</span>
                                  <span className="font-medium ml-2">{getOperatorName(booking.travelOption)}</span>
                                </div>
                                {booking.seatNumbers && (
                                  <div>
                                    <span className="text-muted-foreground">Seats:</span>
                                    <span className="font-medium ml-2">{booking.seatNumbers}</span>
                                  </div>
                                )}
                                {booking.travelOption.vehicleNumber && (
                                  <div>
                                    <span className="text-muted-foreground">Vehicle:</span>
                                    <span className="font-medium ml-2">{booking.travelOption.vehicleNumber}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="text-sm text-muted-foreground">
                                  Booked on {new Date(booking.createdAt!).toLocaleDateString()}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => cancelBookingMutation.mutate(booking.id)}
                                    disabled={cancelBookingMutation.isPending}
                                    data-testid={`cancel-booking-${booking.id}`}
                                  >
                                    {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Bookings */}
                  {pastBookings.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Past Trips</h3>
                      <div className="space-y-4">
                        {pastBookings.map((booking) => (
                          <Card key={booking.id} className="opacity-75">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                    <i className={`${getIconForType(booking.travelOption.type)} text-muted-foreground`}></i>
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {booking.travelOption.source} → {booking.travelOption.destination}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(booking.travelOption.departureDate).toLocaleDateString()} • {booking.travelOption.departureTime}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Completed</span>
                                  <div className="text-right">
                                    <div className="font-semibold">${booking.totalPrice}</div>
                                    <div className="text-sm text-muted-foreground">{booking.numberOfSeats} passenger{booking.numberOfSeats > 1 ? 's' : ''}</div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancelled Bookings */}
                  {cancelledBookings.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Cancelled Bookings</h3>
                      <div className="space-y-4">
                        {cancelledBookings.map((booking) => (
                          <Card key={booking.id} className="opacity-50">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <i className={`${getIconForType(booking.travelOption.type)} text-red-600`}></i>
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {booking.travelOption.source} → {booking.travelOption.destination}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(booking.travelOption.departureDate).toLocaleDateString()} • {booking.travelOption.departureTime}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Cancelled</span>
                                  <div className="text-right">
                                    <div className="font-semibold">${booking.totalPrice}</div>
                                    <div className="text-sm text-muted-foreground">{booking.numberOfSeats} passenger{booking.numberOfSeats > 1 ? 's' : ''}</div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
