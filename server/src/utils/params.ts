// Express 5 types params as string | string[]; this helper narrows to string
export function param(p: string | string[]): string {
  return Array.isArray(p) ? p[0] : p;
}
