import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  serializers: {
    error: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.socket?.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.email'],
    censor: '[REDACTED]',
  },
});

// Specialized loggers
export const authLogger = logger.child({ module: 'auth' });
export const dbLogger = logger.child({ module: 'database' });
export const apiLogger = logger.child({ module: 'api' });
export const errorLogger = logger.child({ module: 'error' });

// Log uncaught exceptions and unhandled rejections
if (typeof window === 'undefined') {
  process.on('uncaughtException', (err) => {
    errorLogger.fatal(err, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    errorLogger.error({ reason, promise }, 'Unhandled rejection');
  });
}

// Helper functions
export function logRequest(req: any, res: any, duration: number) {
  const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
  
  apiLogger[level]({
    req,
    res,
    duration,
    msg: `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  errorLogger.error({
    ...context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  });
}