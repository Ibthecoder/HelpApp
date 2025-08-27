import { NextApiRequest, NextApiResponse } from "next";
import {
  verifyToken,
  extractTokenFromHeader,
  JwtPayload,
} from "../../../lib/jwt";
// Import the Prisma client to find the user in the database::.
import prisma from "../../../lib/prisma";

//This is a protected route that requires a valid JWT in the Authorization header::
//It verifies the token, finds the user in the database, and returns their profile::.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests::.
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Get the Authorization header from the request::.
  const authHeader = req.headers.authorization;

  // Extract the token from the header::.
  const token = extractTokenFromHeader(authHeader || null);

  // If no token is provided, return a 401 Unauthorized error::.
  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing." });
  }

  try {
    // Verify the token. This will throw an error if the token is invalid or expired::.
    const payload = verifyToken(token) as JwtPayload;

    // Use the user ID from the token payload to find the user in the database::.
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
  } catch (error: any) {
    // Handle specific JWT verification errors::.
    console.error("Authentication Error:", error.message);
    // Return 401 Unauthorized for all JWT-related failures::.
    return res
      .status(401)
      .json({ message: error.message || "Authentication failed." });
  }
}
