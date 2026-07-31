import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppDataSource } from '../database/data-source';
import { EventEntity } from '../database/entities/event.entity';
import { EventRelationshipEntity } from '../database/entities/eventrelationship.entity';
import { GroqClient } from './groq.client';

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

  constructor(private readonly groq: GroqClient) {}

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
      const result = await this.groq.generateJSON(prompt);
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

    return `Você é um mentor pessoal que conversa diretamente com o usuário do Myggdrasil, um app onde ele registra as decisões importantes da própria vida (estudos, carreira, projetos, finanças, etc).

Fale SEMPRE em segunda pessoa, diretamente com o usuário ("você fez...", "você poderia...", nunca "a pessoa" ou "ele/ela"). O tom deve ser próximo, caloroso e direto, como um mentor que conhece a trajetória dele e quer ajudar de verdade — nada de linguagem genérica ou corporativa.

Abaixo está o histórico de decisões do usuário, seguido das relações de causa/consequência entre elas (quando existirem).

DECISÕES:
${decisionsList}

RELAÇÕES (decisão que levou a outra):
${relationshipsList}

Analise esses dados e responda SOMENTE com um JSON válido (sem markdown, sem texto fora do JSON) seguindo exatamente este formato:

{
  "resumo": "um parágrafo curto (2-4 frases), falando diretamente com o usuário, destacando os padrões e o momento atual da trajetória dele",
  "decisoes_mais_proveitosas": [
    { "nome": "nome exato da decisão", "motivo": "por que essa decisão foi especialmente proveitosa pra você, em segunda pessoa" }
  ],
  "decisoes_boas_consequencias": [
    { "nome": "nome exato da decisão", "motivo": "que consequências boas ela gerou pra você, com base nas relações registradas, em segunda pessoa" }
  ],
  "recomendacoes": [
    "sugestão CONCRETA e específica de próximo passo, em segunda pessoa — não repita uma decisão que o usuário já tomou, proponha uma ação nova e prática. Exemplos do nível de especificidade esperado: 'Já que você quer fazer pós em IA, vale testar um curso técnico curto de Machine Learning antes de se comprometer com a pós inteira, pra sentir se é isso mesmo que te motiva' ou 'Como seu projeto em C++ está pausado, separa 3 dias esta semana só pra retomar ele em blocos de 1h, sem se cobrar terminar tudo de uma vez'"
  ],
  "categorias_atencao": [
    { "categoria": "nome da categoria", "motivo": "por que essa categoria merece mais atenção sua (ex: poucas decisões, decisões pausadas, resultados fracos), em segunda pessoa e com uma sugestão prática embutida" }
  ]
}

Liste no máximo 3 itens em cada array. Seja específico e baseie-se apenas nos dados fornecidos, sem inventar decisões que não estão na lista. As recomendações precisam ser acionáveis de verdade (algo que o usuário consiga fazer essa semana), não uma reafirmação do que ele já decidiu. Responda em português do Brasil.`;
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
        motivo: `Essa decisão gerou ${impact} desdobramento(s) na sua trajetória — foi um dos pontos que mais moveu as coisas pra você.`,
      }));

    const decisoesBoasConsequencias = sortedByImpact
      .slice(0, 3)
      .filter(({ impact }) => impact > 0)
      .map(({ ev, impact }) => ({
        nome: ev.name,
        motivo: `Você já colheu ${impact} consequência(s) dessa decisão, sinal de que ela seguiu rendendo frutos práticos pra você.`,
      }));

    const recomendacoes: string[] = [];
    if (statusCounts.pausado > 0) {
      recomendacoes.push(
        `Você tem ${statusCounts.pausado} decisão(ões) pausada(s). Escolhe 1 delas e separa um horário fixo essa semana só pra dar o próximo passo, mesmo que pequeno.`,
      );
    }
    if (relationships.length < Math.max(2, Math.floor(events.length / 2))) {
      recomendacoes.push(
        'Você ainda registrou poucas relações entre as decisões. Na próxima vez que uma decisão nova nascer de outra, arrasta um card sobre o outro pra ligar os dois — isso vai deixar sua árvore muito mais rica pra próxima análise.',
      );
    }
    if (
      topCategories.length > 0 &&
      topCategories[0][1] >= Math.ceil(events.length * 0.5)
    ) {
      recomendacoes.push(
        `Boa parte das suas decisões está concentrada em ${topCategories[0][0]}. Vale reservar um tempo pra pensar em pelo menos uma decisão pequena em outra área da sua vida esse mês, só pra manter o equilíbrio.`,
      );
    }
    if (recomendacoes.length === 0) {
      recomendacoes.push(
        'Seu histórico está bem distribuído entre as áreas. Mantém o hábito de revisar sua árvore a cada duas semanas pra reajustar prioridades enquanto elas ainda são fáceis de mudar.',
      );
    }

    const categoriasAtencao = Array.from(typeCount.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([categoria, total]) => {
        const paused = pausedByType.get(categoria) || 0;
        const motivo =
          paused > 0
            ? `Você tem ${paused} de ${total} decisão(ões) pausada(s) nessa categoria — vale revisar se ainda faz sentido continuar ou se é hora de encerrar de vez.`
            : `Você registrou só ${total} decisão(ões) nessa categoria até agora. Se essa área importa pra você, pode ser um sinal pra explorar mais ela.`;
        return { categoria, motivo };
      });

    return {
      resumo: `Análise local gerada sem IA externa (indisponível no momento). Você tem ${events.length} decisões e ${relationships.length} relações registradas, com destaque para ${topCategoryText}. Seu momento atual: ${statusCounts.ativo} decisão(ões) ativa(s), ${statusCounts.andamento} em andamento, ${statusCounts.pausado} pausada(s) e ${statusCounts.concluido} concluída(s).`,
      decisoes_mais_proveitosas:
        decisoesMaisProveitosas.length > 0
          ? decisoesMaisProveitosas
          : [
              {
                nome: events[0].name,
                motivo:
                  'Você ainda tem poucas relações registradas pra medir o impacto real dessa decisão. Liga ela a outras decisões que vieram depois pra essa leitura ficar mais precisa.',
              },
            ],
      decisoes_boas_consequencias:
        decisoesBoasConsequencias.length > 0
          ? decisoesBoasConsequencias
          : [
              {
                nome: events[0].name,
                motivo:
                  'Ainda não há desdobramentos suficientes registrados pra destacar consequências com confiança. Vale registrar o que veio depois dela.',
              },
            ],
      recomendacoes: recomendacoes.slice(0, 3),
      categorias_atencao: categoriasAtencao,
    };
  }
}
