import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
