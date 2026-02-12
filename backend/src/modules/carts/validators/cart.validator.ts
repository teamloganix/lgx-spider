import { query, body } from 'express-validator';

const ALLOWED_PAGE_SIZE = ['25', '50', '100', '200'];
const ALLOWED_ORDER_FIELDS = ['domain', 'similarity_score', 'added_at'];
const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];

export const validatePageSize = (value: any) => {
  if (ALLOWED_PAGE_SIZE.includes(value)) {
    return true;
  }
  throw new Error(`Page size must be one of: ${ALLOWED_PAGE_SIZE.join(', ')}`);
};

export const validateOrder = (value: any) => {
  if (!value) return true;

  const parts = value.split(',');
  if (parts.length !== 2) {
    throw new Error('Order must be in format: field,direction (e.g., similarity_score,DESC)');
  }

  const [field, direction] = parts;

  if (!ALLOWED_ORDER_FIELDS.includes(field)) {
    throw new Error(`Invalid order field. Allowed fields: ${ALLOWED_ORDER_FIELDS.join(', ')}`);
  }

  if (!ALLOWED_DIRECTIONS.includes(direction.toUpperCase())) {
    throw new Error('Order direction must be ASC or DESC');
  }

  return true;
};

export const validateIds = (value: any) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('ids must be a non-empty array');
  }

  for (let i = 0; i < value.length; i += 1) {
    const id = value[i];
    const numValue = Number(id);
    if (Number.isNaN(numValue) || numValue < 1 || !Number.isInteger(numValue)) {
      throw new Error(`ids[${i}] must be a positive integer`);
    }
  }

  return true;
};

/**
 * Validation rules for GET /api/v1/carts
 */
export const getValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer starting from 1'),
  query('page_size').optional().custom(validatePageSize),
  query('domain')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Domain must be between 1 and 255 characters'),
  query('order').optional().custom(validateOrder),
];

/**
 * Validation rules for DELETE /api/v1/carts/bulk
 */
export const bulkDeleteValidators = [
  body('ids').isArray({ min: 1 }).withMessage('ids must be a non-empty array').custom(validateIds),
];
