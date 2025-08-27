import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const createBookingSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus, {
    errorMap: () => ({ message: "Invalid booking status" }),
  }),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusSchema = z.infer<typeof updateBookingStatusSchema>;
