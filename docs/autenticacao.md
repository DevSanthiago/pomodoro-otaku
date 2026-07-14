# Autenticação e isolamento de dados

Multiusuário: **qualquer conta Google** ou **e-mail + senha**. Cada usuário só
enxerga os próprios dados.

## Quem emite o token

**A API.** Ela é a única emissora — o Google é apenas um jeito de provar identidade.

```
   ┌── e-mail/senha ──► POST /auth/login    ─┐
   │                                          ├─► JWT nosso (HS256, 7 dias)
   └── Google ────────► POST /auth/google ───┘     sub = Users.Id
                        (valida id_token do
                         Google via JWKS)
```

Por que não usar o id_token do Google direto como Bearer: com e-mail/senha no jogo,
haveria **dois emissores** e o `userId` ficaria ambíguo. Com um emissor só, todo o
resto do sistema tem uma regra única: *o dono é o `sub` do nosso JWT*.

- **Algoritmo:** HS256, chave em `JWT_SECRET`.
- **Claims:** `sub` (= `Users.Id`), `email`, `jti`, `exp`.
- **Issuer/Audience:** `pomodoro-otaku-api` / `pomodoro-otaku-web`.
- **Validade:** 7 dias.

## Fluxo no front (Auth.js v5)

`apps/web/auth.ts` tem dois providers:

- **Google** — no callback `jwt`, troca o `id_token` por um JWT nosso via
  `POST /auth/google`.
- **Credentials** — o `authorize` chama `POST /auth/login`.

O JWT da API é guardado na sessão (cookie **httpOnly**, JS não lê). O cliente pega
o token em **`GET /api/token`** (route handler que lê a sessão no servidor), cacheia
em memória e manda em `Authorization: Bearer` — ver `lib/auth/token.ts` e
`lib/api-client.ts`.

`proxy.ts` (Next 16 renomeou `middleware.ts` → **`proxy.ts`**) protege `/`, `/tasks`
e `/perfil`: sem cookie de sessão, redireciona para `/login`.

## Senhas

- **Argon2id** (`Auth/PasswordHasher.cs`): m=19 MiB, t=2, p=1, salt aleatório de 16
  bytes, hash de 32 bytes.
- Formato: `argon2id$<mem>$<iters>$<par>$<salt-b64>$<hash-b64>`. O `Verify` lê os
  parâmetros **do próprio hash** — dá para aumentar o custo no futuro sem invalidar
  as senhas antigas.
- Comparação em **tempo constante** (`FixedTimeEquals`).
- Login com e-mail inexistente **verifica um hash falso** antes de responder, para
  gastar o mesmo tempo — sem isso, dava para descobrir quem tem conta cronometrando.
- Rate limit: **10 req/min por IP** em `/auth/*`.

## Isolamento — o que realmente protege

1. A API **valida a assinatura** do JWT (não confia em nada vindo do cliente).
2. O `userId` sai da **claim `sub`**, nunca do corpo do request.
3. **Todo service filtra por `userId`**: `Where(x => x.UserId == userId)`.
4. `PUT /tasks/{id}` com id de outro dono → **400**, não sobrescreve.
5. No cliente, `ensureOwner(userId)` **limpa o IndexedDB** se outra conta logar no
   mesmo navegador — senão os dados do anterior vazariam para o novo usuário.

Verificado em teste: usuário B, mesmo sabendo o id, recebe 404/400 ao tentar ler,
sobrescrever ou apagar dados de A; token com assinatura forjada → 401.

## Contas Google + senha no mesmo e-mail

Primeiro login Google com um e-mail que já tem senha → o `GoogleSub` é **vinculado
à conta existente**. É a mesma conta, dois jeitos de entrar. Não duplica progresso.

## Limitações conhecidas (abertas)

- **Sem "esqueci minha senha" e sem verificação de e-mail** — os dois precisam de
  SMTP (Resend/SendGrid), que não está configurado. **Hoje, quem esquece a senha
  perde a conta.**
- **JWT não é revogável.** Dura 7 dias; apagar o usuário do banco **não** invalida o
  token (não há FK nem blocklist). Para revogação real: blocklist por `jti` ou
  token curto + refresh.
- **OAuth dentro do PWA instalado (iOS) não foi testado** — o redirect do Google
  pode abrir no Safari e não voltar para o app em `display: standalone`.

## Variáveis

| Env | Onde | Para quê |
|---|---|---|
| `JWT_SECRET` | API | assina/valida o JWT. **Vazou = dá para forjar token de qualquer usuário** |
| `GOOGLE_CLIENT_ID` | API | audience esperada no id_token do Google |
| `AUTH_SECRET` | Web | criptografa o cookie de sessão do Auth.js |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Web | client OAuth |

A API **lança na inicialização** se `JWT_SECRET` ou `GOOGLE_CLIENT_ID` faltarem —
melhor não subir do que subir sem conseguir validar token.
