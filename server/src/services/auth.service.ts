import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

import {
  generateTwoFactorSetup,
  verifyTwoFactorToken,
} from './twoFactor.service';

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

  // If Two-Factor Authentication is enabled, issue a temporary verification token
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const tempToken = jwt.sign(
      { userId: user.id, is2faPending: true },
      config.jwtSecret,
      { expiresIn: '5m' }
    );
    return {
      require2FA: true,
      tempToken,
      message: 'Two-factor authentication code required',
    };
  }

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
  const { passwordHash: _, twoFactorSecret: __, ...userSafe } = user;

  return { token, user: userSafe };
}

export async function verifyTwoFactorLogin(tempToken: string, code: string) {
  try {
    const decoded = jwt.verify(tempToken, config.jwtSecret) as { userId: string; is2faPending?: boolean };
    if (!decoded.is2faPending || !decoded.userId) {
      throw new AppError('Invalid two-factor session token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        branch: { select: { id: true, name: true, code: true, location: true } },
        division: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      throw new AppError('Two-factor authentication is not configured for this account', 400);
    }

    const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);
    if (!isValid) {
      throw new AppError('Invalid 6-digit authentication code. Please check your authenticator app.', 400);
    }

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
    const { passwordHash: _, twoFactorSecret: __, ...userSafe } = user;

    return { token, user: userSafe };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or expired two-factor verification session', 401);
  }
}

export async function setupTwoFactor(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const setup = await generateTwoFactorSetup(user.email);
  return setup;
}

export async function enableTwoFactor(userId: string, secret: string, code: string) {
  const isValid = verifyTwoFactorToken(code, secret);
  if (!isValid) {
    throw new AppError('Verification code does not match. Please ensure your authenticator clock is synced and try again.', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  return updated;
}

export async function disableTwoFactor(userId: string, currentPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new AppError('Password verification failed. Unable to disable 2FA.', 400);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  return updated;
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
      avatarUrl: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
      branch: { select: { id: true, name: true, code: true, location: true } },
      division: { select: { id: true, name: true, code: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);
  return user;
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string | null; avatarUrl?: string | null }) {
  const updateData: any = {};
  if (data.name?.trim()) updateData.name = data.name.trim();
  if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
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
