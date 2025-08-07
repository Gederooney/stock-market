import { PrismaClient } from '@prisma/client';
import { PortfolioEntity } from '@/domain/entities/Portfolio';

export class PortfolioRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<PortfolioEntity | null> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
    });

    if (!portfolio) return null;

    return PortfolioEntity.fromPersistence({
      id: portfolio.id,
      userId: portfolio.userId,
      name: portfolio.name,
      currency: portfolio.currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<PortfolioEntity[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId },
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
    });

    return portfolios.map(portfolio =>
      PortfolioEntity.fromPersistence({
        id: portfolio.id,
        userId: portfolio.userId,
        name: portfolio.name,
        currency: portfolio.currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      })
    );
  }

  async save(portfolio: PortfolioEntity): Promise<void> {
    const data = portfolio.toJSON();
    
    await this.prisma.portfolio.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        currency: data.currency,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        userId: data.userId,
        name: data.name,
        currency: data.currency,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.portfolio.delete({
      where: { id },
    });
  }
}