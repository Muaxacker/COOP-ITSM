import { prisma } from '../config/prisma';

export async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  // Count total requests to get sequence
  const count = await prisma.serviceRequest.count();
  const sequence = String(count + 1).padStart(5, '0');
  return `SR-${year}-${sequence}`;
}
