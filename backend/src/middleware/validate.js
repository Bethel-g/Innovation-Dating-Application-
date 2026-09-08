import { ValidationError } from './errorHandler.js';

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+$/i;

function checkType(value, type) {
  switch (type) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && !Number.isNaN(value);
    case 'integer': return Number.isInteger(Number(value)) && String(value) !== '';
    case 'boolean': return typeof value === 'boolean' || value === 'true' || value === 'false';
    case 'array': return Array.isArray(value);
    case 'object': return value && typeof value === 'object' && !Array.isArray(value);
    case 'email': return typeof value === 'string' && EMAIL_RE.test(value);
    case 'uuid': return typeof value === 'string' && UUID_RE.test(value);
    case 'url': return typeof value === 'string' && URL_RE.test(value);
    default: return true;
  }
}

function validateField(value, rule, fieldName, errors) {
  if (value === undefined || value === null || value === '') {
    if (rule.required) errors.push({ field: fieldName, message: `${fieldName} is required` });
    return;
  }

  if (rule.type && !checkType(value, rule.type)) {
    errors.push({ field: fieldName, message: `${fieldName} must be a valid ${rule.type}` });
    return;
  }

  const str = typeof value === 'string' ? value : String(value);

  if (rule.minLen !== undefined && str.length < rule.minLen) {
    errors.push({ field: fieldName, message: `${fieldName} must have at least ${rule.minLen} characters` });
  }
  if (rule.maxLen !== undefined && str.length > rule.maxLen) {
    errors.push({ field: fieldName, message: `${fieldName} must not exceed ${rule.maxLen} characters` });
  }
  if (rule.min !== undefined && Number(value) < rule.min) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${rule.min}` });
  }
  if (rule.max !== undefined && Number(value) > rule.max) {
    errors.push({ field: fieldName, message: `${fieldName} must be at most ${rule.max}` });
  }
  if (rule.in && !rule.in.includes(value)) {
    errors.push({ field: fieldName, message: `${fieldName} must be one of: ${rule.in.join(', ')}` });
  }
  if (rule.regex && !new RegExp(rule.regex).test(str)) {
    errors.push({ field: fieldName, message: `${fieldName} has an invalid format` });
  }
  if (rule.custom && !rule.custom(value)) {
    errors.push({ field: fieldName, message: rule.customMessage || `${fieldName} is invalid` });
  }
}

const applyDefaults = (obj, schema) => {
  const result = { ...(obj || {}) };
  for (const [key, rule] of Object.entries(schema)) {
    if ((result[key] === undefined || result[key] === null) && rule.default !== undefined) {
      result[key] = typeof rule.default === 'function' ? rule.default() : rule.default;
    }
  }
  return result;
};

const validate = (schemas = {}) => (req, res, next) => {
  const errors = [];

  if (schemas.body) {
    req.body = applyDefaults(req.body, schemas.body);
    for (const [key, rule] of Object.entries(schemas.body)) {
      validateField(req.body[key], rule, key, errors);
    }
  }

  if (schemas.query) {
    for (const [key, rule] of Object.entries(schemas.query)) {
      validateField(req.query[key], rule, key, errors);
    }
  }

  if (schemas.params) {
    for (const [key, rule] of Object.entries(schemas.params)) {
      validateField(req.params[key], rule, key, errors);
    }
  }

  if (errors.length) return next(new ValidationError(errors));
  return next();
};

export default validate;