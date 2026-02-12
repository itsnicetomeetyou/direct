import NextAuth from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/server/prisma';
import authConfig from './auth.config';

export const { auth, handlers, signOut, signIn } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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

          const checkPasswordCorrect = await compare(
            credentials.password as string,
            userData.password
          );
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
  ]
});
