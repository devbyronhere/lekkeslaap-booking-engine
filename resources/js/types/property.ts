import { z } from 'zod';

export const unitSchema = z.object({
  id: z.number(),
  name: z.string(),
  max_guests: z.number().int().positive(),
  pricing_model: z.enum(['per_unit', 'per_person']),
  price: z.number().positive(),
  available_count: z.number().int().nonnegative(),
  pictures: z.array(z.string()),
});

export const propertySchema = z.object({
  id: z.number(),
  name: z.string(),
  currency: z.string(),
  tax_rate: z.number(),
  pictures: z.array(z.string()),
});

export const propertyDataSchema = z.object({
  property: propertySchema,
  units: z.array(unitSchema),
});

export type Unit = z.infer<typeof unitSchema>;
export type Property = z.infer<typeof propertySchema>;
export type PropertyData = z.infer<typeof propertyDataSchema>;
