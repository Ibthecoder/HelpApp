import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/middlewares/auth";
import prisma from "@/lib/prisma";
import { withCORS } from "@/middlewares/cors"; // Import withCORS

//This is a protected route that requires a valid JWT in the Authorization header::
//It verifies the token, finds the user in the database, and returns their profile::.
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Only allow GET requests::.
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication token missing" });
    }
    // Use the user ID from the token payload to find the user in the database::.
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      // Select the fields you want to return::.
      // Not returning the  password field here::.
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // If the user is not found, something is wrong with the token's payload::.
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the user's profile::.
    return res.status(200).json(user);
  } catch (error: unknown) {
    // Handle specific JWT verification errors::.
    const message = error instanceof Error ? error.message : "Authentication failed.";
    console.error("Authentication Error:", message);
    // Return 401 Unauthorized for all JWT-related failures::.
    return res
      .status(401)
      .json({ message });
  }
};

export default withCORS(withAuth(handler)); // Wrap with withCORS