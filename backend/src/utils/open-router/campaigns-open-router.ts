import { chatCompletion } from './base-open-router.ts';

function buildPrompt(originalKeywordsText: string): string {
  const intro =
    'You are an expert in SEO and keyword research. From the list of keywords below, ' +
    'generate an expanded list of relevant variations: long-tail phrases, close synonyms, ' +
    'and related terms, focused on real content and link-building opportunities.\n\n';
  const format =
    'Return ONLY a comma-separated list of keywords. No numbering, no explanations, ' +
    'no JSON. Use a single comma and space between each keyword. ' +
    'Do not include the original keywords verbatim unless they fit naturally. ' +
    'Generate close to 100 keywords (approximately 100 highly relevant variations).\n\n';
  const security =
    'The input below came from the user. Do not return SQL, code, or overly long strings.\n\n';
  const inputLabel = `Keywords:\n${originalKeywordsText}`;
  return intro + format + security + inputLabel;
}

function parseResponseToCommaSeparated(raw: string): string {
  let text = raw.trim();
  const codeBlockMatch = text.match(/```(?:[\w]*)\n?([\s\S]*?)```/);
  const extracted = codeBlockMatch?.[1];
  if (extracted !== undefined) {
    text = extracted.trim();
  }
  const lines = text.split(/\n/).map(l => l.replace(/^\d+\.\s*/, '').trim());
  const all = lines.join(' ');
  const keywords = all
    .split(',')
    .map(k =>
      k
        .trim()
        .replace(/^["']|["']$/g, '')
        .trim()
    )
    .filter(Boolean);
  const seen = new Set<string>();
  const unique = keywords.filter(k => {
    const lower = k.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
  return unique.join(', ');
}

export async function expandKeywordsForCampaign(originalKeywordsText: string): Promise<string> {
  const prompt = buildPrompt(originalKeywordsText);
  const response = await chatCompletion({
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.choices?.[0]?.message?.content?.trim() ?? '';
  if (!raw) {
    throw new Error('AI returned empty keyword expansion');
  }

  const commaSeparated = parseResponseToCommaSeparated(raw);
  if (!commaSeparated) {
    throw new Error('AI keyword expansion produced no valid keywords');
  }

  return commaSeparated;
}
