import {
  users,
  travelOptions,
  bookings,
  type User,
  type UpsertUser,
  type TravelOption,
  type InsertTravelOption,
  type Booking,
  type InsertBooking,
  type SearchParams,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Travel options operations
  searchTravelOptions(params: SearchParams): Promise<TravelOption[]>;
  getTravelOption(id: string): Promise<TravelOption | undefined>;
  createTravelOption(travelOption: InsertTravelOption): Promise<TravelOption>;
  updateTravelOptionSeats(id: string, seatsBooked: number): Promise<void>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<(Booking & { travelOption: TravelOption })[]>;
  getBooking(id: string): Promise<(Booking & { travelOption: TravelOption }) | undefined>;
  cancelBooking(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Travel options operations
  async searchTravelOptions(params: SearchParams): Promise<TravelOption[]> {
    let query = db.select().from(travelOptions);
    
    const conditions = [
      gte(travelOptions.availableSeats, params.passengers),
      eq(travelOptions.source, params.source),
      eq(travelOptions.destination, params.destination),
      sql`DATE(${travelOptions.departureDate}) = ${params.departureDate}`,
    ];

    if (params.type) {
      conditions.push(eq(travelOptions.type, params.type));
    }

    const results = await query
      .where(and(...conditions))
      .orderBy(travelOptions.price);

    return results;
  }

  async getTravelOption(id: string): Promise<TravelOption | undefined> {
    const [option] = await db
      .select()
      .from(travelOptions)
      .where(eq(travelOptions.id, id));
    return option;
  }

  async createTravelOption(travelOption: InsertTravelOption): Promise<TravelOption> {
    const [option] = await db
      .insert(travelOptions)
      .values(travelOption)
      .returning();
    return option;
  }

  async updateTravelOptionSeats(id: string, seatsBooked: number): Promise<void> {
    await db
      .update(travelOptions)
      .set({
        availableSeats: sql`${travelOptions.availableSeats} - ${seatsBooked}`,
      })
      .where(eq(travelOptions.id, id));
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<(Booking & { travelOption: TravelOption })[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(travelOptions, eq(bookings.travelOptionId, travelOptions.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    return results.map(result => ({
      ...result.bookings,
      travelOption: result.travel_options,
    }));
  }

  async getBooking(id: string): Promise<(Booking & { travelOption: TravelOption }) | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .innerJoin(travelOptions, eq(bookings.travelOptionId, travelOptions.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result.bookings,
      travelOption: result.travel_options,
    };
  }

  async cancelBooking(id: string, userId: string): Promise<void> {
    // First get the booking to restore seats
    const booking = await this.getBooking(id);
    if (!booking || booking.userId !== userId) {
      throw new Error("Booking not found or unauthorized");
    }

    // Cancel the booking
    await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(and(eq(bookings.id, id), eq(bookings.userId, userId)));

    // Restore available seats
    await db
      .update(travelOptions)
      .set({
        availableSeats: sql`${travelOptions.availableSeats} + ${booking.numberOfSeats}`,
      })
      .where(eq(travelOptions.id, booking.travelOptionId));
  }
}

export const storage = new DatabaseStorage();
