import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { DivisionCode, Priority } from '../types';

export async function getDivisions() {
  return prisma.division.findMany({
    orderBy: { name: 'asc' },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
      users: {
        where: { role: 'TECHNICIAN', isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          users: true,
          categories: true,
        },
      },
    },
  });
}

export async function getDivisionById(id: string) {
  const division = await prisma.division.findUnique({
    where: { id },
    include: {
      categories: true,
      users: {
        where: { role: 'TECHNICIAN' },
        select: { id: true, name: true, email: true, isActive: true },
      },
    },
  });
  if (!division) throw new AppError('Division not found', 404);
  return division;
}

export async function getDivisionByCode(code: DivisionCode) {
  const division = await prisma.division.findUnique({
    where: { code },
    include: {
      categories: { where: { isActive: true } },
    },
  });
  if (!division) throw new AppError(`Division ${code} not found`, 404);
  return division;
}

export async function getCategories(divisionId?: string) {
  return prisma.incidentCategory.findMany({
    where: {
      isActive: true,
      ...(divisionId ? { divisionId } : {}),
    },
    include: {
      division: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryById(id: string) {
  const category = await prisma.incidentCategory.findUnique({
    where: { id },
    include: {
      division: true,
    },
  });
  if (!category) throw new AppError('Category not found', 404);
  return category;
}

export async function createCategory(data: {
  divisionId: string;
  name: string;
  description?: string;
  defaultPriority?: Priority;
  defaultSlaHours?: number;
}) {
  const division = await prisma.division.findUnique({ where: { id: data.divisionId } });
  if (!division) throw new AppError('Division not found', 404);

  return prisma.incidentCategory.create({
    data: {
      divisionId: data.divisionId,
      name: data.name,
      description: data.description,
      defaultPriority: data.defaultPriority ?? Priority.MEDIUM,
      defaultSlaHours: data.defaultSlaHours ?? 24,
    },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    defaultPriority?: Priority;
    defaultSlaHours?: number;
    isActive?: boolean;
  }
) {
  await getCategoryById(id);
  return prisma.incidentCategory.update({
    where: { id },
    data,
  });
}

