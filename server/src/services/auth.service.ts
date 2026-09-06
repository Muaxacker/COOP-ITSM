import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      branch: { select: { id: true, name: true, code: true, location: true } },
      division: { select: { id: true, name: true, code: true } },
    },
  });

  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Your account is deactivated. Please contact an administrator.', 403);

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new AppError('Invalid email or password', 401);

  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    branchId: user.branchId,
    divisionId: user.divisionId,
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
      phone: true,
      isActive: true,
      createdAt: true,
      branch: { select: { id: true, name: true, code: true, location: true } },
      division: { select: { id: true, name: true, code: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);
  return user;
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string }) {
  const updateData: any = {};
  if (data.name?.trim()) updateData.name = data.name.trim();
  if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      branch: { select: { id: true, name: true, code: true, location: true } },
      division: { select: { id: true, name: true, code: true } },
    },
  });

  return user;
}

export async function changePassword(userId: string, currentPass: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const match = await bcrypt.compare(currentPass, user.passwordHash);
  if (!match) throw new AppError('Current password is incorrect', 400);

  if (newPass.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const newHash = await bcrypt.hash(newPass, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { message: 'Password changed successfully' };
}
