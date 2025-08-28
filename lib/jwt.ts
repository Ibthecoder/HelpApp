import * as jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

// Define JWT payload structure
export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
  iat?: number; // Issued at timestamp (added by jwt.sign)
  exp?: number; // Expiration timestamp (added by jwt.sign)
}

// Helper function to get JWT secret safely
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    console.error("JWT_SECRET_KEY environment variable is missing!");
    throw new Error("JWT_SECRET_KEY is required for authentication");
  }
  return secret;
}

// JWT Configuration constants
const JWT_CONFIG = {
  expiresIn: "7d",
  algorithm: "HS256",
  issuer: "helpapp-api",
  audience: "helpapp-users",
} as const;

// This function creates a signed JWT token when users login
export function generateToken(user: {
  id: string;
  email: string;
  role: Role;
}): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  try {
    // Get the secret key
    const secret = getJWTSecret();
    
    // Create and sign the token without options first
    const token = jwt.sign(payload, secret);
    console.log("Token generated successfully");
    return token;
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw new Error("Failed to generate authentication token");
  }
}

// This function verifies and decodes a JWT token from requests
export function verifyToken(token: string): JwtPayload {
  try {
    // Remove 'Bearer ' prefix if present (common in Authorization headers)
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Get the secret key
    const secret = getJWTSecret();
    
    // Verify and decode the token
    const decoded = jwt.verify(cleanToken, secret);
    
    console.log(
      "Token verified successfully for the user:",
      `${(decoded as JwtPayload).email}`
    );
    return decoded as JwtPayload;
  } catch (error) {
    // Handle different types of JWT errors with specific messages
    if (error instanceof jwt.TokenExpiredError) {
      console.error("JWT token has expired:", error);
      throw new Error("Authentication token has expired. Please log in again.");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid JWT token:", error);
      throw new Error("Invalid authentication token. Please log in again.");
    }

    if (error instanceof jwt.NotBeforeError) {
      console.error("JWT token not active yet:", error);
      throw new Error(
        "Authentication token is not active yet. Please try again later."
      );
    }

    // Catch-all for other errors
    console.error("JWT verification failed:", error);
    throw new Error("Authentication failed");
  }
}

// Peek at token contents without full verification (useful for debugging)
// Don't use this for authentication! Always verify first!
export function decodeTokenUnsafe(token: string): JwtPayload | null {
  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Decode without verification (dangerous but useful for debugging)
    const decode = jwt.decode(cleanToken) as JwtPayload;

    if (!decode) {
      console.warn("Could not decode JWT token");
      return null;
    }

    return decode;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

// Check if Token is Expired (Utility Function)
// Useful for proactive token refresh strategies
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeTokenUnsafe(token);
    if (!decoded || !decoded.exp) {
      console.warn(
        "Cannot determine expiration of invalid or undecodable token"
      );
      return true; // Treat as expired if we can't decode it
    }

    // JWT exp is in seconds, Date.now() is in milliseconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTimestamp;

    if (isExpired) {
      console.log("Token is expired");
    }

    return isExpired;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Assume expired on error
  }
}

// Refresh Token Utility
// Generate a new token with extended expiration for existing valid token
export function refreshToken(currentToken: string): string {
  try {
    // First verify the current token is valid and not expired
    const payload = verifyToken(currentToken);

    // Create a new token with the same payload but new expiration
    const newToken = generateToken({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    });
    console.log(`Token refreshed for user: ${payload.email}`);

    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw new Error("Cannot refresh invalid token");
  }
}