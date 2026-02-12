import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/server/prisma';

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
    })
  },
  providers: [
    CredentialProvider({
      type: 'credentials',
      credentials: {
        email: {
          type: 'email'
        },
        password: {
          type: 'password'
        }
      },
      async authorize(credentials, req) {
        try {
          const userData = await prisma.users.findFirst({
            where: {
              email: credentials.email ?? '',
              role: 'ADMIN'
            }
          });
          if (!userData) return null;

          const checkPasswordCorrect = await compare(credentials.password as string, userData.password);
          if (checkPasswordCorrect) {
            return {
              id: userData.id,
              email: userData.email
            };
          } else {
            return null;
          }
        } catch (err) {
          return null;
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/',
    error: '/'
  }
} satisfies NextAuthConfig;

export default authConfig;
