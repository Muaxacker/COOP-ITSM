import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getBranches(includeInactive = false) {
  return prisma.branch.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          users: true,
          incidents: true,
        },
      },
    },
  });
}

export async function getBranchById(id: string) {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, incidents: true } },
    },
  });
  if (!branch) throw new AppError('Branch not found', 404);
  return branch;
}

export async function createBranch(data: {
  name: string;
  code: string;
  location: string;
  phone?: string;
}) {
  const existingCode = await prisma.branch.findUnique({ where: { code: data.code } });
  if (existingCode) throw new AppError('Branch code already in use', 400);

  const existingName = await prisma.branch.findUnique({ where: { name: data.name } });
  if (existingName) throw new AppError('Branch name already exists', 400);

  return prisma.branch.create({ data });
}

export async function updateBranch(
  id: string,
  data: {
    name?: string;
    code?: string;
    location?: string;
    phone?: string;
    isActive?: boolean;
  }
) {
  await getBranchById(id);
  return prisma.branch.update({
    where: { id },
    data,
  });
}

