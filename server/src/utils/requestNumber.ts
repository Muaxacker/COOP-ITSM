import { prisma } from '../config/prisma';

export async function generateIncidentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.incident.count();
  const sequence = String(count + 1).padStart(5, '0');
  return `INC-${year}-${sequence}`;
}

export const generateRequestNumber = generateIncidentNumber;

