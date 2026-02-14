import { chatCompletion } from './base-open-router.ts';

const SYSTEM_MESSAGE =
  'You are an expert outreach specialist who writes highly personalized, professional ' +
  'guest post proposal emails. You analyze website data thoroughly and create compelling, ' +
  'non-generic outreach emails that get responses. Always follow the exact format requested ' +
  'and include specific personalization based on the provided data.';

/**
 * Generate outreach email via OpenRouter using the full prompt (instructions + analysis JSON).
 * Returns the raw response string (SUBJECT: ... BODY: ...) for storage and display.
 */
export async function generateOutreachEmail(fullPrompt: string): Promise<string> {
  const response = await chatCompletion({
    messages: [
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: fullPrompt },
    ],
  });

  const raw = response.choices?.[0]?.message?.content?.trim() ?? '';
  if (!raw) {
    throw new Error('AI returned empty email');
  }

  return raw;
}
