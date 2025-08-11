import { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validate";
import { createBookingSchema, CreateBookingSchema } from "@/schemas/booking.schema";
import { createBooking, getBookingsForUser } from "@/services/booking.service";
import { Role } from "@prisma/client";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // This part is handled by withValidation and withAuth
    return res.status(405).json({ message: "Method Not Allowed" });
  } else if (req.method === "GET") {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required." });
      }
      const bookings = await getBookingsForUser(req.user.id);
      return res.status(200).json(bookings);
    } catch (error: unknown) { // Change to unknown
      console.error("API Error fetching bookings:", error);
      return res.status(500).json({ message: "Failed to fetch bookings." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

const createBookingHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  validatedData: CreateBookingSchema // Use the specific type
) => {
  try {
    if (!req.user || req.user.role !== Role.CLIENT) {
      return res.status(403).json({ message: "Forbidden: Only clients can create bookings." });
    }
    const newBooking = await createBooking(req.user.id, validatedData);
    return res.status(201).json(newBooking);
  } catch (error: unknown) { // Change to unknown
    console.error("API Error creating booking:", error);
    if (error instanceof Error && (error.message.includes("Provider not found") || error.message.includes("Service not found") || error.message.includes("Service does not belong"))) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create booking." });
  }
};

// Change to a named function for default export
function bookingsApiHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const authenticatedAndValidatedHandler = withAuth(
      withValidation(createBookingSchema, createBookingHandler),
      Role.CLIENT
    );
    return authenticatedAndValidatedHandler(req, res);
  } else if (req.method === "GET") {
    const authenticatedHandler = withAuth(handler);
    return authenticatedHandler(req, res);
  } else {
    return handler(req, res);
  }
}

export default bookingsApiHandler; // Export the named function