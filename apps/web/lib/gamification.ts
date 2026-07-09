export interface Progress {
  id: string;
  xpTotal: number;
  focosConcluidos: number;
  tarefasConcluidas: number;
  nivel: number;
  streakAtual: number;
  streakRecorde: number;
  ultimoDiaFoco: string | null;
  personagemAtual: string;
  conquistasDesbloqueadas: string[];
  atualizadaEm: number;
}

export const XP_FOCO = 25;
export const XP_TAREFA = 15;
export const XP_CICLO = 50;
export const FOCOS_POR_CICLO = 4;

interface Tier {
  nivel: number;
  nome: string;
  xpMinimo: number;
  controle: number;
}

export const TIERS: Tier[] = [
  { nivel: 1, nome: "Herdeiro de One For All", xpMinimo: 0, controle: 0 },
  { nivel: 2, nome: "Faísca", xpMinimo: 100, controle: 2 },
  { nivel: 3, nome: "Full Cowl 5%", xpMinimo: 300, controle: 5 },
  { nivel: 4, nome: "Full Cowl 8% — Shoot Style", xpMinimo: 600, controle: 8 },
  { nivel: 5, nome: "Full Cowl 20%", xpMinimo: 1200, controle: 20 },
  { nivel: 6, nome: "Full Cowl 30%", xpMinimo: 2200, controle: 30 },
  { nivel: 7, nome: "Full Cowl 45%", xpMinimo: 3800, controle: 45 },
  { nivel: 8, nome: "Full Cowl 100%", xpMinimo: 6500, controle: 100 },
  { nivel: 9, nome: "United States of Smash", xpMinimo: 11000, controle: 100 },
];

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
}

export const CONQUISTAS: Conquista[] = [
  { id: "primeiro-treino", nome: "Primeiro Treino", descricao: "Complete seu primeiro foco" },
  { id: "gearshift", nome: "Gearshift", descricao: "Complete 10 focos" },
  { id: "fa-jin", nome: "Fa Jin", descricao: "Complete 25 focos" },
  { id: "danger-sense", nome: "Danger Sense", descricao: "Mantenha um streak de 3 dias" },
  { id: "blackwhip", nome: "Blackwhip", descricao: "Complete 50 focos" },
  { id: "smokescreen", nome: "Smokescreen", descricao: "Complete 100 focos" },
  { id: "float", nome: "Float", descricao: "Mantenha um streak de 7 dias" },
  { id: "plus-ultra", nome: "Plus Ultra!", descricao: "Alcance Full Cowl 100%" },
];

export function tierParaXp(xp: number): Tier {
  let atual = TIERS[0];
  for (const tier of TIERS) {
    if (xp >= tier.xpMinimo) atual = tier;
    else break;
  }
  return atual;
}

export function proximoTier(xp: number): Tier | null {
  return TIERS.find((tier) => tier.xpMinimo > xp) ?? null;
}

export function progressoNoTier(xp: number): number {
  const atual = tierParaXp(xp);
  const proximo = proximoTier(xp);
  if (!proximo) return 1;
  return (xp - atual.xpMinimo) / (proximo.xpMinimo - atual.xpMinimo);
}

export function ofaPercent(xp: number): number {
  const atual = tierParaXp(xp);
  const proximo = proximoTier(xp);
  if (!proximo) return atual.controle;
  return atual.controle + (proximo.controle - atual.controle) * progressoNoTier(xp);
}

export function diaLocal(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function diaAnterior(dia: string): string {
  const date = new Date(`${dia}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return diaLocal(date);
}

export function conquistasAlcancadas(progress: Progress): string[] {
  const ids: string[] = [];
  if (progress.focosConcluidos >= 1) ids.push("primeiro-treino");
  if (progress.focosConcluidos >= 10) ids.push("gearshift");
  if (progress.focosConcluidos >= 25) ids.push("fa-jin");
  if (progress.streakRecorde >= 3) ids.push("danger-sense");
  if (progress.focosConcluidos >= 50) ids.push("blackwhip");
  if (progress.focosConcluidos >= 100) ids.push("smokescreen");
  if (progress.streakRecorde >= 7) ids.push("float");
  if (progress.xpTotal >= 6500) ids.push("plus-ultra");
  return ids;
}

export function createProgress(now: number = Date.now()): Progress {
  return {
    id: crypto.randomUUID(),
    xpTotal: 0,
    focosConcluidos: 0,
    tarefasConcluidas: 0,
    nivel: TIERS[0].nivel,
    streakAtual: 0,
    streakRecorde: 0,
    ultimoDiaFoco: null,
    personagemAtual: TIERS[0].nome,
    conquistasDesbloqueadas: [],
    atualizadaEm: now,
  };
}

function derivar(progress: Progress, now: number): Progress {
  const tier = tierParaXp(progress.xpTotal);
  const conquistas = Array.from(
    new Set([...progress.conquistasDesbloqueadas, ...conquistasAlcancadas(progress)]),
  );
  return {
    ...progress,
    nivel: tier.nivel,
    personagemAtual: tier.nome,
    conquistasDesbloqueadas: conquistas,
    atualizadaEm: now,
  };
}

function aplicarDiaDeFoco(progress: Progress, hoje: string): Progress {
  if (progress.ultimoDiaFoco === hoje) return progress;
  const streak = progress.ultimoDiaFoco === diaAnterior(hoje) ? progress.streakAtual + 1 : 1;
  return {
    ...progress,
    streakAtual: streak,
    streakRecorde: Math.max(progress.streakRecorde, streak),
    ultimoDiaFoco: hoje,
  };
}

export function registrarFoco(
  progress: Progress,
  cicloCompleto: boolean,
  now: number = Date.now(),
): Progress {
  const comXp = {
    ...progress,
    xpTotal: progress.xpTotal + XP_FOCO + (cicloCompleto ? XP_CICLO : 0),
    focosConcluidos: progress.focosConcluidos + 1,
  };
  const comStreak = aplicarDiaDeFoco(comXp, diaLocal(new Date(now)));
  return derivar(comStreak, now);
}

export function registrarTarefa(progress: Progress, now: number = Date.now()): Progress {
  const comXp = {
    ...progress,
    xpTotal: progress.xpTotal + XP_TAREFA,
    tarefasConcluidas: progress.tarefasConcluidas + 1,
  };
  return derivar(comXp, now);
}
