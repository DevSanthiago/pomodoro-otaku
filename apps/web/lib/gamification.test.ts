import { describe, it, expect } from "vitest";
import {
  createProgress,
  registrarFoco,
  registrarTarefa,
  tierParaXp,
  proximoTier,
  conquistasAlcancadas,
  diaLocal,
  XP_FOCO,
  XP_TAREFA,
  XP_CICLO,
} from "./gamification";

const T0 = new Date("2026-07-14T12:00:00").getTime();
const DIA = 24 * 60 * 60 * 1000;

describe("registrarFoco — XP e ciclo", () => {
  it("um foco simples soma XP_FOCO", () => {
    const p = registrarFoco(createProgress(T0), false, T0);
    expect(p.xpTotal).toBe(XP_FOCO);
    expect(p.focosConcluidos).toBe(1);
  });

  it("fechar ciclo (4º foco) soma o bônus", () => {
    const p = registrarFoco(createProgress(T0), true, T0);
    expect(p.xpTotal).toBe(XP_FOCO + XP_CICLO);
  });
});

describe("registrarTarefa", () => {
  it("soma XP_TAREFA e conta a tarefa", () => {
    const p = registrarTarefa(createProgress(T0), T0);
    expect(p.xpTotal).toBe(XP_TAREFA);
    expect(p.tarefasConcluidas).toBe(1);
  });
});

describe("streak diário", () => {
  it("primeiro foco do dia inicia streak em 1", () => {
    const p = registrarFoco(createProgress(T0), false, T0);
    expect(p.streakAtual).toBe(1);
    expect(p.ultimoDiaFoco).toBe(diaLocal(new Date(T0)));
  });

  it("dois focos no mesmo dia não incrementam o streak", () => {
    const p1 = registrarFoco(createProgress(T0), false, T0);
    const p2 = registrarFoco(p1, false, T0 + 60_000);
    expect(p2.streakAtual).toBe(1);
  });

  it("foco no dia seguinte incrementa o streak", () => {
    const p1 = registrarFoco(createProgress(T0), false, T0);
    const p2 = registrarFoco(p1, false, T0 + DIA);
    expect(p2.streakAtual).toBe(2);
    expect(p2.streakRecorde).toBe(2);
  });

  it("pular um dia reinicia o streak em 1 mas mantém o recorde", () => {
    const p1 = registrarFoco(createProgress(T0), false, T0);
    const p2 = registrarFoco(p1, false, T0 + DIA);
    const p3 = registrarFoco(p2, false, T0 + 3 * DIA);
    expect(p3.streakAtual).toBe(1);
    expect(p3.streakRecorde).toBe(2);
  });
});

describe("tiers de One For All", () => {
  it("mapeia XP para o tier certo", () => {
    expect(tierParaXp(0).nome).toBe("Herdeiro de One For All");
    expect(tierParaXp(300).nome).toBe("Full Cowl 5%");
    expect(tierParaXp(999_999).nome).toBe("United States of Smash");
  });

  it("o último tier não tem próximo", () => {
    expect(proximoTier(11000)).toBeNull();
  });

  it("o nível e o personagem derivam do XP", () => {
    const p = registrarTarefa({ ...createProgress(T0), xpTotal: 285 }, T0);
    expect(p.xpTotal).toBe(300);
    expect(p.nivel).toBe(3);
    expect(p.personagemAtual).toBe("Full Cowl 5%");
  });
});

describe("conquistas", () => {
  it("desbloqueia por focos acumulados", () => {
    const p = { ...createProgress(T0), focosConcluidos: 10 };
    const ids = conquistasAlcancadas(p);
    expect(ids).toContain("primeiro-treino");
    expect(ids).toContain("gearshift");
    expect(ids).not.toContain("fa-jin");
  });

  it("desbloqueia por streak recorde", () => {
    const p = { ...createProgress(T0), streakRecorde: 7 };
    const ids = conquistasAlcancadas(p);
    expect(ids).toContain("danger-sense");
    expect(ids).toContain("float");
  });

  it("registrarFoco acumula conquistas sem removê-las depois", () => {
    let p = { ...createProgress(T0), focosConcluidos: 9 };
    p = registrarFoco(p, false, T0);
    expect(p.conquistasDesbloqueadas).toContain("gearshift");
  });
});
