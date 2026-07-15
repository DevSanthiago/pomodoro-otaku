# API

ASP.NET Core Minimal API (.NET 10). Base local: `http://localhost:5279`.
Produção: `https://pomodoro-otaku-production.up.railway.app`.

- Todos os endpoints **exceto `/` e `/auth/*`** exigem
  `Authorization: Bearer <jwt>` (JWT emitido pela própria API — ver
  [autenticacao.md](autenticacao.md)).
- O **`userId` sai da claim `sub` do token**, nunca do corpo do request.
- JSON em **camelCase**; enums serializados como **string** camelCase
  (`pendente`, `foco`, `pausaCurta`...).
- Erro de validação = **400** com `ValidationProblem` (RFC 9110):
  `{ "errors": { "campo": ["mensagem"] } }`.

## Auth

Rate limit: **10 requisições/minuto por IP** em todo o grupo `/auth` → excedeu,
**429**.

### `POST /auth/register`
```json
{ "email": "voce@exemplo.com", "senha": "min 8 chars", "nome": "opcional" }
```
→ **200** `AuthResponse` · **400** e-mail inválido, senha curta, e-mail já cadastrado.

### `POST /auth/login`
```json
{ "email": "voce@exemplo.com", "senha": "..." }
```
→ **200** `AuthResponse` · **400** `{"credenciais": ["E-mail ou senha inválidos"]}`

> A mensagem é **genérica de propósito** (não diz se o e-mail existe) e o tempo de
> resposta é o mesmo nos dois casos — não dá para enumerar contas.

### `POST /auth/google`
```json
{ "idToken": "<id_token do Google>" }
```
A API valida o token contra o JWKS do Google (issuer + **audience = nosso
`GOOGLE_CLIENT_ID`**), cria ou vincula o usuário e devolve um JWT **nosso**.
→ **200** `AuthResponse` · **400** token inválido ou e-mail não verificado.

### `AuthResponse`
```json
{
  "token": "<jwt>",
  "expiraEm": "2026-07-21T18:36:43Z",
  "userId": "uuid",
  "email": "voce@exemplo.com",
  "nomeExibicao": "Nome"
}
```

## Tasks

| Método | Rota | Nota |
|---|---|---|
| `GET` | `/tasks` | só as do usuário do token, mais recentes primeiro |
| `GET` | `/tasks/{id}` | **404** se não existe **ou é de outro usuário** |
| `POST` | `/tasks` | `{ titulo, descricao?, pomodorosEstimados }` → **201** |
| `PUT` | `/tasks/{id}` | **upsert idempotente** (ver abaixo) |
| `DELETE` | `/tasks/{id}` | **204**, ou **404** se não é sua |

### `PUT /tasks/{id}` — o coração da sincronização

Full-resource, com o **id gerado no cliente**. É o que permite ao outbox
reenviar a fila sem duplicar nada.

```json
{
  "titulo": "Estudar",
  "descricao": null,
  "status": "concluida",
  "pomodorosEstimados": 2,
  "pomodorosCompletados": 1,
  "criadaEm": "2026-07-14T18:00:00Z",
  "atualizadaEm": "2026-07-14T18:30:00Z"
}
```

- Não existe → **cria** com esse id.
- Existe e `atualizadaEm` do corpo é **mais antiga** que a do banco → **ignora** e
  devolve a versão do servidor (guard de last-write-wins).
- Existe e **é de outro usuário** → **400** `{"id": ["Tarefa pertence a outro usuário"]}`.

## Pomodoro sessions

| Método | Rota |
|---|---|
| `GET` | `/pomodoro-sessions?taskId={id}` (filtro opcional) |
| `POST` | `/pomodoro-sessions` |

⚠️ **O front nunca chama estes endpoints** — a tabela está vazia. Existem, funcionam,
mas hoje não há histórico de sessão sendo gravado.

## Progress

| Método | Rota | Nota |
|---|---|---|
| `GET` | `/progress` | cria zerado no primeiro acesso (`GetOrCreate`) |
| `PUT` | `/progress` | upsert do progresso do usuário |

```json
{
  "xpTotal": 500,
  "focosConcluidos": 12,
  "tarefasConcluidas": 3,
  "streakAtual": 2,
  "streakRecorde": 2,
  "ultimoDiaFoco": "2026-07-14",
  "conquistasDesbloqueadas": ["primeiro-treino", "gearshift"],
  "atualizadaEm": "2026-07-14T18:40:00Z"
}
```

O servidor **ignora** `nivel` e `personagemAtual` enviados — recalcula os dois a
partir de `xpTotal` (`Domain/OneForAll`). Valores negativos são zerados. Guard de
LWW: corpo mais antigo que o banco é descartado.

## CORS

Libera `http://localhost:3000` + o que estiver em `FRONTEND_URL` (CSV). Origem fora
da lista é bloqueada pelo navegador.
