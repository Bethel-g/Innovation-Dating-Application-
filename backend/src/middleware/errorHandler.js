import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { fail } from '../utils/apiResponse.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.type === 'ValidationError') {
    return fail(res, err.status || 400, err.message || 'Validation failed', err.errors);
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.errors?.[0]?.path;
    return fail(res, 409, field ? `${field} already exists` : 'Duplicate entry', [{ field, message: 'Already exists' }]);
  }

  if (err instanceof ForeignKeyConstraintError) {
    return fail(res, 400, 'Referenced record does not exist');
  }

  if (err.name === 'SyntaxError' && err.status === 400) {
    return fail(res, 400, 'Invalid JSON payload');
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  return fail(res, err.status || 500, err.message || 'Internal server error');
};

export class AppError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.type = 'AppError';
    this.status = status;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 400, errors);
    this.type = 'ValidationError';
  }
}

export default errorHandler;