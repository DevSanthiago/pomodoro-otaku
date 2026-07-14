# Desenvolvimento

## Setup

```bash
# API — porta 5279
cd apps/api
dotnet user-secrets set "ConnectionStrings:Postgres" "postgresql://..."
dotnet user-secrets set "GOOGLE_CLIENT_ID" "...apps.googleusercontent.com"
dotnet user-secrets set "JWT_SECRET" "$(openssl rand -base64 48)"
ASPNETCORE_ENVIRONMENT=Development dotnet run

# Web — porta 3000
cd apps/web
cp .env.example .env.local     # preencher
npm install
npm run dev
```

Segredo **nunca** vai pro repositório: `.env.local` e user-secrets estão fora do git.

## Workflow — a `master` é protegida

Branch protection no GitHub: PR obrigatório, histórico linear, sem force-push,
`enforce_admins` ligado (vale até para o dono).

```bash
git checkout -b feat/<nome>
# commits...
gh pr create        # self-merge liberado (0 aprovações exigidas)
```

**Nunca commitar direto na `master`** — é bloqueado.

Commits em **inglês**, conventional commits. Documentação em **PT-BR**.

## Checagens antes do PR

```bash
cd apps/web && npx tsc --noEmit && npm run lint && npm run build
cd apps/api && dotnet build
```

⚠️ **Não há test runner no repositório** — nem vitest, nem xunit. A lógica pura
(`lib/timer-engine.ts`, `lib/task.ts`, `lib/gamification.ts`, `Domain/*`) foi
isolada justamente para ser testável, mas os testes ainda não existem. Verificação
hoje é manual/E2E no navegador.

## Gotchas que já queimaram tempo

**A API cai em `Production` sem o env.** `dotnet run` sem
`ASPNETCORE_ENVIRONMENT=Development` **ignora os user-secrets** → tenta
`localhost:5432` → falha. Use o profile `http` do launchSettings ou exporte o env.

**O `dotnet ef` funciona sem isso.** O design-time carrega o user-secret independente
do ambiente — por isso a migration roda mas o `dotnet run` não.

**A rede corporativa bloqueia a porta do banco.** Timeout ao conectar no
`*.proxy.rlwy.net` não é o Railway caindo — é o firewall. Use o hotspot do iPhone.
Ver [infraestrutura.md](infraestrutura.md).

**`.next` stale entre build e dev.** Rodar `npm run build` e depois `npm run dev`
compartilha o `.next` — o dev pode servir **CSS compilado velho** (mudança no
`globals.css` não aparece; classe nova no JSX sem estilo). Apague `.next` e reinicie.

**Service worker fantasma em dev.** O SW registrado pode servir conteúdo antigo.
Em caso de comportamento inexplicável: DevTools → Application → Unregister + limpar
storage. (Ele já não cacheia `/api/` — se voltar a cachear, o login quebra.)

**Next 16 renomeou `middleware.ts` → `proxy.ts`.** Mesma função, arquivo novo. Este
projeto usa `apps/web/proxy.ts`.

**Antes de escrever código no front, leia os docs do Next 16** em
`node_modules/next/dist/docs/` — a versão tem breaking changes em relação ao que a
maioria dos exemplos da internet assume (é o que o `AGENTS.md` do `apps/web` manda).

## Dívida técnica conhecida

| Item | Onde |
|---|---|
| XP farmável (desmarcar/remarcar tarefa dá +15 toda vez) | `stores/task-store.ts` |
| Race read-modify-write entre foco e tarefa | `stores/gamification-store.ts` |
| `PomodoroSessions` nunca é gravada (sem histórico) | front não chama `/pomodoro-sessions` |
| JWT não revogável; sem FK `UserId` → `Users.Id` | `Auth/TokenIssuer.cs`, schema |
| Sem reset de senha / verificação de e-mail (falta SMTP) | `Services/AuthService.cs` |
| Sem testes automatizados | repositório inteiro |
| Sem backup do Postgres | Railway |
| Arte de personagem MHA ainda não existe (só o emblema SVG) | `components/gamification/` |
| Fluxo OAuth não testado no PWA instalado do iOS | — |
