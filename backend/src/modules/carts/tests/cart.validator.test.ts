import { describe, expect, test } from 'vitest';
import { validatePageSize, validateOrder, validateIds } from '../validators/cart.validator.ts';

describe('Cart Validator - Unit Tests', () => {
  describe('validatePageSize', () => {
    test('should return true for valid page sizes', () => {
      expect(validatePageSize('25')).toBe(true);
      expect(validatePageSize('50')).toBe(true);
      expect(validatePageSize('100')).toBe(true);
      expect(validatePageSize('200')).toBe(true);
    });

    test('should throw error for invalid page sizes', () => {
      expect(() => validatePageSize('10')).toThrow('Page size must be one of: 25, 50, 100, 200');
      expect(() => validatePageSize('300')).toThrow('Page size must be one of: 25, 50, 100, 200');
      expect(() => validatePageSize('abc')).toThrow('Page size must be one of: 25, 50, 100, 200');
      expect(() => validatePageSize('')).toThrow('Page size must be one of: 25, 50, 100, 200');
    });

    test('should throw error for negative or zero page size', () => {
      expect(() => validatePageSize('-25')).toThrow('Page size must be one of: 25, 50, 100, 200');
      expect(() => validatePageSize('0')).toThrow('Page size must be one of: 25, 50, 100, 200');
    });
  });

  describe('validateOrder', () => {
    test('should return true for valid order format', () => {
      expect(validateOrder('domain,ASC')).toBe(true);
      expect(validateOrder('domain,DESC')).toBe(true);
      expect(validateOrder('similarity_score,ASC')).toBe(true);
      expect(validateOrder('similarity_score,DESC')).toBe(true);
      expect(validateOrder('added_at,ASC')).toBe(true);
      expect(validateOrder('added_at,DESC')).toBe(true);
    });

    test('should return true for empty value', () => {
      expect(validateOrder(undefined)).toBe(true);
      expect(validateOrder(null)).toBe(true);
      expect(validateOrder('')).toBe(true);
    });

    test('should throw error for invalid format', () => {
      expect(() => validateOrder('domain')).toThrow(
        'Order must be in format: field,direction (e.g., similarity_score,DESC)'
      );
      expect(() => validateOrder('domain,ASC,DESC')).toThrow(
        'Order must be in format: field,direction (e.g., similarity_score,DESC)'
      );
    });

    test('should throw error for invalid field', () => {
      expect(() => validateOrder('invalid_field,ASC')).toThrow('Invalid order field');
      expect(() => validateOrder('unknown,DESC')).toThrow('Invalid order field');
    });

    test('should throw error for invalid direction', () => {
      expect(() => validateOrder('domain,INVALID')).toThrow('Order direction must be ASC or DESC');
    });

    test('should accept case-insensitive direction', () => {
      expect(validateOrder('domain,asc')).toBe(true);
      expect(validateOrder('similarity_score,desc')).toBe(true);
      expect(validateOrder('added_at,ASC')).toBe(true);
    });
  });

  describe('validateIds', () => {
    test('should return true for valid ids array', () => {
      expect(validateIds([1])).toBe(true);
      expect(validateIds([1, 2, 3])).toBe(true);
      expect(validateIds([999, 1000])).toBe(true);
    });

    test('should throw error for non-array', () => {
      expect(() => validateIds({})).toThrow('ids must be a non-empty array');
      expect(() => validateIds('1,2')).toThrow('ids must be a non-empty array');
      expect(() => validateIds(null)).toThrow('ids must be a non-empty array');
    });

    test('should throw error for empty array', () => {
      expect(() => validateIds([])).toThrow('ids must be a non-empty array');
    });

    test('should throw error for non-positive integers', () => {
      expect(() => validateIds([0])).toThrow('ids[0] must be a positive integer');
      expect(() => validateIds([-1])).toThrow('ids[0] must be a positive integer');
      expect(() => validateIds([1.5])).toThrow('ids[0] must be a positive integer');
      expect(() => validateIds([NaN])).toThrow('ids[0] must be a positive integer');
      expect(() => validateIds([1, 'x', 3])).toThrow('ids[1] must be a positive integer');
    });

    test('should throw error for non-numeric values', () => {
      expect(() => validateIds(['abc'])).toThrow('ids[0] must be a positive integer');
      expect(() => validateIds([1, 'x', 3])).toThrow('ids[1] must be a positive integer');
    });

    test('should accept string numbers that parse to positive integers', () => {
      expect(validateIds(['1'])).toBe(true);
      expect(validateIds([1, '2', 3])).toBe(true);
    });
  });
});
