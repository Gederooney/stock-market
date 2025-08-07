import { env } from './env';

export function checkEnvironment() {
  const errors = env.getValidationErrors();
  
  if (errors && process.env.NODE_ENV === 'production') {
    console.error('⚠️  Environment validation failed!');
    console.error('Please check your environment variables.');
    console.error('Errors:', errors.flatten());
    process.exit(1);
  }
  
  if (errors && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Environment validation warnings:');
    errors.issues.forEach((err: any) => {
      console.warn(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.warn('\nSome features may not work correctly.');
  }
  
  if (!errors) {
    console.log('✅ Environment variables validated successfully');
  }
}

// Run check on module load
if (typeof window === 'undefined') {
  checkEnvironment();
}