# Banco de dados

PostgreSQL, hospedado no Railway (mesmo projeto da API). Acesso via EF Core 10 +
Npgsql. Schema versionado por migrations em `apps/api/Migrations/`.

## Tabelas

### `Users`

| Coluna | Tipo | Nota |
|---|---|---|
| `Id` | `uuid` PK | usado como `UserId` nas outras tabelas |
| `Email` | `varchar(255)` | **único**, sempre minúsculo |
| `NomeExibicao` | `varchar(100)` | do Google, ou derivado do e-mail |
| `SenhaHash` | `varchar(255)` **null** | `NULL` = conta só-Google. Argon2id |
| `GoogleSub` | `varchar(255)` **null** | **único**. `NULL` = conta só-senha |
| `EmailVerificado` | `boolean` | `true` só via Google (não há SMTP ainda) |
| `CriadoEm` | `timestamptz` | default `now()` |

A mesma pessoa pode ter **senha e Google na mesma linha**: no primeiro login Google
com um e-mail já cadastrado, o `GoogleSub` é vinculado ao usuário existente.

### `Tasks`

| Coluna | Tipo | Nota |
|---|---|---|
| `Id` | `uuid` PK | **gerado no cliente** (permite upsert idempotente) |
| `UserId` | `varchar(255)` | **indexado**. Dono da tarefa |
| `Titulo` | `varchar(200)` | |
| `Descricao` | `text` null | |
| `Status` | `varchar(20)` | enum como **string**: `Pendente`/`EmAndamento`/`Concluida` |
| `PomodorosEstimados` / `PomodorosCompletados` | `int` | |
| `CriadaEm` / `AtualizadaEm` | `timestamptz` | `AtualizadaEm` decide o LWW |

### `PomodoroSessions`

| Coluna | Tipo | Nota |
|---|---|---|
| `Id` | `uuid` PK | |
| `UserId` | `varchar(255)` | **indexado** |
| `TaskId` | `uuid` null | FK → `Tasks`, `ON DELETE SET NULL` |
| `Tipo` | `varchar(20)` | `Foco`/`PausaCurta`/`PausaLonga` |
| `DuracaoSegundos` | `int` | |
| `IniciadoEm` / `CompletadoEm` | `timestamptz` | |
| `FoiInterrompido` | `boolean` | |

⚠️ **Esta tabela está vazia na prática.** Os endpoints existem, mas o front **nunca
chama** `/pomodoro-sessions` — só mantém o agregado `FocosConcluidos` em `Progress`.
Não há histórico de sessão. É uma feature pela metade.

### `Progress`

| Coluna | Tipo | Nota |
|---|---|---|
| `Id` | `uuid` PK | |
| `UserId` | `varchar(255)` | **índice ÚNICO** → 1 progresso por usuário |
| `XpTotal` | `int` | fonte da verdade; `Nivel` e `PersonagemAtual` derivam dele |
| `FocosConcluidos` / `TarefasConcluidas` | `int` | |
| `Nivel` | `int` | **recalculado no servidor** a partir do XP |
| `StreakAtual` / `StreakRecorde` | `int` | |
| `UltimoDiaFoco` | `date` null | dia **local do cliente**, não UTC |
| `PersonagemAtual` | `varchar(100)` | recalculado no servidor |
| `ConquistasDesbloqueadas` | `text[]` | ids das conquistas |
| `AtualizadaEm` | `timestamptz` | decide o LWW |

## Detalhes que já causaram (ou causariam) bug

- **Enums são gravados como string**, não int (`HasConversion<string>()`), e
  serializados em **camelCase** no JSON. Mudar o nome de um valor do enum **quebra
  os dados existentes**.
- **`UserId` é `varchar`, não FK.** Não há constraint para `Users.Id`. Apagar um
  usuário **não** apaga tarefas/progresso dele, e o JWT dele continua funcionando
  até expirar. Se for implementar exclusão de conta, apague em cascata na mão.
- **`Progress.UserId` é único** — a API faz `GetOrCreate` por usuário. Não tente
  inserir uma segunda linha.
- `AtualizadaEm` tem default `now()` no banco, mas o valor que vale é o **enviado
  pelo cliente** (é ele que alimenta o last-write-wins).

## Migrations

| Migration | O que faz |
|---|---|
| `InitialCreate` | Tasks, PomodoroSessions, Progress |
| `AddTaskAtualizadaEm` | `Tasks.AtualizadaEm` (habilita o LWW) |
| `AddGamificationFields` | focos/tarefas concluídas, streak, `UltimoDiaFoco` |
| `AddUserScoping` | **apaga todas as linhas** e adiciona `UserId` + índices |
| `AddUsers` | tabela `Users` |

> `AddUserScoping` é **destrutiva de propósito**: o app era single-user com uma
> linha de `Progress` global, sem dono. A limpeza foi a decisão consciente
> ("começar limpo") em vez de backfill.

```bash
cd apps/api
dotnet ef migrations add NomeDaMigration
dotnet ef database update           # aplica no banco do user-secret
```

⚠️ A API **não roda migrate no startup**. Migration nova = aplicar na mão antes do
deploy, senão o código novo bate num schema velho.

⚠️ O design-time do EF carrega o user-secret **independente do ambiente**, então
`dotnet ef` funciona sem setar `Development` — mas `dotnet run` **não**.

⚠️ Em rede corporativa a porta do proxy do Railway costuma ser bloqueada; use
hotspot. Sintoma: `Failed to connect` / timeout na primeira query.
