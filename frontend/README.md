# ORKA Landing Page

ORKA is a landing page for an autonomous financial operating system for global service work. The product narrative positions ORKA as a Web2-friendly platform that uses AI operations and programmable financial infrastructure to automate proposals, escrow, milestone verification, payouts, invoices, and back-office finance for agencies, freelancers, remote startups, and service marketplaces.

This repository contains the first production-ready marketing surface for ORKA: a responsive Next.js landing page with a Revento-inspired visual direction, ORKA-specific branding, and a Supabase/Resend-backed waitlist flow.

## Product Positioning

**ORKA: The Autonomous Financial Operating System for Global Service Work**

ORKA is designed to remove the administrative tax of service businesses operating across borders. Instead of stitching together proposal tools, contract templates, manual escrow, payment processors, spreadsheets, and accounting workflows, ORKA presents one connected project finance flow:

- AI-generated proposals, contracts, pricing, and milestone schedules
- Soroban-powered programmable escrow for milestone-based trust
- AI-assisted delivery verification for code, design, content, and project evidence
- Automated payouts, invoices, ledger entries, and reporting workflows
- A familiar Web2 user experience with Stellar infrastructure under the hood

## Landing Page Features

- Bold ORKA hero section with waitlist call-to-action
- Problem framing around global service work and administrative overhead
- Four-engine product explanation:
  - Agreement Engine
  - Escrow & Settlement Engine
  - Verification Engine
  - Financial Ledger
- How-it-works flow from proposal to payout
- Audience section for agencies, freelancers, startups, and marketplaces
- Oreenza dogfooding narrative for early traction
- FAQ section
- Branded 404 page
- Mock waitlist form with validation, loading, and success states

## Tech Stack

- [Next.js](https://nextjs.org/) 16 App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- ESLint with Next.js rules

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Runs the Next.js development server.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Starts the production server after a successful build.

```bash
npm run lint
```

Runs ESLint across the project.

## Project Structure

```text
app/
  globals.css      Global Tailwind styles and ORKA visual utilities
  layout.tsx       Root layout and metadata
  not-found.tsx    Branded 404 page
  page.tsx         Main landing page and waitlist form

package.json       Scripts and dependencies
tailwind.config.ts Tailwind theme colors and extensions
eslint.config.mjs  ESLint configuration
```

## Waitlist Behavior

The waitlist form posts to `app/api/waitlist/route.ts`:

- Validates that an email is present and formatted correctly
- Shows a loading state on submit
- Stores submissions in the Supabase `waitlist` table
- Sends a confirmation email through Resend
- Handles duplicate email submissions with a conflict response

Run `supabase/waitlist.sql` in Supabase, then copy `.env.example` to `.env.local` and fill in the Supabase and Resend values.

## Brand Direction

The page uses the provided Revento reference as visual inspiration only. The ORKA brand system keeps the same broad energy: dark navy hero sections, bold condensed typography, bright accent colors, chunky cards, sticker-like labels, and high-contrast calls to action.

The Revento image is not embedded as brand content.

## Deployment

This project is ready to deploy on Vercel or any platform that supports Next.js.

For Vercel:

1. Import the repository.
2. Keep the default Next.js build settings.
3. Deploy.

No environment variables are required for the current landing page.

## Roadmap

The product roadmap is tracked in the repository root at `../ROADMAP.md`.

## License

See [LICENSE](./LICENSE).
