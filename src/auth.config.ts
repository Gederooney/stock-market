import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnPortfolio = nextUrl.pathname.startsWith('/portfolios');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');
      
      if (isOnDashboard || isOnPortfolio) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;