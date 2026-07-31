import { Injectable, InternalServerErrorException } from '@nestjs/common';

/**
 * Cliente fino para Groq API (free tier).
 * Usa o fetch nativo do Node (18+) — sem dependência extra.
 */
@Injectable()
export class GeminiClient {
  private readonly apiKey = process.env.GROQ_API_KEY;
  private readonly configuredModel =
    process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly fallbackModels = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'qwen/qwen3-32b',
  ];

  private getModelsToTry(): string[] {
    const models = [this.configuredModel, ...this.fallbackModels]
      .map((model) => model.trim())
      .filter(Boolean);

    return Array.from(new Set(models));
  }

  /**
   * Envia um prompt e espera de volta um JSON estruturado.
   */
  async generateJSON(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'GROQ_API_KEY não configurada no .env do backend',
      );
    }

    const models = this.getModelsToTry();
    let lastError = 'Falha desconhecida ao chamar a Groq API.';

    for (const [index, model] of models.entries()) {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content:
                'Responda sempre com JSON válido e sem markdown. Não adicione texto fora do JSON.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        lastError = `Erro ao chamar a Groq API com modelo ${model} (${response.status}): ${errText.slice(0, 300)}`;

        const canFallback = response.status === 404 || response.status === 429 || response.status >= 500;
        const hasNextModel = index < models.length - 1;

        if (canFallback && hasNextModel) {
          continue;
        }

        throw new InternalServerErrorException(lastError);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        lastError = `A Groq API não retornou conteúdo com o modelo ${model}.`;
        const hasNextModel = index < models.length - 1;
        if (hasNextModel) {
          continue;
        }
        throw new InternalServerErrorException(lastError);
      }

      try {
        return this.parseJSON(text);
      } catch {
        lastError = `A Groq API retornou um JSON inválido com o modelo ${model}.`;
        const hasNextModel = index < models.length - 1;
        if (hasNextModel) {
          continue;
        }
        throw new InternalServerErrorException(lastError);
      }
    }

    throw new InternalServerErrorException(lastError);
  }

  private parseJSON(text: string): any {
    const trimmed = text.trim();

    try {
      return JSON.parse(trimmed);
    } catch {
      // fallback comum: modelo devolve trecho com markdown ou texto extra
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      return JSON.parse(fencedMatch[1]);
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error('Invalid JSON payload');
  }
}
