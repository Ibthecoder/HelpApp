import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validate";
import { createReviewSchema, CreateReviewSchema } from "@/schemas/review.schema";
import { createReview } from "@/services/review.service";
import { Role } from "@prisma/client";
import { withCORS } from "@/middlewares/cors"; // Import withCORS

const handler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  validatedData: CreateReviewSchema
) => {
  if (req.method === "POST") {
    try {
      if (!req.user || req.user.role !== Role.CLIENT) {
        return res.status(403).json({ message: "Forbidden: Only clients can create reviews." });
      }

      const newReview = await createReview(req.user.id, validatedData);
      return res.status(201).json(newReview);
    } catch (error: unknown) {
      console.error("API Error creating review:", error);
      if (error instanceof Error && (error.message.includes("Booking not found") || error.message.includes("Review can only be submitted") || error.message.includes("Unauthorized") || error.message.includes("A review for this booking already exists"))) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create review." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default withCORS(withAuth(
  withValidation(createReviewSchema, handler),
  Role.CLIENT
)); // Wrap with withCORS
