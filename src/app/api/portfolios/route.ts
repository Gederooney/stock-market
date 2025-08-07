import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PortfolioService } from '@/application/services/PortfolioService';
import { PortfolioRepository } from '@/infrastructure/repositories/PortfolioRepository';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const portfolioService = new PortfolioService(new PortfolioRepository());

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const portfolios = await portfolioService.getUserPortfolios(session.user.id);
    
    return NextResponse.json(portfolios);
  } catch (error) {
    logger.error('Failed to fetch portfolios', { error });
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const portfolio = await portfolioService.createPortfolio(session.user.id, data);
    
    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    logger.error('Failed to create portfolio', { error });
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}