import { z } from "zod";

export const createServiceTypeSchema = z.object({
  name: z.string().min(1, "Service type name cannot be empty").trim(),
  description: z.string().optional(),
});

export type CreateServiceTypeSchema = z.infer<typeof createServiceTypeSchema>;
