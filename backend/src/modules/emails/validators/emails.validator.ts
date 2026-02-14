import { query } from 'express-validator';

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '200'];
const ORDER_FIELDS = [
  'domain',
  'campaign_name',
  'link_value',
  'verdict',
  'priority',
  'guest_posts',
  'domain_rating',
  'org_traffic',
  'org_keywords',
  'analyzed_at',
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
  const min = parseInt(a, 10);
  const max = parseInt(b, 10);
  if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
    throw new Error(`${name} must be two integers min,max with min <= max`);
  }
  return true;
}

/**
 * Validators for GET /api/v1/emails
 */
export const listValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('page_size').optional().custom(validatePageSize),
  query('order').optional().custom(validateOrder),
  query('search').optional().isString().trim().isLength({ max: 255 }),
  query('domain').optional().isString().trim().isLength({ max: 255 }),
  query('campaign').optional(),
  query('link_value')
    .optional()
    .custom(v => validateRange(v, 'link_value')),
  query('verdict').optional(),
  query('priority').optional(),
  query('guest_posts').optional(),
  query('traffic')
    .optional()
    .custom(v => validateRange(v, 'traffic')),
  query('keywords')
    .optional()
    .custom(v => validateRange(v, 'keywords')),
  query('domain_rating')
    .optional()
    .custom(v => validateRange(v, 'domain_rating')),
];
