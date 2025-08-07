import { prisma } from '@/lib/prisma';
import { PortfolioEntity } from '@/domain/entities/Portfolio';
import { Prisma } from '@prisma/client';

export class PortfolioRepository {
  async create(data: {
    userId: string;
    name: string;
    description?: string;
  }) {
    return await prisma.portfolio.create({
      data,
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    return await prisma.portfolio.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return await prisma.portfolio.findMany({
      where: {
        userId,
      },
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    return await prisma.portfolio.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.portfolio.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async getPortfolioWithStats(id: string, userId: string) {
    const portfolio = await this.findById(id, userId);
    if (!portfolio) return null;

    const totalValue = portfolio.positions.reduce((sum, position) => {
      return sum + position.quantity * position.averagePrice;
    }, 0);

    const totalCost = portfolio.positions.reduce((sum, position) => {
      return sum + position.quantity * position.averagePrice;
    }, 0);

    return {
      ...portfolio,
      stats: {
        totalValue,
        totalCost,
        totalPositions: portfolio.positions.length,
        profitLoss: totalValue - totalCost,
        profitLossPercentage: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      },
    };
  }
}