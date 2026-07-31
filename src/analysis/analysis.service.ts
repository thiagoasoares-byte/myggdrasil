import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AnalysisService.name);

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

    const relationships = await AppDataSource.getRepository(
      EventRelationshipEntity,
    )
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.parent', 'parent')
      .leftJoinAndSelect('r.child', 'child')
      .leftJoin('parent.user_id', 'parentUser')
      .where('parentUser.id = :userId', { userId })
      .getMany();

    const prompt = this.buildPrompt(events, relationships);

    try {
      const result = await this.gemini.generateJSON(prompt);
      return this.normalize(result);
    } catch (error: any) {
      this.logger.warn(
        `Fallback local de análise acionado para user ${userId}: ${error?.message || 'erro desconhecido'}`,
      );
      return this.buildLocalFallback(events, relationships);
    }
  }

  private buildPrompt(
    events: EventEntity[],
    relationships: EventRelationshipEntity[],
  ): string {
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
      decisoes_boas_consequencias: Array.isArray(
        raw?.decisoes_boas_consequencias,
      )
        ? raw.decisoes_boas_consequencias
        : [],
      recomendacoes: Array.isArray(raw?.recomendacoes) ? raw.recomendacoes : [],
      categorias_atencao: Array.isArray(raw?.categorias_atencao)
        ? raw.categorias_atencao
        : [],
    };
  }

  private buildLocalFallback(
    events: EventEntity[],
    relationships: EventRelationshipEntity[],
  ): DecisionAnalysis {
    const normalizeStatus = (value?: string) =>
      (value || 'ativo')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const typeCount = new Map<string, number>();
    const pausedByType = new Map<string, number>();
    const outgoingByEvent = new Map<number, number>();

    for (const ev of events) {
      const typeName = (ev.event_type as any)?.name || 'Decisão';
      typeCount.set(typeName, (typeCount.get(typeName) || 0) + 1);

      const status = normalizeStatus(ev.status);
      if (status === 'pausado' || status === 'parado') {
        pausedByType.set(typeName, (pausedByType.get(typeName) || 0) + 1);
      }
    }

    for (const rel of relationships) {
      const parentId = rel.parent?.id;
      if (typeof parentId === 'number') {
        outgoingByEvent.set(parentId, (outgoingByEvent.get(parentId) || 0) + 1);
      }
    }

    const statusCounts = {
      ativo: 0,
      andamento: 0,
      pausado: 0,
      concluido: 0,
      outros: 0,
    };

    for (const ev of events) {
      const status = normalizeStatus(ev.status);
      if (status === 'ativo') statusCounts.ativo += 1;
      else if (status === 'em andamento') statusCounts.andamento += 1;
      else if (status === 'pausado' || status === 'parado')
        statusCounts.pausado += 1;
      else if (status === 'concluido') statusCounts.concluido += 1;
      else statusCounts.outros += 1;
    }

    const topCategories = Array.from(typeCount.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    const topCategoryText = topCategories[0]
      ? `${topCategories[0][0]} (${topCategories[0][1]} decisões)`
      : 'sem categoria dominante';

    const sortedByImpact = [...events]
      .map((ev) => ({ ev, impact: outgoingByEvent.get(ev.id) || 0 }))
      .sort((a, b) => b.impact - a.impact);

    const decisoesMaisProveitosas = sortedByImpact
      .slice(0, 3)
      .filter(({ impact }) => impact > 0)
      .map(({ ev, impact }) => ({
        nome: ev.name,
        motivo: `Gerou ${impact} desdobramento(s) registrado(s), sugerindo alto impacto na sua trajetória.`,
      }));

    const decisoesBoasConsequencias = sortedByImpact
      .slice(0, 3)
      .filter(({ impact }) => impact > 0)
      .map(({ ev, impact }) => ({
        nome: ev.name,
        motivo: `Tem ${impact} consequência(s) ligada(s), indicando continuidade prática após a decisão.`,
      }));

    const recomendacoes: string[] = [];
    if (statusCounts.pausado > 0) {
      recomendacoes.push(
        `Você tem ${statusCounts.pausado} decisão(ões) pausada(s): escolha 1 para retomar nesta semana com um próximo passo objetivo.`,
      );
    }
    if (relationships.length < Math.max(2, Math.floor(events.length / 2))) {
      recomendacoes.push(
        'Registre mais relações entre decisões para enxergar melhor causa e consequência no seu histórico.',
      );
    }
    if (
      topCategories.length > 0 &&
      topCategories[0][1] >= Math.ceil(events.length * 0.5)
    ) {
      recomendacoes.push(
        `A categoria ${topCategories[0][0]} concentra grande parte das decisões; avalie equilibrar com outras áreas de vida.`,
      );
    }
    if (recomendacoes.length === 0) {
      recomendacoes.push(
        'Seu histórico está bem distribuído; mantenha revisões quinzenais para ajustar prioridades.',
      );
    }

    const categoriasAtencao = Array.from(typeCount.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([categoria, total]) => {
        const paused = pausedByType.get(categoria) || 0;
        const motivo =
          paused > 0
            ? `${paused} de ${total} decisão(ões) nessa categoria está(ão) pausada(s).`
            : `A categoria tem apenas ${total} decisão(ões) registrada(s), o que pode indicar baixa exploração.`;
        return { categoria, motivo };
      });

    return {
      resumo: `Análise local gerada sem Gemini externa. Você tem ${events.length} decisões e ${relationships.length} relações registradas, com destaque para ${topCategoryText}. Status atual: ${statusCounts.ativo} ativa(s), ${statusCounts.andamento} em andamento, ${statusCounts.pausado} pausada(s) e ${statusCounts.concluido} concluída(s).`,
      decisoes_mais_proveitosas:
        decisoesMaisProveitosas.length > 0
          ? decisoesMaisProveitosas
          : [
              {
                nome: events[0].name,
                motivo:
                  'Ainda há poucas relações explícitas para medir impacto; registre mais vínculos entre decisões para melhorar esta leitura.',
              },
            ],
      decisoes_boas_consequencias:
        decisoesBoasConsequencias.length > 0
          ? decisoesBoasConsequencias
          : [
              {
                nome: events[0].name,
                motivo:
                  'Não há desdobramentos suficientes registrados para destacar consequências com confiança ainda.',
              },
            ],
      recomendacoes: recomendacoes.slice(0, 3),
      categorias_atencao: categoriasAtencao,
    };
  }
}
