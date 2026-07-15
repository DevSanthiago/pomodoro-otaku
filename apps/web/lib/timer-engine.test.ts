import { describe, it, expect } from "vitest";
import {
  createSnapshot,
  remainingMs,
  isExpired,
  progress,
  nextSessionType,
  formatRemaining,
  minToMs,
  sessionLabel,
} from "./timer-engine";

const DUR = minToMs(25);

describe("remainingMs / isExpired — derivados do relógio, não de contador", () => {
  it("um snapshot idle não consome tempo mesmo com o relógio andando", () => {
    const s = createSnapshot("focus", DUR);
    expect(remainingMs(s, 10_000_000)).toBe(DUR);
    expect(isExpired(s, 10_000_000)).toBe(false);
  });

  it("running desconta (agora - startedAt)", () => {
    const s = { ...createSnapshot("focus", DUR), status: "running" as const, startedAt: 1000 };
    expect(remainingMs(s, 1000 + minToMs(10))).toBe(minToMs(15));
  });

  it("expira quando o tempo passa da duração, mesmo se o relógio pulou (app suspenso)", () => {
    const s = { ...createSnapshot("focus", DUR), status: "running" as const, startedAt: 1000 };
    expect(isExpired(s, 1000 + DUR + minToMs(30))).toBe(true);
    expect(remainingMs(s, 1000 + DUR + minToMs(30))).toBe(0);
  });

  it("pausado preserva o tempo já decorrido e não avança", () => {
    const s = {
      ...createSnapshot("focus", DUR),
      status: "paused" as const,
      startedAt: null,
      elapsedBeforePauseMs: minToMs(10),
    };
    expect(remainingMs(s, 999_999_999)).toBe(minToMs(15));
  });
});

describe("progress", () => {
  it("vai de 0 a 1 e satura em 1", () => {
    const s = { ...createSnapshot("focus", DUR), status: "running" as const, startedAt: 0 };
    expect(progress(s, 0)).toBe(0);
    expect(progress(s, minToMs(12.5))).toBeCloseTo(0.5);
    expect(progress(s, DUR * 2)).toBe(1);
  });
});

describe("nextSessionType — ciclo de 4 focos", () => {
  it("foco vira pausa curta fora do múltiplo de 4", () => {
    expect(nextSessionType("focus", 1)).toBe("shortBreak");
    expect(nextSessionType("focus", 3)).toBe("shortBreak");
  });
  it("foco vira pausa longa a cada 4 focos", () => {
    expect(nextSessionType("focus", 4)).toBe("longBreak");
    expect(nextSessionType("focus", 8)).toBe("longBreak");
  });
  it("qualquer pausa volta para foco", () => {
    expect(nextSessionType("shortBreak", 2)).toBe("focus");
    expect(nextSessionType("longBreak", 4)).toBe("focus");
  });
});

describe("formatRemaining", () => {
  it("formata mm:ss com zero à esquerda e arredonda pra cima", () => {
    expect(formatRemaining(0)).toBe("00:00");
    expect(formatRemaining(minToMs(25))).toBe("25:00");
    expect(formatRemaining(1500)).toBe("00:02");
  });
});

describe("sessionLabel", () => {
  it("no foco usa o nome do quirk da duração", () => {
    expect(sessionLabel("focus", 25)).toBe("Blackwhip");
    expect(sessionLabel("focus", 60)).toBe("Float");
  });
  it("nas pausas usa o rótulo da sessão", () => {
    expect(sessionLabel("shortBreak", 5)).toBe("Pausa curta");
  });
});
