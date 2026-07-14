# Pomodoro Otaku

PWA de Pomodoro com temática de **My Hero Academia** e gamificação: cada sessão de
foco constrói controle de **One For All**, exibido como % de Full Cowl. Tem to-do
list integrada, funciona offline e sincroniza quando a conexão volta.

- **Web:** https://pomodoro-otaku.vercel.app
- **API:** https://pomodoro-otaku-production.up.railway.app

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, Zustand |
| Offline | IndexedDB (`idb`) + fila de sincronização (outbox) |
| Backend | ASP.NET Core Minimal API (.NET 10), EF Core 10 |
| Banco | PostgreSQL (Railway) |
| Auth | Auth.js v5 no front; JWT emitido pela API (Google OAuth ou e-mail/senha) |
| Deploy | Vercel (web) · Railway (API + Postgres) |

## Monorepo

```
pomodoro-otaku/
├── apps/
│   ├── web/    Next.js — PWA, timer, tarefas, perfil
│   └── api/    ASP.NET Core — Layered + Domain
└── docs/       documentação (comece por docs/README.md)
```

## Rodando local

Pré-requisitos: Node 20+, .NET 10 SDK, acesso ao Postgres.

```bash
# API (porta 5279)
cd apps/api
dotnet user-secrets set "ConnectionStrings:Postgres" "postgresql://..."
dotnet user-secrets set "GOOGLE_CLIENT_ID" "...apps.googleusercontent.com"
dotnet user-secrets set "JWT_SECRET" "<32+ bytes aleatórios>"
ASPNETCORE_ENVIRONMENT=Development dotnet run

# Web (porta 3000)
cd apps/web
cp .env.example .env.local   # preencher os valores
npm install
npm run dev
```

⚠️ **A API não sobe sem `GOOGLE_CLIENT_ID` e `JWT_SECRET`** — ela lança na
inicialização de propósito, pra nunca subir sem conseguir validar token.

⚠️ Rodar `dotnet run` **sem** `ASPNETCORE_ENVIRONMENT=Development` faz o app cair
em `Production`, **ignorar os user-secrets** e tentar `localhost:5432`.

Outros tropeços conhecidos (rede corporativa, cache do Next) estão em
[docs/desenvolvimento.md](docs/desenvolvimento.md).

## Documentação

| Doc | Conteúdo |
|---|---|
| [docs/arquitetura.md](docs/arquitetura.md) | camadas, fluxo de dados, decisões |
| [docs/banco-de-dados.md](docs/banco-de-dados.md) | tabelas, índices, migrations |
| [docs/api.md](docs/api.md) | endpoints, DTOs, códigos de erro |
| [docs/autenticacao.md](docs/autenticacao.md) | login, JWT, isolamento por usuário |
| [docs/frontend.md](docs/frontend.md) | PWA, timer, offline, gamificação, UI |
| [docs/infraestrutura.md](docs/infraestrutura.md) | deploy, variáveis de ambiente |
| [docs/desenvolvimento.md](docs/desenvolvimento.md) | setup, workflow, gotchas |

## Convenções

- Sem comentário inline (nomes autoexplicativos); TypeScript estrito, sem `any`.
- Documentação em PT-BR; **commits em inglês** (conventional commits).
- `master` é protegida: toda mudança vai por **branch → PR → merge**.

## Licença e uso de IP

Projeto pessoal, **não-comercial**. A temática de My Hero Academia é fan-work; não
há arte oficial no repositório (o emblema One For All é original). IP de
Horikoshi/Shueisha.
