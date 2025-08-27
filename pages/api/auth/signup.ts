import { NextApiRequest, NextApiResponse } from "next";
import { signupSchema } from "../../../schemas/auth.schema";
import { signupUser } from "../../../services/auth.service";

// Handles the POST /api/signup endpoint for user registration.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // We only accept POST requests for this endpoint::
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // thow error if if the data is invalid:
    const validatedData = signupSchema.parse(req.body);

    // i need to call the service function to handle the business logic of creating the user:.:
    const newUser = await signupUser(validatedData);

    // if the user enter correct details show this ::
    return res.status(201).json(newUser);
  } catch (error: any) {
    // now incase if zod validation fails::
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    // i need  Handle a specific error from our service layer e.g., email already exists:.:
    if (error.message.include("email address is already in use")) {
      return res.status(409).json({ message: error.message });
    }

    console.error("API Error during signup:", error);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during signup." });
  }
}
