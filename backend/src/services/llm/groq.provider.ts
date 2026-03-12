import Groq from 'groq-sdk';
import type { LLMProvider, LLMCompletionOptions, LLMCompletionResult } from './types';
import logger from '../../config/logger';

export class GroqProvider implements LLMProvider {
  name = 'groq';
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Groq({ apiKey });
    this.model = model || 'llama-3.3-70b-versatile';
  }

  async generateCompletion(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 7000,
      ...(options.jsonMode && { response_format: { type: 'json_object' } }),
    });

    const content = response.choices[0]?.message?.content || '';

    return {
      content,
      model: this.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  async generateJSON<T = unknown>(options: LLMCompletionOptions): Promise<T> {
    const result = await this.generateCompletion({
      ...options,
      jsonMode: true,
    });

    try {
      return JSON.parse(result.content) as T;
    } catch (error) {
      logger.error('Failed to parse Groq JSON response', {
        content: result.content.substring(0, 500),
        error: (error as Error).message,
      });
      throw new Error('La respuesta de IA no es un JSON válido');
    }
  }
}
