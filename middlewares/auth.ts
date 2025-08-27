
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/jwt";
import { Role } from "@prisma/client";

// Define a custom interface to extend NextApiRequest with the user property::
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: Role;
  };
}

// Define the type for the handler function that uses the authenticated request::
export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void>;

// Higher-order function to protect API routes with JWT authentication::
export const withAuth = (
  handler: AuthenticatedHandler,
  requiredRole?: Role
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    try {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };

      // If a specific role is required, check if the user has it::
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
      }

      return handler(req, res);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
