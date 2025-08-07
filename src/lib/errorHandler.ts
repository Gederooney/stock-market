import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { toast } from 'sonner';
import { logger, errorLogger } from './logger';
import { AppError, isAppError, isOperationalError } from './errors';

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
  };
  requestId?: string;
}

export function handleError(error: unknown, requestId?: string): ErrorResponse {
  // Log the error
  errorLogger.error({
    error,
    requestId,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: error.flatten(),
      },
      requestId,
    };
  }

  // Handle custom app errors
  if (isAppError(error)) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.context,
      },
      requestId,
    };
  }

  // Handle Prisma errors
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return {
          error: {
            message: 'A unique constraint violation occurred',
            code: 'DUPLICATE_ERROR',
            statusCode: 409,
            details: { field: prismaError.meta?.target },
          },
          requestId,
        };
      case 'P2025':
        return {
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          },
          requestId,
        };
      default:
        return {
          error: {
            message: 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500,
          },
          requestId,
        };
    }
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  return {
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
    requestId,
  };
}

export function createErrorResponse(error: unknown, requestId?: string): NextResponse {
  const errorResponse = handleError(error, requestId);
  
  return NextResponse.json(errorResponse, {
    status: errorResponse.error.statusCode,
    headers: {
      'X-Request-Id': requestId || crypto.randomUUID(),
    },
  });
}

// Client-side error handler
export function handleClientError(error: unknown) {
  console.error('Client error:', error);
  
  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }
  
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  
  toast.error('An unexpected error occurred');
}

// Async error wrapper for API routes
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = crypto.randomUUID();
    
    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      return createErrorResponse(error, requestId);
    }
  }) as T;
}

// React Error Boundary error handler
export function logErrorToService(error: Error, errorInfo: { componentStack: string }) {
  errorLogger.error({
    error: {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    },
    type: 'React Error Boundary',
  });
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
}