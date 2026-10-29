import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** Gắn bởi middleware `authenticate` */
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
