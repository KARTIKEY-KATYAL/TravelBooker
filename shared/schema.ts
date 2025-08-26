import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Travel type enum
export const travelTypeEnum = pgEnum('travel_type', ['flight', 'train', 'bus']);

// Booking status enum
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'cancelled']);

// Travel options table
export const travelOptions = pgTable("travel_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: travelTypeEnum("type").notNull(),
  source: varchar("source").notNull(),
  destination: varchar("destination").notNull(),
  departureDate: timestamp("departure_date").notNull(),
  departureTime: varchar("departure_time").notNull(),
  arrivalTime: varchar("arrival_time").notNull(),
  duration: varchar("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer("available_seats").notNull(),
  airline: varchar("airline"), // For flights
  trainOperator: varchar("train_operator"), // For trains
  busOperator: varchar("bus_operator"), // For buses
  vehicleNumber: varchar("vehicle_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  travelOptionId: varchar("travel_option_id").notNull().references(() => travelOptions.id),
  numberOfSeats: integer("number_of_seats").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").notNull().default('confirmed'),
  seatNumbers: text("seat_numbers"), // JSON string of selected seat numbers
  passengerDetails: jsonb("passenger_details").notNull(),
  bookingDate: timestamp("booking_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const travelOptionsRelations = relations(travelOptions, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  travelOption: one(travelOptions, {
    fields: [bookings.travelOptionId],
    references: [travelOptions.id],
  }),
}));

// Zod schemas
export const insertTravelOptionSchema = createInsertSchema(travelOptions).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingDate: true,
  createdAt: true,
});

export const searchSchema = z.object({
  type: z.enum(['flight', 'train', 'bus']).optional(),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  passengers: z.number().min(1).max(10).default(1),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TravelOption = typeof travelOptions.$inferSelect;
export type InsertTravelOption = z.infer<typeof insertTravelOptionSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
