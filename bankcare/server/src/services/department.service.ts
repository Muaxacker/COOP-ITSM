import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { users: true, categories: true } } },
  });
}

export async function createDepartment(data: { name: string; description?: string }) {
  return prisma.department.create({ data });
}

export async function getDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new AppError('Department not found', 404);
  return dept;
}
