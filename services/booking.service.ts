import prisma from "@/lib/prisma";
import { CreateBookingSchema } from "@/schemas/booking.schema";
import { BookingStatus, Role } from "@prisma/client";

export async function createBooking(
  clientId: string,
  data: CreateBookingSchema
) {
  // Verify that the provider exists and is actually a provider
  const provider = await prisma.user.findUnique({
    where: { id: data.providerId, role: Role.PROVIDER },
  });

  if (!provider) {
    throw new Error("Provider not found or is not a service provider.");
  }

  // Verify that the service exists
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    throw new Error("Service not found.");
  }

  // Ensure the service belongs to the provider
  if (service.providerId !== data.providerId) {
    throw new Error("Service does not belong to the specified provider.");
  }

  const newBooking = await prisma.booking.create({
    data: {
      clientId,
      providerId: data.providerId,
      serviceId: data.serviceId,
      status: BookingStatus.PENDING, // Default status
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, title: true, description: true } },
    },
  });
  return newBooking;
}

export async function getBookingsForUser(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ clientId: userId }, { providerId: userId }],
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, title: true, description: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return bookings;
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  providerId: string // To ensure only the assigned provider can update
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Ensure only the assigned provider can update the status
  if (booking.providerId !== providerId) {
    throw new Error("Unauthorized: You are not the provider for this booking.");
  }

  // Prevent status changes from COMPLETED or REJECTED
  if (
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.REJECTED
  ) {
    throw new Error("Cannot change status of a completed or rejected booking.");
  }

  // Specific status transition rules (optional, but good practice)
  if (
    booking.status === BookingStatus.PENDING &&
    !(newStatus === BookingStatus.ACCEPTED || newStatus === BookingStatus.REJECTED)
  ) {
    throw new Error("Invalid status transition from PENDING.");
  }

  if (
    booking.status === BookingStatus.ACCEPTED &&
    newStatus !== BookingStatus.COMPLETED
  ) {
    throw new Error("Invalid status transition from ACCEPTED.");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
    include: {
      client: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, title: true, description: true } },
    },
  });
  return updatedBooking;
}
