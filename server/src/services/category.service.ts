import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { Priority } from '../types';

export async function getCategories(activeOnly = true) {
  return prisma.serviceCategory.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { name: 'asc' },
    include: { department: { select: { id: true, name: true } } },
  });
}

export async function getCategoryById(id: string) {
  const cat = await prisma.serviceCategory.findUnique({
    where: { id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!cat) throw new AppError('Category not found', 404);
  return cat;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  departmentId: string;
  defaultDeadlineHours: number;
  defaultPriority: Priority;
}) {
  return prisma.serviceCategory.create({
    data,
    include: { department: { select: { id: true, name: true } } },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    departmentId?: string;
    defaultDeadlineHours?: number;
    defaultPriority?: Priority;
    isActive?: boolean;
  }
) {
  const existing = await prisma.serviceCategory.findUnique({ where: { id } });
  if (!existing) throw new AppError('Category not found', 404);

  return prisma.serviceCategory.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true } } },
  });
}
