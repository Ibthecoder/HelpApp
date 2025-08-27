import prisma from "@/lib/prisma";
import { CreateReviewSchema } from "@/schemas/review.schema";
import { BookingStatus, Role } from "@prisma/client";

export async function createReview(authorId: string, data: CreateReviewSchema) {
  // 1. Verify the booking exists and is completed
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { client: true, provider: true },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("Review can only be submitted for completed bookings.");
  }

  // 2. Verify the author is the client of the booking
  if (booking.clientId !== authorId) {
    throw new Error("Unauthorized: Only the client who made the booking can review it.");
  }

  // 3. Check if a review already exists for this booking
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new Error("A review for this booking already exists.");
  }

  // 4. Create the review
  const newReview = await prisma.review.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      bookingId: data.bookingId,
      authorId: authorId,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      booking: {
        include: {
          service: { select: { id: true, title: true } },
          provider: { select: { id: true, name: true } },
        },
      },
    },
  });

  return newReview;
}
