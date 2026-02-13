import env from '../env.ts';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterChatCompletionOptions {
  model?: string;
  messages: OpenRouterMessage[];
  timeoutMs?: number;
}

export interface OpenRouterChatCompletionResponse {
  id: string;
  choices: Array<{
    message: OpenRouterMessage;
    finish_reason: string;
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function getConfig() {
  const apiKey = env.OPENROUTER_API_KEY;
  const endpoint = env.OPENROUTER_ENDPOINT;
  const defaultModel = env.OPENROUTER_MODEL;
  const timeoutMs = env.OPENROUTER_TIMEOUT_MS;
  if (!apiKey || !endpoint) {
    throw new Error(
      'OPENROUTER_API_KEY and OPENROUTER_ENDPOINT must be set in env for AI features'
    );
  }
  return { apiKey, endpoint, defaultModel, timeoutMs };
}

export async function chatCompletion(
  options: OpenRouterChatCompletionOptions
): Promise<OpenRouterChatCompletionResponse> {
  const { apiKey, endpoint, defaultModel, timeoutMs } = getConfig();
  const model = options.model ?? defaultModel;
  const timeout = options.timeoutMs ?? timeoutMs;

  const body = {
    model,
    messages: options.messages,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const { status, statusText } = response;
      let responseData: string;
      try {
        responseData = await response.text();
      } catch {
        responseData = 'Unable to parse response';
      }
      throw new Error(`OpenRouter failed: ${status} ${statusText} - ${responseData}`);
    }

    const data = (await response.json()) as OpenRouterChatCompletionResponse;
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error: ${String(error)}`);
  }
}
