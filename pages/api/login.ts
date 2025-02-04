import { NextApiRequest, NextApiResponse } from "next";
import { loginUser } from "@/services/auth.service";
import { generateToken } from "@/lib/jwt";
import { loginSchema, LoginSchema } from "@/schemas/auth.schema";
import { withValidation } from "@/middlewares/validate";
import { ZodError } from "zod"; // Import ZodError

//Handles the POST /api/login endpoint for user authenticatio:.:
//If successful, it generates and returns a JWT:.:
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  validatedData: LoginSchema
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Call the service to handle the login logic (finding user and comparing passwords)::.
    const user = await loginUser(validatedData); // Use validatedData

    // If authentication is successful, generate a JWT using the user's data::.
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return the JWT to the client. The client will store this for future authenticated requests::.
    return res.status(200).json({
      message: "Login successful.",
      token,
      // You can also return some basic user info for the client-side app::.
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    // Handle Zod validation errors for email or password
    if (error instanceof ZodError) {
      const emailOrPasswordIssue = error.issues.some(
        (issue) => issue.path[0] === "email" || issue.path[0] === "password"
      );
      if (emailOrPasswordIssue) {
        return res.status(401).json({ message: "Incorrect email or password." });
      }
      // For other validation errors (e.g., unexpected fields), return a generic bad request
      return res.status(400).json({ message: "Validation failed.", errors: error.errors });
    }

    // Handle authentication errors from the service layer::.
    if (error instanceof Error && error.message.includes("Invalid email or password")) {
      return res.status(401).json({ message: error.message });
    }

    // Catch all for other errors::.
    console.error("API Error during login:", error);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during login." });
  }
};

export default withValidation(loginSchema, handler);