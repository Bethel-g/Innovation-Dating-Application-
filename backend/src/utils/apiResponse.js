export const success = (res, data, message = '', meta = {}) =>
  res.json({ success: true, message, data, meta });

export const created = (res, data, message = '') =>
  res.status(201).json({ success: true, message, data });

export const fail = (res, status = 400, message = 'Request failed', errors = null) =>
  res.status(status).json({ success: false, message, errors });

export const notFound = (res, resource = 'Resource') =>
  fail(res, 404, `${resource} not found`);

export const forbidden = (res, message = 'You do not have permission to perform this action') =>
  fail(res, 403, message);

export const unauthorized = (res, message = 'Authentication required') =>
  fail(res, 401, message);