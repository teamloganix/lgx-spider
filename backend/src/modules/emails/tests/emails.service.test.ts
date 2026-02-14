import { describe, expect, test, beforeEach, vi } from 'vitest';
import * as emailsOpenRouter from '../../../utils/open-router/emails-open-router.ts';
import OutreachEmail from '../models/outreach-email.model.ts';
import OutreachEmailGeneration from '../models/outreach-email-generation.model.ts';
import {
  getEmailById,
  generateEmail,
  saveGeneration,
  buildFullPrompt,
} from '../services/emails.service.ts';

vi.mock('../../../utils/open-router/emails-open-router.ts', () => ({
  generateOutreachEmail: vi.fn(),
}));

vi.mock('../models/outreach-email-generation.model.ts', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

const mockedGenerateOutreachEmail = vi.mocked(emailsOpenRouter.generateOutreachEmail);
const mockedOutreachEmailGenerationFindOne = vi.mocked(OutreachEmailGeneration.findOne);
const mockedOutreachEmailGenerationCreate = vi.mocked(OutreachEmailGeneration.create);

describe('Emails Service - getEmailById', () => {
  let findByPkSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    findByPkSpy = vi.spyOn(OutreachEmail, 'findByPk') as ReturnType<typeof vi.spyOn>;
  });

  test('should return null when email not found', async () => {
    findByPkSpy.mockResolvedValue(null);

    const result = await getEmailById(999);

    expect(result).toBeNull();
    expect(mockedOutreachEmailGenerationFindOne).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line max-len -- long test name for clarity
  test('should return email with analysis_json and null generated_email when no generation', async () => {
    findByPkSpy.mockResolvedValue({
      id: 1,
      domain: 'example.com',
      campaign_name: 'Campaign A',
      analysis_json: JSON.stringify({ overall_link_value: 85 }),
      analyzed_at: new Date('2026-01-21'),
    } as any);
    mockedOutreachEmailGenerationFindOne.mockResolvedValue(null);

    const result = await getEmailById(1);

    expect(result).toEqual({
      id: 1,
      domain: 'example.com',
      campaign_name: 'Campaign A',
      analysis_json: { overall_link_value: 85 },
      analyzed_at: '2026-01-21T00:00:00.000Z',
      generated_email: null,
      prompt_used: null,
    });
    expect(mockedOutreachEmailGenerationFindOne).toHaveBeenCalledWith({
      where: { email_id: 1 },
      order: [['id', 'DESC']],
      attributes: ['generated_email', 'prompt_used'],
    });
  });

  test('should return email with latest generated_email', async () => {
    findByPkSpy.mockResolvedValue({
      id: 2,
      domain: 'site.com',
      campaign_name: 'B',
      analysis_json: null,
      analyzed_at: null,
    } as any);
    mockedOutreachEmailGenerationFindOne.mockResolvedValue({
      generated_email: 'SUBJECT: Hi\n\nBODY: Hello',
      prompt_used: 'Custom prompt',
    } as any);

    const result = await getEmailById(2);

    expect(result?.generated_email).toBe('SUBJECT: Hi\n\nBODY: Hello');
    expect(result?.prompt_used).toBe('Custom prompt');
    expect(result?.analysis_json).toEqual({});
  });
});

describe('Emails Service - generateEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGenerateOutreachEmail.mockResolvedValue('SUBJECT: Test\n\nBODY: Content');
    mockedOutreachEmailGenerationCreate.mockResolvedValue({
      id: 1,
      email_id: 1,
      domain: 'example.com',
      prompt_used: '',
      generated_email: 'SUBJECT: Test\n\nBODY: Content',
      generated_at: new Date(),
    } as any);
  });

  test('buildFullPrompt concatenates prompt and JSON analysis', () => {
    const prompt = 'Instructions\n\n**Website Analysis Data:**';
    const analysis = { key: 'value' };
    expect(buildFullPrompt(prompt, analysis)).toBe(
      `Instructions\n\n**Website Analysis Data:**\n\n${JSON.stringify(analysis, null, 2)}`
    );
  });

  test('should call OpenRouter and create generation when none exists', async () => {
    mockedOutreachEmailGenerationFindOne.mockResolvedValue(null);

    const prompt = 'Write email.\n\n**Website Analysis Data:**';
    const analysis = { domain_analysis: {} };
    const fullPrompt = buildFullPrompt(prompt, analysis);

    const result = await generateEmail(1, 'example.com', prompt, analysis);

    expect(mockedGenerateOutreachEmail).toHaveBeenCalledWith(fullPrompt);
    expect(mockedOutreachEmailGenerationFindOne).toHaveBeenCalledWith({
      where: { email_id: 1 },
      order: [['id', 'DESC']],
    });
    expect(mockedOutreachEmailGenerationCreate).toHaveBeenCalledWith({
      email_id: 1,
      domain: 'example.com',
      prompt_used: prompt,
      generated_email: 'SUBJECT: Test\n\nBODY: Content',
    });
    expect(result).toBe('SUBJECT: Test\n\nBODY: Content');
  });

  test('should update existing generation when one exists (one per domain)', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    mockedOutreachEmailGenerationFindOne.mockResolvedValue({ update: mockUpdate } as any);

    const prompt = 'New prompt';
    const analysis = {};
    const fullPrompt = buildFullPrompt(prompt, analysis);

    const result = await generateEmail(1, 'example.com', prompt, analysis);

    expect(mockedGenerateOutreachEmail).toHaveBeenCalledWith(fullPrompt);
    expect(mockedOutreachEmailGenerationFindOne).toHaveBeenCalledWith({
      where: { email_id: 1 },
      order: [['id', 'DESC']],
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      prompt_used: prompt,
      generated_email: 'SUBJECT: Test\n\nBODY: Content',
    });
    expect(mockedOutreachEmailGenerationCreate).not.toHaveBeenCalled();
    expect(result).toBe('SUBJECT: Test\n\nBODY: Content');
  });
});

describe('Emails Service - saveGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return false when no generation exists for email_id', async () => {
    mockedOutreachEmailGenerationFindOne.mockResolvedValue(null);

    const result = await saveGeneration(99, { generated_email: 'SUBJECT: x\n\nBODY: y' });

    expect(result).toBe(false);
    expect(mockedOutreachEmailGenerationFindOne).toHaveBeenCalledWith({
      where: { email_id: 99 },
      order: [['id', 'DESC']],
    });
  });

  test('should update latest generation and return true', async () => {
    const mockInstance = { update: vi.fn().mockResolvedValue(undefined) };
    mockedOutreachEmailGenerationFindOne.mockResolvedValue(mockInstance as any);

    const result = await saveGeneration(1, { generated_email: 'SUBJECT: New\n\nBODY: Updated' });

    expect(result).toBe(true);
    expect(mockInstance.update).toHaveBeenCalledWith({
      generated_email: 'SUBJECT: New\n\nBODY: Updated',
    });
  });

  test('should update only prompt_used when only prompt sent', async () => {
    const mockInstance = { update: vi.fn().mockResolvedValue(undefined) };
    mockedOutreachEmailGenerationFindOne.mockResolvedValue(mockInstance as any);

    const result = await saveGeneration(1, { prompt_used: 'New prompt text' });

    expect(result).toBe(true);
    expect(mockInstance.update).toHaveBeenCalledWith({ prompt_used: 'New prompt text' });
  });

  test('should create generation with prompt only when no row exists', async () => {
    mockedOutreachEmailGenerationFindOne.mockResolvedValue(null);
    const findByPkSpy = vi.spyOn(OutreachEmail, 'findByPk').mockResolvedValue({
      id: 1,
      domain: 'example.com',
    } as any);
    mockedOutreachEmailGenerationCreate.mockResolvedValue({} as any);

    const result = await saveGeneration(1, { prompt_used: 'My prompt' });

    expect(result).toBe(true);
    expect(findByPkSpy).toHaveBeenCalledWith(1, { attributes: ['id', 'domain'] });
    expect(mockedOutreachEmailGenerationCreate).toHaveBeenCalledWith({
      email_id: 1,
      domain: 'example.com',
      prompt_used: 'My prompt',
      generated_email: '',
    });
    findByPkSpy.mockRestore();
  });
});
