import { NextApiRequest, NextApiResponse } from "next";
import { signupSchema, SignupSchema } from "@/schemas/auth.schema";
import { signupUser } from "@/services/auth.service";
import { withValidation } from "@/middlewares/validate";
import { generateToken } from "@/lib/jwt";
import { withCORS } from "@/middlewares/cors"; // Import withCORS

// Handles the POST /api/signup endpoint for user registration.
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  validatedData: SignupSchema
) => {
  // We only accept POST requests for this endpoint::
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // i need to call the service function to handle the business logic of creating the user:.:
    const newUser = await signupUser(validatedData);

    // Generate a token for the new user
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // if the user enter correct details show this ::
    return res.status(201).json({
      message: "Signup successful.",
      token,
      user: newUser,
    });
  } catch (error: unknown) {
    // i need  Handle a specific error from our service layer e.g., email already exists:.:
    if (
      error instanceof Error &&
      error.message.includes("email address is already in use")
    ) {
      return res.status(409).json({ message: error.message });
    }

    console.error("API Error during signup:", error);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during signup." });
  }
};

export default withCORS(withValidation(signupSchema, handler)); // Wrap with withCORS