# Infraestrutura

| Peça | Onde | URL |
|---|---|---|
| Web | **Vercel** (root `apps/web`, preset Next.js) | https://pomodoro-otaku.vercel.app |
| API | **Railway** (root `apps/api`, Dockerfile) | https://pomodoro-otaku-production.up.railway.app |
| Postgres | **Railway** (mesmo projeto da API) | rede interna |
| OAuth | **Google Cloud**, projeto `pomodoro-otaku` | consent screen publicada (External) |

Os dois deploys são **automáticos no push da `master`**.

## Variáveis de ambiente

### Railway (API)

| Env | Valor | Sem ela |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (rede interna) | cai no fallback `localhost` e falha |
| `JWT_SECRET` | 32+ bytes aleatórios | **a API não sobe** |
| `GOOGLE_CLIENT_ID` | client id do Google | **a API não sobe** |
| `ASPNETCORE_ENVIRONMENT` | `Production` | — |
| `FRONTEND_URL` | `https://pomodoro-otaku.vercel.app` | CORS bloqueia o front |
| `PORT` | injetada pelo Railway | o app não escuta na porta certa |

### Vercel (web)

| Env | Valor |
|---|---|
| `AUTH_SECRET` | aleatório (`npx auth secret`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | client OAuth do Google |
| `NEXT_PUBLIC_API_URL` | URL da API no Railway |

> ⚠️ **A API lança na inicialização** se `JWT_SECRET` ou `GOOGLE_CLIENT_ID`
> faltarem. É de propósito — melhor não subir do que subir sem validar token. Mas
> significa que **mergear na `master` sem setar as envs derruba a produção.** Envs
> primeiro, deploy depois.

## Conexão com o banco

`Data/DatabaseConnection.cs` resolve, nesta ordem:
`ConnectionStrings:Postgres` (user-secrets, dev) → `DATABASE_URL` (env, Railway) →
fallback `localhost:5432`.

Converte a URI `postgres://` do Railway para o formato key-value do Npgsql, com
`SslMode.Prefer` (funciona na rede interna e no proxy público).

## Deploy da API (Docker)

`apps/api/Dockerfile`, multi-stage: `sdk:10.0` compila → `aspnet:10.0` roda.
`Program.cs` escuta na env `PORT` do Railway.

## Migrations em produção

⚠️ **A API não roda migrate no startup.** Migration nova = aplicar na mão **antes**
do deploy:

```bash
cd apps/api
dotnet ef database update    # user-secret apontando para o banco do Railway
```

Ou seja: schema primeiro, código depois. Código novo em cima de schema velho quebra.

## Rede corporativa

O proxy TCP público do Railway (`*.proxy.rlwy.net:PORTA`) fica **inalcançável na
rede da empresa** — o firewall bloqueia saída para portas de banco.

- **Sintoma:** `Failed to connect` / timeout na primeira query;
  `Test-NetConnection` retorna `False`.
- **Não é** o Railway fora do ar.
- **Solução em dev:** rotear pelo **hotspot do iPhone**.
- A API hospedada no Railway **não passa por isso** — usa a rede interna.

## Custos e riscos

- Railway na assinatura de **$5/mês** (API + Postgres). Vercel no free tier.
- 🔴 **Não há backup do Postgres.** Se o banco sumir, a única cópia é o IndexedDB de
  cada usuário — que o iOS limpa após dias sem uso. Configurar backup é a coisa mais
  barata de alto impacto pendente.
- 🔴 **Sem monitoramento/alerta.** Se a API cair, ninguém avisa.
