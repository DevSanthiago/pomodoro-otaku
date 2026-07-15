# Frontend

Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + Zustand.
PWA instalável, dark fixo, offline-first.

## Rotas

| Rota | O que é |
|---|---|
| `/` | **só o timer**, puro e centralizado |
| `/tasks` | to-do list |
| `/perfil` | gamificação (emblema, XP, streak, conquistas) |
| `/login`, `/registro` | entrar / criar conta |

A separação é deliberada: **tarefa e XP não ficam na home** porque atrapalham a
concentração. Navegação pela `TopBar` global (escondida nas telas de auth).

## Timer — a restrição que manda no design

O iOS Safari **não garante execução em background** para PWAs. Um `setInterval`
decrescente **para** quando o app é suspenso e passa a mostrar tempo errado.

**Regra inegociável — sempre timestamp:**

```
tempoRestante = duracaoTotal - (agora - inicioEmMs)
```

- `lib/timer-engine.ts` é **puro**: guarda `startedAt` + `durationMs` e deriva o
  restante do relógio. Recebe `now` como parâmetro (testável, sem `Date.now()`
  escondido).
- O `setInterval` de 250ms em `pomodoro-timer.tsx` serve **só para repintar a tela**
  — ele não conta o tempo, só chama `sync(Date.now())`.
- Em `visibilitychange` e `focus`, **recalcula do timestamp**. Ao voltar pro app, a
  UI é a fonte da verdade — nunca a notificação.

Sessões: foco / pausa curta / pausa longa, ciclo de 4 focos. Durações selecionáveis
(3/5/15/25/60 min); no foco cada duração tem nome de quirk do One For All
(Gearshift, Fa Jin, Danger Sense, Blackwhip, Float).

## Offline-first

`lib/db.ts` — IndexedDB **v4** (`idb`):

| Store | Conteúdo |
|---|---|
| `tasks` | tarefas (índice `by-criadaEm`) |
| `outbox` | fila de operações pendentes (`upsert`/`delete`, autoincremento) |
| `progress` | progresso (chave fixa `singleton`) |
| `meta` | **dono** do banco local (`owner` = `userId`) |

**`ensureOwner(userId)`**: se o dono gravado for diferente do usuário logado, **limpa
tasks + outbox + progress**. Sem isso, trocar de conta no mesmo navegador vazaria os
dados do usuário anterior. Roda no boot (`components/auth/session-boot.tsx`) — e não
só nas páginas, porque a home **não** monta o painel de gamificação e mesmo assim
concede XP.

`lib/sync/sync-engine.ts`: **flush** do outbox → **pull** (`GET /tasks`) →
**reconcile** (last-write-wins por `atualizadaEm`). Dispara em cada mutação, no
hydrate e no evento `online`. Falhou? As operações **continuam na fila**.

⚠️ O iOS pode **limpar o IndexedDB** se o PWA ficar dias sem uso. O local nunca é
tratado como permanente — por isso tudo sincroniza para a API assim que há conexão.

## Gamificação (One For All)

`lib/gamification.ts` (puro) — espelhado em `Domain/OneForAll.cs` no backend.

- **XP:** foco +25 · tarefa concluída +15 · bônus de ciclo (4 focos) +50.
- **Tiers:** Herdeiro (0) → Faísca (100) → Full Cowl 5% (300) → 8% Shoot Style (600)
  → 20% (1200) → 30% (2200) → 45% (3800) → 100% (6500) → United States of Smash (11000).
- **Streak:** dias consecutivos com ≥1 foco (`ultimoDiaFoco`, dia **local**).
- **Conquistas:** 6 quirks vestígio + Primeiro Treino + Plus Ultra.

⚠️ As actions do store **leem o progresso do IndexedDB antes de aplicar** a regra —
não recriam do zero. Sem isso, uma mutação numa página sem o painel montado
sobrescreveria o XP com um objeto zerado.

🐛 **Bug conhecido:** `toggleDone` concede +15 XP **toda vez** que a tarefa volta a
`concluida` — desmarcar e remarcar farma XP infinito. Não corrigido.

🐛 **Race conhecida:** `registrarFoco` e `registrarTarefa` fazem read-modify-write
sem lock; concluir foco e tarefa quase juntos pode perder uma das atualizações.

## PWA

| Peça | Arquivo |
|---|---|
| Manifest | `app/manifest.ts` → `/manifest.webmanifest` (Next 16) |
| Service worker | `public/sw.js` — precache do shell, network-first em navegação, cache-first em assets |
| Registro | `components/pwa/service-worker-register.tsx` |
| Metadata iOS | `app/layout.tsx` — `appleWebApp`, `viewportFit: cover` |

⚠️ O SW **não cacheia `/api/`**. Antes cacheava, e servia token velho — o app ficava
"logado" com um token que não valia mais.

> Next 16: `themeColor` vai no export `viewport`, **não** em `metadata`.

## UI

- **Dark fixo** (`<html class="dark">`), fundo quase preto (`oklch(0.02 0 0)`).
- **Background LightPillar**: pilar de luz animado em three.js/WebGL, `fixed inset-0`
  atrás de tudo, `mix-blend-mode: screen` (por isso o dark é obrigatório — no claro
  o efeito some).
- **Disclosure progressivo no timer**: em repouso só o relógio e as pílulas de modo.
  A duração se escolhe **tocando no relógio** (popover `DurationMenu`).
- **Animações** só em `transform`/`opacity`, respeitando `prefers-reduced-motion`:
  odômetro de dígitos (`AnimatedTime`), scale+fade no popover, pulse no disco.
- **Accent por sessão**: foco=verde (OFA), pausa curta=ciano, pausa longa=índigo.
- Responsivo mobile-first: tap targets ~44px, safe-area do notch, 375px sem overflow.
