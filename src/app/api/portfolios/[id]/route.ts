import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PortfolioService } from '@/application/services/PortfolioService';
import { PortfolioRepository } from '@/infrastructure/repositories/PortfolioRepository';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const portfolioService = new PortfolioService(new PortfolioRepository());

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const withStats = searchParams.get('stats') === 'true';

    const portfolio = withStats
      ? await portfolioService.getPortfolioWithStats(params.id, session.user.id)
      : await portfolioService.getPortfolioById(params.id, session.user.id);
    
    return NextResponse.json(portfolio);
  } catch (error) {
    logger.error('Failed to fetch portfolio', { error, portfolioId: params.id });
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const portfolio = await portfolioService.updatePortfolio(
      params.id,
      session.user.id,
      data
    );
    
    return NextResponse.json(portfolio);
  } catch (error) {
    logger.error('Failed to update portfolio', { error, portfolioId: params.id });
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await portfolioService.deletePortfolio(params.id, session.user.id);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Failed to delete portfolio', { error, portfolioId: params.id });
    
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