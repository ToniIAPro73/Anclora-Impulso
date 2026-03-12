import type { LLMProvider, LLMCompletionOptions, LLMCompletionResult } from './types';
import { GroqProvider } from './groq.provider';
import { env } from '../../config/env';
import logger from '../../config/logger';

let provider: LLMProvider | null = null;

function getProvider(): LLMProvider {
  if (provider) return provider;

  const llmProvider = env.llmProvider;

  switch (llmProvider) {
    case 'groq':
      if (!env.groqApiKey) {
        throw new Error('GROQ_API_KEY no está configurada');
      }
      provider = new GroqProvider(env.groqApiKey, env.groqModel);
      break;

    default:
      // Default a Groq si hay API key disponible
      if (env.groqApiKey) {
        provider = new GroqProvider(env.groqApiKey, env.groqModel);
      } else {
        throw new Error(
          'No hay proveedor LLM configurado. Configura GROQ_API_KEY en las variables de entorno.'
        );
      }
  }

  logger.info(`LLM provider initialized: ${provider.name}`);
  return provider;
}

export async function generateCompletion(
  options: LLMCompletionOptions
): Promise<LLMCompletionResult> {
  const llm = getProvider();
  return llm.generateCompletion(options);
}

export async function generateJSON<T = unknown>(
  options: LLMCompletionOptions
): Promise<T> {
  const llm = getProvider();
  return llm.generateJSON<T>(options);
}

export function getProviderName(): string {
  try {
    return getProvider().name;
  } catch {
    return 'none';
  }
}

export const SYSTEM_PROMPT_ES =
  'Eres un asistente experto en nutrición y fitness. Generas respuestas en formato JSON válido. Todo el contenido de texto (nombres, descripciones, instrucciones) DEBE estar en ESPAÑOL.';
