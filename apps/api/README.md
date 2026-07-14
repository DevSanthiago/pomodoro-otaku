# apps/api

Backend do **Pomodoro Otaku**: ASP.NET Core Minimal API (.NET 10) + EF Core 10 +
PostgreSQL. Layered com domínio isolado.

```bash
dotnet user-secrets set "ConnectionStrings:Postgres" "postgresql://..."
dotnet user-secrets set "GOOGLE_CLIENT_ID" "...apps.googleusercontent.com"
dotnet user-secrets set "JWT_SECRET" "$(openssl rand -base64 48)"

ASPNETCORE_ENVIRONMENT=Development dotnet run   # http://localhost:5279
```

⚠️ Sem `ASPNETCORE_ENVIRONMENT=Development` o app cai em `Production`, **ignora os
user-secrets** e tenta `localhost:5432`.

⚠️ A API **não sobe** sem `JWT_SECRET` e `GOOGLE_CLIENT_ID` — lança na inicialização
de propósito.

## Estrutura

| Pasta | Papel |
|---|---|
| `Domain/` | regras **puras**, sem EF (`OneForAll`, `TaskRules`, `ContaRules`) |
| `Services/` | casos de uso; **toda query filtra por `userId`** |
| `Endpoints/` | finos — extraem o `userId` do JWT e traduzem o resultado em HTTP |
| `Auth/` | emissão/validação do JWT, hash Argon2id |
| `Data/` | `AppDbContext`, resolução da connection string |
| `Migrations/` | schema versionado (**não** roda no startup) |

- Endpoints e DTOs: [docs/api.md](../../docs/api.md)
- Schema e migrations: [docs/banco-de-dados.md](../../docs/banco-de-dados.md)
- Login e isolamento: [docs/autenticacao.md](../../docs/autenticacao.md)
