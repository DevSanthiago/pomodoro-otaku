import { describe, it, expect } from "vitest";
import {
  createTask,
  applyPatch,
  toggleTaskDone,
  sortTasks,
  clampEstimados,
  type Task,
} from "./task";

function tarefa(over: Partial<Task> = {}): Task {
  return { ...createTask({ titulo: "t", pomodorosEstimados: 1 }, 1000), ...over };
}

describe("createTask", () => {
  it("nasce pendente, sem XP concedido e com título aparado", () => {
    const t = createTask({ titulo: "  Estudar  ", pomodorosEstimados: 2 }, 1000);
    expect(t.titulo).toBe("Estudar");
    expect(t.status).toBe("pendente");
    expect(t.xpConcedido).toBeUndefined();
    expect(t.pomodorosCompletados).toBe(0);
  });
});

describe("toggleTaskDone — XP só na primeira conclusão (anti-farm)", () => {
  it("concluir pela primeira vez concede XP e marca a flag", () => {
    const r = toggleTaskDone(tarefa(), 2000);
    expect(r.task.status).toBe("concluida");
    expect(r.task.xpConcedido).toBe(true);
    expect(r.concedeXp).toBe(true);
  });

  it("desmarcar não concede e mantém a flag", () => {
    const concluida = toggleTaskDone(tarefa(), 2000).task;
    const reaberta = toggleTaskDone(concluida, 3000);
    expect(reaberta.task.status).toBe("pendente");
    expect(reaberta.task.xpConcedido).toBe(true);
    expect(reaberta.concedeXp).toBe(false);
  });

  it("remarcar NÃO concede XP de novo — o farm está fechado", () => {
    const concluida = toggleTaskDone(tarefa(), 2000).task;
    const reaberta = toggleTaskDone(concluida, 3000).task;
    const reconcluida = toggleTaskDone(reaberta, 4000);
    expect(reconcluida.task.status).toBe("concluida");
    expect(reconcluida.concedeXp).toBe(false);
  });
});

describe("applyPatch", () => {
  it("atualiza só os campos informados e mexe em atualizadaEm", () => {
    const t = tarefa();
    const p = applyPatch(t, { titulo: "  Novo  " }, 5000);
    expect(p.titulo).toBe("Novo");
    expect(p.pomodorosEstimados).toBe(t.pomodorosEstimados);
    expect(p.atualizadaEm).toBe(5000);
  });
});

describe("clampEstimados", () => {
  it("limita entre 0 e 99 e trata valor inválido", () => {
    expect(clampEstimados(-3)).toBe(0);
    expect(clampEstimados(500)).toBe(99);
    expect(clampEstimados(3.9)).toBe(3);
    expect(clampEstimados(NaN)).toBe(0);
  });
});

describe("sortTasks", () => {
  it("ordena emAndamento → pendente → concluida, e mais novas primeiro no empate", () => {
    const ordenadas = sortTasks([
      tarefa({ id: "a", status: "concluida", criadaEm: 1 }),
      tarefa({ id: "b", status: "pendente", criadaEm: 10 }),
      tarefa({ id: "c", status: "emAndamento", criadaEm: 5 }),
      tarefa({ id: "d", status: "pendente", criadaEm: 20 }),
    ]);
    expect(ordenadas.map((t) => t.id)).toEqual(["c", "d", "b", "a"]);
  });
});
