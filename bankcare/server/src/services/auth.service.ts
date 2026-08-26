import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { department: { select: { id: true, name: true } } },
  });

  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Your account is deactivated. Please contact an administrator.', 403);

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new AppError('Invalid email or password', 401);

  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userSafe } = user;

  return { token, user: userSafe };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);
  return user;
}
