import { z } from 'zod';

export const StockSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string(),
  exchange: z.string(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  marketCap: z.number().optional(),
  peRatio: z.number().optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export type Stock = z.infer<typeof StockSchema>;

export class StockEntity {
  constructor(private readonly props: Stock) {}

  static create(props: Stock): StockEntity {
    return new StockEntity(props);
  }

  get symbol(): string {
    return this.props.symbol;
  }

  get name(): string {
    return this.props.name;
  }

  toJSON(): Stock {
    return this.props;
  }
}