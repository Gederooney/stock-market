const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private context: string;

  constructor(context: string = 'app') {
    this.context = context;
  }

  private formatMessage(level: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any) {
    if (isDevelopment) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  error(message: string, meta?: any) {
    console.error(this.formatMessage('error', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  debug(message: string, meta?: any) {
    if (isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger('app');

export function createLogger(context: string) {
  return new Logger(context);
}