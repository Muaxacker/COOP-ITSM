import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { IncidentStatus, Role } from '../types';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  branchId: true,
  divisionId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  branch: { select: { id: true, name: true, code: true, location: true } },
  division: { select: { id: true, name: true, code: true } },
};

export async function getUsers(filters: {
  role?: Role;
  branchId?: string;
  divisionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { role, branchId, divisionId, search, page = 1, limit = 50 } = filters;
  const where: Record<string, unknown> = {};

  if (role) where.role = role;
  if (branchId) where.branchId = branchId;
  if (divisionId) where.divisionId = divisionId;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
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

export async function getTechnicians(divisionId?: string) {
  const technicians = await prisma.user.findMany({
    where: {
      role: Role.TECHNICIAN,
      isActive: true,
      ...(divisionId ? { divisionId } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      division: { select: { id: true, name: true, code: true } },
      incidentsAssigned: {
        where: {
          status: {
            in: [
              IncidentStatus.ASSIGNED,
              IncidentStatus.IN_PROGRESS,
              IncidentStatus.WAITING_FOR_INFO,
            ],
          },
        },
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return technicians.map((tech) => ({
    id: tech.id,
    name: tech.name,
    email: tech.email,
    phone: tech.phone,
    division: tech.division,
    activeWorkload: tech.incidentsAssigned.length,
  }));
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
  branchId?: string;
  divisionId?: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new AppError('A user with this email already exists', 409);

  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      branchId: data.branchId || null,
      divisionId: data.divisionId || null,
      phone: data.phone || null,
    },
    select: USER_SELECT,
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: Role;
    branchId?: string | null;
    divisionId?: string | null;
    phone?: string | null;
    isActive?: boolean;
  }
) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError('User not found', 404);

  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (emailTaken) throw new AppError('Email already in use', 409);
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email.toLowerCase() }),
      ...(data.role && { role: data.role }),
      ...(data.branchId !== undefined && { branchId: data.branchId }),
      ...(data.divisionId !== undefined && { divisionId: data.divisionId }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    select: USER_SELECT,
  });
}

export async function toggleUserStatus(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);

  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: USER_SELECT,
  });
}
