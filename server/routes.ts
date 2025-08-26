import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { searchSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Travel options routes
  app.get('/api/travel-options/search', async (req, res) => {
    try {
      const params = searchSchema.parse({
        type: req.query.type,
        source: req.query.source,
        destination: req.query.destination,
        departureDate: req.query.departureDate,
        passengers: req.query.passengers ? parseInt(req.query.passengers as string) : 1,
      });

      const results = await storage.searchTravelOptions(params);
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search parameters", errors: error.errors });
      }
      console.error("Error searching travel options:", error);
      res.status(500).json({ message: "Failed to search travel options" });
    }
  });

  app.get('/api/travel-options/:id', async (req, res) => {
    try {
      const option = await storage.getTravelOption(req.params.id);
      if (!option) {
        return res.status(404).json({ message: "Travel option not found" });
      }
      res.json(option);
    } catch (error) {
      console.error("Error fetching travel option:", error);
      res.status(500).json({ message: "Failed to fetch travel option" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });

      // Check if travel option exists and has enough seats
      const travelOption = await storage.getTravelOption(bookingData.travelOptionId);
      if (!travelOption) {
        return res.status(404).json({ message: "Travel option not found" });
      }

      if (travelOption.availableSeats < bookingData.numberOfSeats) {
        return res.status(400).json({ message: "Not enough seats available" });
      }

      // Create booking and update available seats
      const booking = await storage.createBooking(bookingData);
      await storage.updateTravelOptionSeats(bookingData.travelOptionId, bookingData.numberOfSeats);

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      const userId = req.user.claims.sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view this booking" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.cancelBooking(req.params.id, userId);
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Seed some sample travel options (for demo purposes)
  app.post('/api/admin/seed', async (req, res) => {
    try {
      const sampleOptions = [
        {
          type: 'flight' as const,
          source: 'New York',
          destination: 'Los Angeles',
          departureDate: new Date('2024-03-15T14:30:00Z'),
          departureTime: '2:30 PM',
          arrivalTime: '5:00 PM',
          duration: '5h 30m',
          price: '299.00',
          availableSeats: 150,
          airline: 'Delta Airlines',
          vehicleNumber: 'DL 1234',
        },
        {
          type: 'train' as const,
          source: 'New York',
          destination: 'Los Angeles',
          departureDate: new Date('2024-03-15T08:45:00Z'),
          departureTime: '8:45 AM',
          arrivalTime: '8:00 PM',
          duration: '8h 15m',
          price: '189.00',
          availableSeats: 200,
          trainOperator: 'Amtrak',
          vehicleNumber: 'AM 456',
        },
        {
          type: 'bus' as const,
          source: 'New York',
          destination: 'Los Angeles',
          departureDate: new Date('2024-03-15T23:30:00Z'),
          departureTime: '11:30 PM',
          arrivalTime: '3:15 PM',
          duration: '12h 45m',
          price: '89.00',
          availableSeats: 50,
          busOperator: 'Greyhound',
          vehicleNumber: 'GH 789',
        },
      ];

      for (const option of sampleOptions) {
        await storage.createTravelOption(option);
      }

      res.json({ message: "Sample data seeded successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
