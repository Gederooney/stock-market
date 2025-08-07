import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withErrorHandler } from '@/lib/errorHandler';
import { ConflictError, ValidationError } from '@/lib/errors';
import { authLogger } from '@/lib/logger';
import { withLogging } from '@/lib/apiMiddleware';

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  return withLogging(request, async () => {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    authLogger.info({ 
      action: 'signup_attempt', 
      email: validatedData.email 
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      authLogger.warn({ 
        action: 'signup_failed', 
        reason: 'user_exists',
        email: validatedData.email 
      });
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    const { password, ...userWithoutPassword } = user;

    authLogger.info({ 
      action: 'signup_success', 
      userId: user.id,
      email: user.email 
    });

    return NextResponse.json(userWithoutPassword);
  });
});