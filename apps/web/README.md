# apps/web

Frontend do **Pomodoro Otaku**: Next.js 16 (App Router), TypeScript, Tailwind v4,
shadcn/ui, Zustand. PWA instalável e offline-first.

```bash
cp .env.example .env.local   # preencher
npm install
npm run dev                  # http://localhost:3000
```

Precisa da API rodando em `http://localhost:5279` (ver `apps/api`).

- Visão geral e setup completo: [README raiz](../../README.md)
- Timer, offline, PWA e gamificação: [docs/frontend.md](../../docs/frontend.md)
- Login e token: [docs/autenticacao.md](../../docs/autenticacao.md)

⚠️ Esta versão do Next tem breaking changes em relação à maioria dos exemplos
existentes (ex.: `middleware.ts` virou `proxy.ts`). Leia os guias em
`node_modules/next/dist/docs/` antes de escrever código — ver `AGENTS.md`.
