import { AIModelConfig } from '../types';

export interface SupportedModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  tier: 'Standard' | 'Advanced' | 'Lite';
}

export const SUPPORTED_GEMINI_MODELS: SupportedModel[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Recommended)',
    description: 'High performance, low latency, ideal for real-time conversation and sales intelligence.',
    isDefault: true,
    tier: 'Standard',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    description: 'Complex reasoning model for deep audit analysis and specialized objection handling.',
    tier: 'Advanced',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    description: 'Always routes to the freshest generally available Gemini Flash model.',
    tier: 'Standard',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Ultra-fast lightweight reasoning for high-throughput batch operations.',
    tier: 'Lite',
  },
];

const AI_CONFIG_KEY = 'mca_ai_model_config_v1';

export const DEFAULT_AI_CONFIG: AIModelConfig = {
  provider: 'Google Gemini',
  modelId: 'gemini-3.8-flash',
  temperature: 0.7,
  systemPersona: 'Sophia, Senior AI Sales Representative for Marketing Charm Agency',
};

export function getAIModelConfig(): AIModelConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.provider && parsed.modelId) {
        return {
          ...DEFAULT_AI_CONFIG,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load AI model config:', e);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveAIModelConfig(config: Partial<AIModelConfig>): AIModelConfig {
  const current = getAIModelConfig();
  const updated: AIModelConfig = {
    ...current,
    ...config,
  };
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist AI model config:', e);
  }
  return updated;
}
