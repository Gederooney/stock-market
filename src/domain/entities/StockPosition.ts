import { z } from 'zod';

export const StockPositionSchema = z.object({
  id: z.string().uuid(),
  portfolioId: z.string().uuid(),
  symbol: z.string().min(1).max(10),
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  purchaseDate: z.date(),
  targetPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type StockPosition = z.infer<typeof StockPositionSchema>;