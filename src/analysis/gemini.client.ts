import { Injectable, InternalServerErrorException } from '@nestjs/common';

/**
 * Cliente fino para a Gemini API (Google AI Studio).
 * Usa o fetch nativo do Node (18+) — sem dependência extra.
 *
 * Modelo padrão: gemini-2.5-flash-lite, que tem a cota diária mais generosa
 * no tier gratuito. Pode ser trocado via env GEMINI_MODEL se necessário.
 */
@Injectable()
export class GeminiClient {
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  /**
   * Envia um prompt e espera de volta um JSON já estruturado (usa o modo
   * responseMimeType: application/json do Gemini para evitar markdown/texto solto).
   */
  async generateJSON(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY não configurada no .env do backend',
      );
    }

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Erro ao chamar a Gemini API (${response.status}): ${errText.slice(0, 300)}`,
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new InternalServerErrorException('A Gemini API não retornou conteúdo.');
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new InternalServerErrorException('A Gemini API retornou um JSON inválido.');
    }
  }
}
