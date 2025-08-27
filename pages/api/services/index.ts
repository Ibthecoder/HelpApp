import { NextApiRequest, NextApiResponse } from "next";
import { getAllServices, createServiceType } from "@/services/service.service";
import { withAuth } from "@/middlewares/auth";
import { withValidation } from "@/middlewares/validate";
import { createServiceTypeSchema } from "@/schemas/service.schema";
import { Role } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const services = await getAllServices();
      return res.status(200).json(services);
    } catch (error) {
      console.error("API Error fetching services:", error);
      return res.status(500).json({ message: "Failed to fetch services." });
    }
  } else if (req.method === "POST") {
    // This part will be handled by the withAuth and withValidation middleware
    // The actual logic for creating a service type will be in a separate handler
    return res.status(405).json({ message: "Method Not Allowed" });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

// Separate handler for POST request with validation and authentication
const createServiceTypeHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  validatedData: any // Type will be inferred by withValidation
) => {
  try {
    const newServiceType = await createServiceType(validatedData);
    return res.status(201).json(newServiceType);
  } catch (error: any) {
    if (error.message.includes("Service type with name")) {
      return res.status(409).json({ message: error.message });
    }
    console.error("API Error creating service type:", error);
    return res.status(500).json({ message: "Failed to create service type." });
  }
};

// Apply middleware conditionally
export default function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Apply withAuth (Admin only) and withValidation for POST requests
    const authenticatedAndValidatedHandler = withAuth(
      withValidation(createServiceTypeSchema, createServiceTypeHandler),
      Role.ADMIN
    );
    return authenticatedAndValidatedHandler(req, res);
  } else {
    // For GET requests, just use the base handler
    return handler(req, res);
  }
}