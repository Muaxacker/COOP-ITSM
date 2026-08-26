import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { validationError } from '../utils/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return validationError(res, result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })));
    }
    req.body = result.data;
    return next();
  };
}
