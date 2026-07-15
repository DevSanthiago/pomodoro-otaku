# Arquitetura

Padrão: **cliente-servidor, API-centric, offline-first**. Não é MVC clássico, nem
microsserviços, nem Hexagonal completo — é **Layered com domínio isolado**,
dimensionado para um app pequeno e um dev solo.

Descartados de propósito: microsserviços (over-engineering para um domínio único) e
Hexagonal completo (boilerplate alto demais para o tamanho atual).

## Visão geral

```
┌───────────────────── apps/web (Next.js) ─────────────────────┐
│  app/ + components/     UI (só renderiza)                    │
│  stores/               Zustand (viewmodel, orquestra)        │
│  lib/*.ts              lógica PURA (timer, task, gamificação)│
│  lib/db.ts             IndexedDB (repositório local)         │
│  lib/sync/             outbox → REST                         │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS + Bearer JWT
┌──────────────────────────────▼──── apps/api (.NET) ──────────┐
│  Endpoints/            finos — traduzem resultado em HTTP    │
│  Services/             casos de uso (orquestram Domain + EF) │
│  Domain/               regras PURAS, sem EF, testáveis       │
│  Data/                 AppDbContext (EF Core)                │
└──────────────────────────────┬───────────────────────────────┘
                               │
                        PostgreSQL (Railway)
```

## Frontend — camadas tipo MVVM

- **Lógica pura** (`lib/timer-engine.ts`, `lib/task.ts`, `lib/gamification.ts`):
  funções sem efeito colateral, recebem `now` como parâmetro. É onde mora a regra.
- **Estado** (`stores/*`): Zustand. Orquestra: aplica a regra pura, grava no
  IndexedDB, enfileira sync. É o único lugar que conhece efeito colateral.
- **UI** (`components/`, `app/`): renderiza estado. Não decide regra.

## Backend — Layered + Domain

- **`Domain/`** — regras puras, **sem EF**: `OneForAll` (tiers de XP), `TaskRules`
  (validação/normalização), `ContaRules` (e-mail/senha), `OperationResult<T>`.
- **`Services/`** — casos de uso. Recebem `userId` e **filtram toda query por ele**.
- **`Endpoints/`** — finos. Extraem o `userId` do JWT, chamam o service, traduzem
  `OperationResult` em HTTP.

O EF Core já provê repository/unit-of-work — não há camada de repositório própria.

## Fluxo de dados: onde a regra roda

A regra de gamificação existe **espelhada** nos dois lados:
`lib/gamification.ts` (front) e `Domain/OneForAll.cs` (back).

- O **front** é quem concede XP (o timer roda client-side, inclusive offline).
- O **back** recalcula `Nivel` e `PersonagemAtual` a partir do `XpTotal` recebido —
  não confia no nível que o cliente mandou.
- **A fonte da verdade das regras é o código**, não esta documentação. Mudou a
  curva de XP? Mude nos dois lugares.

## Sincronização offline-first

1. Mutação → grava **IndexedDB** → enfileira operação no **outbox**.
2. `sync-engine`: **flush** (replay do outbox em ordem) → **pull** (`GET /tasks`) →
   **reconcile** (last-write-wins por `atualizadaEm`).
3. `PUT /tasks/{id}` é **upsert idempotente full-resource** com id gerado no cliente
   — por isso o replay da fila é seguro.
4. O progresso (XP) sincroniza por `PUT /progress`, também LWW.

Consequência importante: **o relógio do cliente decide o vencedor** num conflito.
Aceitável para um app single-user por conta; não seria para edição colaborativa.

## Decisões e trade-offs

| Decisão | Por quê | O que se perde |
|---|---|---|
| Front concede o XP | timer é client-side e precisa funcionar offline | cliente adulterado pode inflar XP (aceito: é single-player) |
| LWW por timestamp | simples, sem CRDT | relógio errado do cliente ganha do servidor |
| API emite o próprio JWT | e-mail/senha exige emissor próprio; unifica com Google | token não é revogável antes de expirar (7 dias) |
| Regra espelhada front/back | offline exige regra no cliente | risco de divergir se mudar só um lado |
| Sem test runner | velocidade no início | nenhuma rede de proteção automatizada |

## Onde estão as coisas

| Preciso mexer em... | Vá para |
|---|---|
| Contagem do tempo | `apps/web/lib/timer-engine.ts` (puro) |
| XP, tiers, conquistas | `apps/web/lib/gamification.ts` **e** `apps/api/Domain/OneForAll.cs` |
| Fila offline | `apps/web/lib/sync/sync-engine.ts` + `lib/db.ts` |
| Isolamento por usuário | `apps/api/Services/*` (o `Where(x => x.UserId == userId)`) |
| Login/token | `apps/web/auth.ts` + `apps/api/Auth/*` |
