# Documentação — Pomodoro Otaku

Índice da documentação técnica. O [README raiz](../README.md) tem a visão geral e
como rodar.

| Doc | Quando ler |
|---|---|
| [arquitetura.md](arquitetura.md) | entender as camadas e por que elas são assim |
| [banco-de-dados.md](banco-de-dados.md) | mexer em tabela, índice ou migration |
| [api.md](api.md) | consumir ou alterar endpoints |
| [autenticacao.md](autenticacao.md) | mexer em login, token ou isolamento de dados |
| [frontend.md](frontend.md) | mexer em timer, offline, PWA ou gamificação |
| [infraestrutura.md](infraestrutura.md) | deploy, variáveis de ambiente, custos |
| [desenvolvimento.md](desenvolvimento.md) | subir o projeto, workflow de branch, gotchas |

## Regras que valem pra tudo

1. **O `userId` vem sempre da claim `sub` do JWT**, nunca do corpo do request. É o
   que impede um usuário de ler os dados de outro.
2. **O timer nunca conta com `setInterval` decrescente** — sempre timestamp. O iOS
   suspende PWAs em background e o contador para.
3. **Toda mutação grava local primeiro** (IndexedDB), depois sincroniza. Falha de
   rede não pode perder XP.
4. **Nada de segredo no repositório.** Local usa user-secrets (.NET) e `.env.local`
   (Next); produção usa as envs do Railway/Vercel.
