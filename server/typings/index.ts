import { Role } from '@prisma/client';

/**
 * Interface representing the user object.
 */
export interface UserAuth {
  /**
   * The unique identifier for the user.
   */
  sub: string;

  /**
   * The email address of the user.
   */
  email: string;

  /**
   * The role of the user.
   */
  role: Role; // Adjust roles as necessary

  /**
   * The issued at timestamp.
   */
  iat: number;

  /**
   * The expiration timestamp.
   */
  exp: number;
}
