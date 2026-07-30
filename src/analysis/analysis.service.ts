import { Injectable, BadRequestException } from '@nestjs/common';
import { AppDataSource } from '../database/data-source';
import { EventEntity } from '../database/entities/event.entity';
import { EventRelationshipEntity } from '../database/entities/eventrelationship.entity';
import { GeminiClient } from './gemini.client';

export type DecisionAnalysis = {
  resumo: string;
  decisoes_mais_proveitosas: { nome: string; motivo: string }[];
  decisoes_boas_consequencias: { nome: string; motivo: string }[];
  recomendacoes: string[];
  categorias_atencao: { categoria: string; motivo: string }[];
};

@Injectable()
export class AnalysisService {
  constructor(private readonly gemini: GeminiClient) {}

  async analyzeForUser(userId: number): Promise<DecisionAnalysis> {
    const events = await AppDataSource.getRepository(EventEntity)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.event_type', 'type')
      .where('event.user_id = :userId', { userId })
      .orderBy('event.when', 'ASC')
      .getMany();

    if (events.length < 3) {
      throw new BadRequestException(
        'Registre pelo menos 3 decisões para gerar uma análise com sentido.',
      );
    }

    const relationships = await AppDataSource.getRepository(EventRelationshipEntity)
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.parent', 'parent')
      .leftJoinAndSelect('r.child', 'child')
      .leftJoin('parent.user_id', 'parentUser')
      .where('parentUser.id = :userId', { userId })
      .getMany();

    const prompt = this.buildPrompt(events, relationships);
    const result = await this.gemini.generateJSON(prompt);
    return this.normalize(result);
  }

  private buildPrompt(events: EventEntity[], relationships: EventRelationshipEntity[]): string {
    const decisionsList = events
      .map((ev) => {
        const type = (ev.event_type as any)?.name || 'Decisão';
        const when = ev.when ? String(ev.when).substring(0, 10) : 'sem data';
        return `- [#${ev.id}] "${ev.name}" (categoria: ${type}, data: ${when}, status: ${ev.status})\n  Motivo/contexto: ${ev.why}`;
      })
      .join('\n');

    const relationshipsList = relationships.length
      ? relationships
          .map((r) => `- "${r.parent.name}" levou a "${r.child.name}"`)
          .join('\n')
      : 'Nenhuma relação entre decisões foi registrada ainda.';

    return `Você é um analista que ajuda uma pessoa a refletir sobre a própria trajetória de vida a partir de um histórico de decisões que ela registrou em um app pessoal chamado Myggdrasil.

Abaixo está a lista de decisões da pessoa, seguida das relações de causa/consequência entre elas (quando existirem).

DECISÕES:
${decisionsList}

RELAÇÕES (decisão que levou a outra):
${relationshipsList}

Analise esses dados e responda SOMENTE com um JSON válido (sem markdown, sem texto fora do JSON) seguindo exatamente este formato:

{
  "resumo": "um parágrafo curto (2-4 frases) resumindo os principais padrões que você percebeu na trajetória",
  "decisoes_mais_proveitosas": [
    { "nome": "nome exato da decisão", "motivo": "por que essa decisão parece ter sido especialmente proveitosa" }
  ],
  "decisoes_boas_consequencias": [
    { "nome": "nome exato da decisão", "motivo": "que consequências boas ela gerou, com base nas relações registradas" }
  ],
  "recomendacoes": [
    "sugestão objetiva de próxima decisão ou área a considerar, em uma frase"
  ],
  "categorias_atencao": [
    { "categoria": "nome da categoria", "motivo": "por que essa categoria merece mais atenção (ex: poucas decisões, decisões pausadas, resultados fracos)" }
  ]
}

Liste no máximo 3 itens em cada array. Seja específico e baseie-se apenas nos dados fornecidos, sem inventar decisões que não estão na lista. Responda em português do Brasil.`;
  }

  private normalize(raw: any): DecisionAnalysis {
    return {
      resumo: typeof raw?.resumo === 'string' ? raw.resumo : '',
      decisoes_mais_proveitosas: Array.isArray(raw?.decisoes_mais_proveitosas)
        ? raw.decisoes_mais_proveitosas
        : [],
      decisoes_boas_consequencias: Array.isArray(raw?.decisoes_boas_consequencias)
        ? raw.decisoes_boas_consequencias
        : [],
      recomendacoes: Array.isArray(raw?.recomendacoes) ? raw.recomendacoes : [],
      categorias_atencao: Array.isArray(raw?.categorias_atencao) ? raw.categorias_atencao : [],
    };
  }
}
