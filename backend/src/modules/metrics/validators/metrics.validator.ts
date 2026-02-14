import { body, query } from 'express-validator';

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '200', '500'];
const ORDER_FIELDS = [
  'id',
  'domain',
  'campaign_name',
  'domain_rating',
  'org_traffic',
  'org_keywords',
  'org_cost',
  'paid_traffic',
  'paid_keywords',
  'paid_cost',
  'top_country',
  'top_traffic',
  'processing_status',
  'created_at',
  'updated_at',
];
const ORDER_DIRECTIONS = ['ASC', 'DESC'];

function validatePageSize(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (PAGE_SIZE_OPTIONS.includes(String(value))) return true;
  throw new Error(`page_size must be one of: ${PAGE_SIZE_OPTIONS.join(', ')}`);
}

function validateOrder(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  const s = String(value).trim();
  const parts = s.split(',').map(p => p.trim());
  const field = parts[0];
  const direction = (parts[1] || 'DESC').toUpperCase();
  if (!field || !ORDER_FIELDS.includes(field)) {
    throw new Error(`order field must be one of: ${ORDER_FIELDS.join(', ')}`);
  }
  if (!ORDER_DIRECTIONS.includes(direction)) {
    throw new Error('order direction must be ASC or DESC');
  }
  return true;
}

function validateRange(value: unknown, name: string): boolean {
  if (value === undefined || value === null || value === '') return true;
  const s = String(value).trim();
  const parts = s.split(',').map(p => p.trim());
  if (parts.length !== 2) {
    throw new Error(`${name} must be in format min,max (e.g. 0,100)`);
  }
  const a = parts[0];
  const b = parts[1];
  if (a === undefined || b === undefined) return true;
  const min = parseFloat(a);
  const max = parseFloat(b);
  if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
    throw new Error(`${name} must be two numbers min,max with min <= max`);
  }
  return true;
}

/**
 * Validators for GET /api/v1/metrics
 */
export const listValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('page_size').optional().custom(validatePageSize),
  query('order').optional().custom(validateOrder),
  query('search').optional().isString().trim().isLength({ max: 255 }),
  query('campaign').optional(),
  query('org_cost')
    .optional()
    .custom(v => validateRange(v, 'org_cost')),
  query('org_keywords')
    .optional()
    .custom(v => validateRange(v, 'org_keywords')),
  query('org_traffic')
    .optional()
    .custom(v => validateRange(v, 'org_traffic')),
  query('dr')
    .optional()
    .custom(v => validateRange(v, 'dr')),
  query('domain_rating')
    .optional()
    .custom(v => validateRange(v, 'domain_rating')),
  query('paid_traffic')
    .optional()
    .custom(v => validateRange(v, 'paid_traffic')),
  query('paid_keywords')
    .optional()
    .custom(v => validateRange(v, 'paid_keywords')),
  query('paid_cost')
    .optional()
    .custom(v => validateRange(v, 'paid_cost')),
  query('top_country').optional(),
  query('top_traffic')
    .optional()
    .custom(v => validateRange(v, 'top_traffic')),
  query('status').optional(),
  query('processing_status').optional(),
  query('error')
    .optional()
    .isIn(['true', 'false', '1', '0'])
    .withMessage('error must be true, false, 1, or 0'),
];

/**
 * Validators for POST /api/v1/metrics/blacklist-processed
 */
export const blacklistProcessedBody = [
  body('domains').isArray({ min: 0 }).withMessage('domains must be an array'),
  body('domains.*.id').isInt({ min: 1 }).withMessage('each domain must have a positive integer id'),
  body('domains.*.domain')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('each domain must have a non-empty domain string'),
];
