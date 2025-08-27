import { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validate";
import { updateBookingStatusSchema } from "@/schemas/booking.schema";
import { updateBookingStatus } from "@/services/booking.service";
import { Role } from "@prisma/client";

const handler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  validatedData: any // Type inferred by withValidation
) => {
  if (req.method === "PATCH") {
    try {
      if (!req.user || req.user.role !== Role.PROVIDER) {
        return res.status(403).json({ message: "Forbidden: Only providers can update booking status." });
      }

      const { id } = req.query; // Get booking ID from dynamic route
      if (typeof id !== "string") {
        return res.status(400).json({ message: "Invalid booking ID." });
      }

      const updatedBooking = await updateBookingStatus(
        id,
        validatedData.status,
        req.user.id // Pass provider ID for authorization check within service
      );
      return res.status(200).json(updatedBooking);
    } catch (error: any) {
      console.error("API Error updating booking status:", error);
      if (error.message.includes("Booking not found") || error.message.includes("Unauthorized") || error.message.includes("Invalid status transition")) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to update booking status." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default withAuth(
  withValidation(updateBookingStatusSchema, handler),
  Role.PROVIDER
);