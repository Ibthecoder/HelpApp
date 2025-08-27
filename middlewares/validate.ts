
import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

// Define the type for a handler that takes a validated body::
export type ValidatedRequestHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  body: T
) => Promise<void>;

// Higher-order function to validate the request body against a Zod schema::
export const withValidation = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  handler: ValidatedRequestHandler<z.infer<z.ZodObject<T>>>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const validatedBody = schema.parse(req.body);
      return handler(req, res, validatedBody);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.format(),
        });
      }
      // For any other errors, return a generic 500 status::
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
