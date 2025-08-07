import { PortfolioRepository } from '@/infrastructure/repositories/PortfolioRepository';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const UpdatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export class PortfolioService {
  constructor(private portfolioRepository: PortfolioRepository) {}

  async createPortfolio(userId: string, data: z.infer<typeof CreatePortfolioSchema>) {
    try {
      const validated = CreatePortfolioSchema.parse(data);
      
      const portfolio = await this.portfolioRepository.create({
        userId,
        ...validated,
      });

      logger.info('Portfolio created', { portfolioId: portfolio.id, userId });
      return portfolio;
    } catch (error) {
      logger.error('Failed to create portfolio', { error, userId });
      if (error instanceof z.ZodError) {
        throw new AppError('Validation failed', 400, error.flatten());
      }
      throw error;
    }
  }

  async getUserPortfolios(userId: string) {
    try {
      const portfolios = await this.portfolioRepository.findByUserId(userId);
      return portfolios;
    } catch (error) {
      logger.error('Failed to fetch portfolios', { error, userId });
      throw new AppError('Failed to fetch portfolios', 500);
    }
  }

  async getPortfolioById(portfolioId: string, userId: string) {
    try {
      const portfolio = await this.portfolioRepository.findById(portfolioId, userId);
      
      if (!portfolio) {
        throw new AppError('Portfolio not found', 404);
      }

      return portfolio;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch portfolio', { error, portfolioId, userId });
      throw new AppError('Failed to fetch portfolio', 500);
    }
  }

  async getPortfolioWithStats(portfolioId: string, userId: string) {
    try {
      const portfolio = await this.portfolioRepository.getPortfolioWithStats(portfolioId, userId);
      
      if (!portfolio) {
        throw new AppError('Portfolio not found', 404);
      }

      return portfolio;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch portfolio with stats', { error, portfolioId, userId });
      throw new AppError('Failed to fetch portfolio with stats', 500);
    }
  }

  async updatePortfolio(
    portfolioId: string,
    userId: string,
    data: z.infer<typeof UpdatePortfolioSchema>
  ) {
    try {
      const validated = UpdatePortfolioSchema.parse(data);
      
      const portfolio = await this.portfolioRepository.update(
        portfolioId,
        userId,
        validated
      );

      logger.info('Portfolio updated', { portfolioId, userId });
      return portfolio;
    } catch (error) {
      logger.error('Failed to update portfolio', { error, portfolioId, userId });
      if (error instanceof z.ZodError) {
        throw new AppError('Validation failed', 400, error.flatten());
      }
      throw new AppError('Failed to update portfolio', 500);
    }
  }

  async deletePortfolio(portfolioId: string, userId: string) {
    try {
      await this.portfolioRepository.delete(portfolioId, userId);
      logger.info('Portfolio deleted', { portfolioId, userId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete portfolio', { error, portfolioId, userId });
      throw new AppError('Failed to delete portfolio', 500);
    }
  }
}