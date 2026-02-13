import { body, param } from 'express-validator';

/**
 * Campaign validators.
 */
export const idParam = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer'),
];

export const createBody = [
  body('name')
    .notEmpty()
    .withMessage('name is required')
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('name must be a string with maximum 255 characters'),
  body('original_keywords')
    .notEmpty()
    .withMessage('original_keywords is required')
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('original_keywords must be a string with maximum 2000 characters'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('blacklist_campaign_enabled')
    .optional()
    .isBoolean()
    .withMessage('blacklist_campaign_enabled must be a boolean'),
  body('blacklist_global_enabled')
    .optional()
    .isBoolean()
    .withMessage('blacklist_global_enabled must be a boolean'),
];

export const updateBody = [
  body('expanded_keywords')
    .optional()
    .isString()
    .trim()
    .withMessage('expanded_keywords must be a string'),
  body('blacklist_campaign_enabled')
    .optional()
    .isBoolean()
    .withMessage('blacklist_campaign_enabled must be a boolean'),
  body('blacklist_global_enabled')
    .optional()
    .isBoolean()
    .withMessage('blacklist_global_enabled must be a boolean'),
  body('cron_add_count')
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage('cron_add_count must be an integer between 0 and 9999'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
];
