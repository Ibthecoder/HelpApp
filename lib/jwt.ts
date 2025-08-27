import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
// i Define my JWT payload structure:.:
export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
  iat?: number; // Issued at timestamp (added by jwt.sign):
  exp?: number; // Expiration timestamp (added by jwt.sign):
}

//  JWT Configuration constants:
const JWT_CONFIG = {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Default to 15 minutes if not set:.:

  // Secret key for signing tokens (MUST be in environment variables):.:
  secret:
    process.env.JWT_SECRET_KEY ||
    (() => {
      console.error(" JWT_SECRET environment variable is missing!");
      throw new Error("JWT_SECRET is required for authentication");
    })(),

  // Algorithm used for signing (HS256 is industry standard for symmetric keys)
  algorithm: "HS256" as const,

  // Token issuer::
  issuer: "helpapp-api",

  // Token audience (who can use this token):.:
  audience: "helpapp-users",
};

//This function creates a signed JWT token when users login
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
    // i Create and sign the token::
    const token = jwt.sign(payload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.expiresIn,
      audience: JWT_CONFIG.audience,
      issuer: JWT_CONFIG.issuer,
      algorithm: JWT_CONFIG.algorithm,
    });
    console.log(" Token generated successfully");
    return token;
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw new Error("Failed to generate authentication token");
  }
}

// This function verifies and decodes a JWT token from requests:
export function verifyToken(token: string): JwtPayload {
  try {
    // Remove 'Bearer ' prefix if present (common in Authorization headers):.:
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Verify and decode the token:.:
    const decoded = jwt.verify(cleanToken, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm], // Only accept our algorithm::
      issuer: JWT_CONFIG.issuer, // Must be from our app
      audience: JWT_CONFIG.audience, // Must be for our users
    }) as JwtPayload;
    console.log(
      "Token verified successfully for the user:",
      `${decoded.email}`
    );
    return decoded;
  } catch (error) {
    // Handle different types of JWT errors with specific messages:.:
    if (error instanceof jwt.TokenExpiredError) {
      console.error(" JWT token has expired:", error);
      throw new Error("Authentication token has expired. Please log in again.");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error(" Invalid JWT token:", error);
      throw new Error("Invalid authentication token. Please log in again.");
    }

    if (error instanceof jwt.NotBeforeError) {
      console.error(" JWT token not active yet:", error);
      throw new Error(
        "Authentication token is not active yet. Please try again later."
      );
    }

    // Catch-all for other errors:.:
    console.error(" JWT verification failed:", error);
    throw new Error("Authentication failed");
  }
}

// i want to  peek at token contents without full verification (useful for debugging):
// don't  want to use this for authentication! Always verify first!
export function decodeTokenUnsafe(token: string): JwtPayload | null {
  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // i want Decode without verification but i know is  (dangerous but useful for debugging)::
    const decode = jwt.decode(cleanToken) as JwtPayload;

    if (!decode) {
      console.warn(" Could not decode JWT token");
      return null;
    }

    return decode;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

//i want to Check if Token is Expired (Utility Function)
// useful for proactive token refresh strategies:
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeTokenUnsafe(token);
    if (!decoded || !decoded.exp) {
      console.warn(
        " Cannot determine expiration of invalid or undecodable token"
      );
      return true; // Treat as expired if we can't decode it:
    }

    // JWT exp is in seconds, Date.now() is in milliseconds:.
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTimestamp;

    if (isExpired) {
      console.log("Token is expired");
    }

    return isExpired;
  } catch (error) {
    console.error(" Error checking token expiration:", error);
    return true; // Assume expired on error::
  }
}



// i want to Refresh Token Utility:.:
// Generate a new token with extended expiration for existing valid token:.:
export function refreshToken(currentToken: string): string {
  try {
    // First verify the current token is valid and not expired:.:::
    const payload = verifyToken(currentToken);

    // create a new token with the same payload but new expiration:.:
    const newToken = generateToken({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    });
    console.log(`Token refreshed for user: ${payload.email}`);

    return newToken;
  } catch (error) {
    console.error(" Token refresh failed:", error);
    throw new Error("Cannot refresh invalid token");
  }
}

/*
 *  WHAT THIS CODE ACCOMPLISHES:
 *
 * --Secure JWT token generation with proper configuration
 * -- Comprehensive token verification with detailed error handling
 * -- Multiple utility functions for common JWT operations
 * -- Type safety with TypeScript interfaces
 * -- Production-ready error handling and logging
 * -- Flexible token extraction from different header formats
 * -- Token refresh capability for better UX
 *
 * => USAGE EXAMPLES IN YOUR API ROUTES:
 *
 * // Login endpoint
 * const token = generateToken({ id: user.id, email: user.email, role: user.role })
 *
 * // Protected endpoint
 * --const authHeader = request.headers.get('authorization')
 
 * --const payload = verifyToken(token)
 *
 * // Check expiration
 * if (isTokenExpired(token)) {
 *   const newToken = refreshToken(token)
 * }
 *
 *  FEATURES:
 * - Environment-based configuration
 * - Comprehensive error handling
 * - Type safety throughout
 * - Utility functions for common operations
 * - Security best practices (algorithm specification, issuer/audience)
 * - Detailed logging for debugging and monitoring
 */
