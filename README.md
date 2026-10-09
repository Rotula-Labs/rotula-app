# Kolo Frontend

**Kolo is building community savings for Stellar, designed for groups that organize through WhatsApp.** This Next.js application is the web companion: a place for members to review savings circles and activity, and for administrators to monitor the platform.

The product is built around familiar community savings practices such as Ajo and Esusu. Stellar is the settlement layer Kolo plans to use for digital wallets, asset transfers, and transparent on-chain savings group operations. Soroban smart contracts are intended to enforce group contribution and payout rules; the backend coordinates those contracts with WhatsApp and the Kolo database.

## Kolo repositories

- [Frontend](https://github.com/Stellar-Kolo/kolo-frontend) — this Next.js web companion.
- [Backend](https://github.com/Stellar-Kolo/kolo-backend) — WhatsApp, account, and Stellar service orchestration.
- [Soroban contracts](https://github.com/Stellar-Kolo/kolo-contracts) — on-chain savings group rules.

## What this app contains

- Public product pages describing Kolo and its Stellar-based savings model.
- Member dashboard, savings group, and payment views.
- Administrative dashboard for reviewing platform activity.
- Next.js route handlers and service modules that are the integration points for Kolo's backend and Stellar services.

## Current integration status

This frontend is under active development. Several member dashboard views use sample data, the browser group service uses local storage for invite prototypes, and the wallet and transaction API routes are placeholders. Login and registration are demo flows. The screens should not be treated as live wallet balances, payment records, or authenticated financial actions.

The planned Stellar integration is to show wallet and transaction information supplied by Kolo's backend, and to make Soroban-backed group progress and payout status understandable to members. Signing, custody, asset selection, and transaction confirmation belong in the backend and Stellar integration design; the web UI should not imply an action succeeded until the network confirms it.

## Technology

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Vitest and Testing Library
- Stellar and Soroban integration surfaces are being developed alongside the backend; this frontend package does not currently provide a complete on-chain client.

## Local development

Requires Node.js and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project structure

- `src/app/` — App Router pages and API route handlers.
- `src/components/` — landing, authentication, dashboard, groups, payments, and admin UI.
- `src/hooks/` and `src/context/` — client-side state and data access seams.
- `src/services/` — API, Stellar, Soroban, and WhatsApp integration modules.
- `src/lib/auth/` — demo session helpers and server-side route guards.
- `src/types/` — shared application data shapes.

## Contributing

Please open an issue before starting a larger feature. For Stellar-facing work, describe which network interaction is involved, how its result is verified, and what the UI should show while a transaction is pending or fails. Never put secret keys, seed phrases, or credentials in the browser or in the repository.

See [`AGENTS.md`](AGENTS.md) for project-specific instructions. Because this project uses Next.js 16, read the installed framework documentation in `node_modules/next/dist/docs/` before changing application code.
