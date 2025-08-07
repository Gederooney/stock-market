import { z } from 'zod';
import { StockPosition } from './StockPosition';

export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

export class PortfolioEntity {
  private positions: StockPosition[] = [];

  private constructor(private props: Portfolio) {}

  static create(props: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>): PortfolioEntity {
    const portfolio: Portfolio = {
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new PortfolioEntity(portfolio);
  }

  static fromPersistence(props: Portfolio): PortfolioEntity {
    return new PortfolioEntity(props);
  }

  addPosition(position: StockPosition): void {
    const existingIndex = this.positions.findIndex(p => p.symbol === position.symbol);
    if (existingIndex >= 0) {
      this.positions[existingIndex] = position;
    } else {
      this.positions.push(position);
    }
    this.props.updatedAt = new Date();
  }

  removePosition(symbol: string): void {
    this.positions = this.positions.filter(p => p.symbol !== symbol);
    this.props.updatedAt = new Date();
  }

  calculateTotalValue(currentPrices: Map<string, number>): number {
    return this.positions.reduce((total, position) => {
      const currentPrice = currentPrices.get(position.symbol) || position.averagePrice;
      return total + (position.quantity * currentPrice);
    }, 0);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  toJSON(): Portfolio & { positions: StockPosition[] } {
    return {
      ...this.props,
      positions: this.positions,
    };
  }
}