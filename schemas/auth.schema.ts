// Want to start to import Zod for schema validation and Prisma's Role enum for type safety:.:
import { z } from "zod";
import { Role } from "@prisma/client";

// Using Configuration and Constants::
// These constants can be used to easily update validation rules later:.:
const PASSWORD_MIN_LENGTH = 8;

//Zod schema for validating user signup requests::.
export const signupSchema = z.object({
  // start with a name field that is a non-empty string:
  name: z.string().trim().min(1, "Name cannot be empty"),
  //email: z.string().regex(/^[a-z]+$/i, { message: "Only letters allowed" }),
  email: z.string().trim().email({ message: "Invalid email address format" }),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
    ),
  role: z.enum([Role.CLIENT, Role.PROVIDER, Role.ADMIN]).default(Role.CLIENT),
});

// Zod schema for validating user login requests.
export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address format" }),

  password: z.string().min(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  }),
});

// Zod schema for validating a token refresh request::
export const refreshTokenSchema = z.object({
  // 'token' must be a non-empty string.
  refreshToken: z.string().min(1, "Refresh token is required"),
});

//Type Inference
// Zod can infer the TypeScript types directly from the schemas::.
// This provides type safety across the entire application, from validation to database operations::.
export type SignupSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;
