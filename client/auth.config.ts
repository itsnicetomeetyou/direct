import { NextAuthConfig } from 'next-auth';

// This file is used by the middleware (Edge Runtime).
// It must NOT import Prisma, bcryptjs, or any Node.js-only modules.
// The full auth config (with providers, adapter) is in auth.ts.

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub
      }
    }),
    authorized({ auth }) {
      return !!auth;
    }
  },
  providers: [],
  pages: {
    signIn: '/',
    error: '/'
  }
} satisfies NextAuthConfig;

export default authConfig;
