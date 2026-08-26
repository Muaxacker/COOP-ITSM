import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { Role } from '../types';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true } },
};

export async function getUsers(filters: { role?: Role; search?: string; page?: number; limit?: number }) {
  const { role, search, page = 1, limit = 20 } = filters;
  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new AppError('A user with this email already exists', 409);

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      departmentId: data.departmentId || null,
    },
    select: USER_SELECT,
  });

  return user;
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: Role; departmentId?: string | null }
) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (emailTaken) throw new AppError('Email already in use', 409);
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email.toLowerCase() }),
      ...(data.role && { role: data.role }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
    },
    select: USER_SELECT,
  });

  return user;
}

export async function toggleUserStatus(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: USER_SELECT,
  });

  return updated;
}
