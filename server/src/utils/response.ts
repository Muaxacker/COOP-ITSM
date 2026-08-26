import { Response } from 'express';
import { ApiResponse } from '../types';

export function success<T>(res: Response, data: T, message?: string, statusCode = 200) {
  const response: ApiResponse<T> = { success: true, data, message };
  return res.status(statusCode).json(response);
}

export function created<T>(res: Response, data: T, message = 'Created successfully') {
  return success(res, data, message, 201);
}

export function error(res: Response, message: string, statusCode = 400, errors?: unknown) {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
}

export function unauthorized(res: Response, message = 'Unauthorized') {
  return error(res, message, 401);
}

export function forbidden(res: Response, message = 'Forbidden') {
  return error(res, message, 403);
}

export function notFound(res: Response, message = 'Not found') {
  return error(res, message, 404);
}

export function validationError(res: Response, errors: unknown) {
  return error(res, 'Validation failed', 422, errors);
}

export function serverError(res: Response, message = 'Internal server error') {
  return error(res, message, 500);
}
