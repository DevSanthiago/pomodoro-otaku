import { create } from "zustand";
import { getProgress, putProgress } from "@/lib/db";
import { isOnline } from "@/lib/sync/sync-engine";
import { getProgressRemote, putProgressRemote } from "@/lib/api-client";
import {
  createProgress,
  registrarFoco,
  registrarTarefa,
  CONQUISTAS,
  type Progress,
  type Conquista,
} from "@/lib/gamification";

interface GamificationState {
  progress: Progress | null;
  hydrated: boolean;
  dirty: boolean;
  novaConquista: Conquista | null;
  hydrate: () => Promise<void>;
  registrarFocoConcluido: (cicloCompleto: boolean) => Promise<void>;
  registrarTarefaConcluida: () => Promise<void>;
  sync: () => Promise<void>;
  limparNovaConquista: () => void;
}

function detectarNovaConquista(antes: Progress, depois: Progress): Conquista | null {
  const novaId = depois.conquistasDesbloqueadas.find(
    (id) => !antes.conquistasDesbloqueadas.includes(id),
  );
  return novaId ? (CONQUISTAS.find((c) => c.id === novaId) ?? null) : null;
}

let fila: Promise<void> = Promise.resolve();

function enfileirar(tarefa: () => Promise<void>): Promise<void> {
  const proxima = fila.then(tarefa, tarefa);
  fila = proxima.catch(() => undefined);
  return proxima;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  progress: null,
  hydrated: false,
  dirty: false,
  novaConquista: null,

  hydrate: async () => {
    const local = (await getProgress()) ?? createProgress();
    await putProgress(local);
    set({ progress: local, hydrated: true });
    void get().sync();
  },

  registrarFocoConcluido: (cicloCompleto) =>
    enfileirar(async () => {
      const atual = get().progress ?? (await getProgress()) ?? createProgress();
      const atualizado = registrarFoco(atual, cicloCompleto);
      await putProgress(atualizado);
      set({
        progress: atualizado,
        dirty: true,
        novaConquista: detectarNovaConquista(atual, atualizado) ?? get().novaConquista,
      });
      void get().sync();
    }),

  registrarTarefaConcluida: () =>
    enfileirar(async () => {
      const atual = get().progress ?? (await getProgress()) ?? createProgress();
      const atualizado = registrarTarefa(atual);
      await putProgress(atualizado);
      set({
        progress: atualizado,
        dirty: true,
        novaConquista: detectarNovaConquista(atual, atualizado) ?? get().novaConquista,
      });
      void get().sync();
    }),

  sync: async () => {
    const local = get().progress;
    if (!isOnline() || !local) return;
    try {
      const server = get().dirty
        ? await putProgressRemote(local)
        : await getProgressRemote();
      if (server.atualizadaEm >= local.atualizadaEm) {
        await putProgress(server);
        set({ progress: server });
      }
      set({ dirty: false });
    } catch {
      // offline ou API indisponível: local persiste e reenvia no próximo sync
    }
  },

  limparNovaConquista: () => set({ novaConquista: null }),
}));
