# shadcn + Tailwind v4 Dashboard Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the authenticated dashboard (and its custom primitives + shell) onto shadcn/ui over a Tailwind CSS v4 upgrade, leaving the marketing/landing page visually unchanged.

**Architecture:** Upgrade Tailwind v3→v4 (CSS-first `@theme`), scaffold shadcn (`init` + `apply b2JdfX4DNg --only theme,font` so only theme/font variables seed in — no UI files overwrite the landing), then replace the custom `components/ui` + `components/shell` with shadcn primitives. ORKA brand colors are namespaced as `--color-orka-*` to avoid collisions with shadcn's semantic tokens.

**Tech Stack:** Next.js 16.2.10, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn/ui (Radix + `class-variance-authority` + `clsx` + `tailwind-merge` + `tw-animate-css`), lucide-react, `next/font`.

## Global Constraints

- Upgrade Tailwind **v3.4.17 → v4** using `@tailwindcss/postcss` (D1). Remove `autoprefixer`.
- **Landing/marketing page untouched** — do not restyle `components/{Hero,Navbar,Footer,...}`, `app/page.tsx`, landing-only CSS (D2).
- Preset base **`b2JdfX4DNg`** (violet / lucide / neutral / mira) applied with **`--only theme,font`** (D3, D7).
- Heading + body **DM Sans**; **JetBrains Mono only for financial figures** via `.tabular` (D4, D5, D6).
- ORKA colors **namespaced `--color-orka-*`** in v4 (D8) — shadcn owns `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--radius`, etc.
- No path-alias assumption in pre-shadcn code; `shadcn init` adds `@/components` + `@/lib` to `tsconfig.json`.
- Verification per task: `pnpm build` + `pnpm lint` must pass. Landing must remain visually identical.

---

### Task 1: Upgrade Tailwind v3 → v4

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/postcss.config.mjs`
- Modify: `frontend/app/globals.css` (header only; body classes retained)
- Delete: `frontend/tailwind.config.ts`
- Create: `frontend/app/globals.css` `@theme inline` block (ORKA tokens)

**Interfaces:**
- Produces: a working v4 CSS pipeline + namespaced `--color-orka-*` tokens consumable by later tasks.

- [ ] **Step 1: Update dependencies in `frontend/package.json`**

Replace the `devDependencies` Tailwind/PostCSS entries so they read:

```json
"devDependencies": {
  "@tailwindcss/postcss": "^4.1.0",
  "@types/node": "^22.10.2",
  "@types/react": "^19.0.2",
  "@types/react-dom": "^19.0.2",
  "eslint": "^9.17.0",
  "eslint-config-next": "16.2.10",
  "postcss": "^8.5.16",
  "tailwindcss": "^4.1.0",
  "typescript": "^5.7.2"
}
```

(Delete `autoprefixer` from devDependencies. Leave `overrides.postcss` as-is.)

- [ ] **Step 2: Replace `frontend/postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 3: Rewrite the top of `frontend/app/globals.css`**

Replace lines 1-3 (`@tailwind base; @tailwind components; @tailwind utilities;`) and the `:root { color-scheme; background }` block (lines 5-8) with the v4 header below. **Keep every other block verbatim** (landing classes `.display`/`.section-label`/`.cut-corner`/`.speech`/`.noise`/`.float-*`/`.icon-pulse`/`.star-wiggle`, navbar/mobile/submenu animations, AND the product system `.btn*`/`.input-field`/`.card`/`.panel`/`.status-*`/`.product-*` — those are deleted later in Task 8, not here).

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@source "../app";
@source "../components";

/* ORKA brand tokens — namespaced to avoid colliding with shadcn semantic tokens */
@theme inline {
  --color-orka-bg: #00081F;
  --color-orka-ink: #061A2B;
  --color-orka-night: #082033;
  --color-orka-paper: #fffaf2;
  --color-orka-bone: #f5efe4;
  --color-orka-orange: #ff8a22;
  --color-orka-coral: #ff4f42;
  --color-orka-violet: #9474ff;
  --color-orka-lime: #eaff35;
  --color-orka-teal: #22bd93;

  --color-orka-shell: #030914;
  --color-orka-sidebar: #06101f;
  --color-orka-panel: #0a1c2e;
  --color-orka-success: #22bd93;
  --color-orka-warning: #ff8a22;
  --color-orka-danger: #ff4f42;
  --color-orka-info: #3b82f6;
  --color-orka-border: rgba(255,255,255,0.08);
  --color-orka-muted: rgba(255,255,255,0.55);
  --color-orka-disabled: rgba(255,255,255,0.30);
  --color-orka-focus: rgba(148,116,255,0.55);
  --color-orka-hover: rgba(255,255,255,0.06);
  --color-orka-surface: #ffffff;
  --color-orka-surfaceMuted: #f7f8fc;
  --color-orka-text: #11182d;
  --color-orka-textMuted: #5f6b86;
  --color-orka-textSubtle: #8b95aa;
  --color-orka-line: #e5e8f0;

  --font-product: var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-panel: 16px;

  --shadow-hard: 8px 8px 0 #061a2b;
  --shadow-glow: 0 24px 70px rgba(234, 255, 53, 0.18);
  --shadow-product-card: 0 1px 2px rgba(16,24,40,0.03), 0 8px 24px rgba(16,24,40,0.04);
}

:root {
  color-scheme: light;
  background: #fffaf2;
}
```

- [ ] **Step 4: Delete the obsolete v3 config**

```bash
rm frontend/tailwind.config.ts
```

- [ ] **Step 5: Install deps and verify pipeline**

Run: `cd frontend && pnpm install`
Expected: resolves `@tailwindcss/postcss` + `tailwindcss@^4`, no `autoprefixer`.

- [ ] **Step 6: Build + lint to confirm v4 compiles**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: build succeeds; landing page still compiles; no `tailwind.config` resolution error.

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/postcss.config.mjs frontend/app/globals.css frontend/tailwind.config.ts
git commit -m "chore: upgrade frontend to Tailwind CSS v4 (CSS-first @theme)"
```

---

### Task 2: Scaffold shadcn/ui

**Files:**
- Create: `frontend/components.json`
- Modify: `frontend/tsconfig.json` (add `@/*` paths)
- Create: `frontend/lib/utils.ts`
- Modify: `frontend/package.json` (peer deps added by init)

**Interfaces:**
- Produces: `cn()` helper, `@/components` + `@/lib` aliases, `components.json`, installed peer deps (cva, clsx, tailwind-merge, tw-animate-css, Radix).
- Consumes: nothing from prior tasks.

- [ ] **Step 1: Run shadcn init (non-interactive defaults)**

Run: `cd frontend && pnpm dlx shadcn@latest init --base-color neutral --yes`

If `--base-color/--yes` flags are rejected by the installed version, run `pnpm dlx shadcn@latest init` and accept: style = New York or Default, base color = Neutral, CSS variables = yes, `globals.css` path = `app/globals.css`.

Expected: creates `components.json`, adds `lib/utils.ts` with `cn()`, appends `@/components` + `@/lib` paths to `tsconfig.json`, installs `class-variance-authority clsx tailwind-merge tw-animate-css lucide-react` + Radix deps.

- [ ] **Step 2: Verify `frontend/lib/utils.ts` exists with `cn()`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

If init did not create it, write the file above.

- [ ] **Step 3: Confirm `tsconfig.json` paths added**

`compilerOptions` should now contain:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./*"]
}
```

- [ ] **Step 4: Build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS. (Init may have appended shadcn base `--background`/`--primary` variables to `globals.css`; that is expected and fine — Task 3 refines the theme.)

- [ ] **Step 5: Commit**

```bash
git add frontend/components.json frontend/tsconfig.json frontend/lib/utils.ts frontend/package.json frontend/pnpm-lock.yaml
git commit -m "chore: scaffold shadcn/ui (components.json, cn util, path aliases)"
```

---

### Task 3: Apply violet theme + DM Sans font (theme,font only)

**Files:**
- Modify: `frontend/app/globals.css` (shadcn `:root`/`.dark` variable blocks seeded)
- Modify: `frontend/app/layout.tsx` (confirm DM Sans var wired to shadcn `--font-sans`)

**Interfaces:**
- Consumes: `components.json` (Task 2).
- Produces: violet `--primary` shadcn tokens + DM Sans font wiring; landing CSS untouched.

- [ ] **Step 1: Apply preset with theme+font scope only**

Run: `cd frontend && pnpm dlx shadcn@latest apply b2JdfX4DNg --only theme,font`

Expected: modifies only the shadcn CSS-variable blocks in `globals.css` (`:root` neutral/violet, `.dark`), sets `--font-sans` to DM Sans, icon set to lucide. **Does NOT overwrite component files** — landing page classes remain intact.

- [ ] **Step 2: Confirm landing classes survived**

Run: `grep -n "\.display\|\.cut-corner\|\.float-1\|\.noise" frontend/app/globals.css`
Expected: each pattern still present (landing preserved).

- [ ] **Step 3: Verify no `background:` token collision broke landing**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS; landing still compiles.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/globals.css
git commit -m "style: apply shadcn violet theme + DM Sans (theme,font only)"
```

---

### Task 4: Add JetBrains Mono for financial figures

**Files:**
- Modify: `frontend/app/layout.tsx` (add JetBrains Mono `next/font`)
- Modify: `frontend/app/globals.css` (add `.tabular` utility)

**Interfaces:**
- Consumes: `var(--font-dm-sans)` pattern from `layout.tsx`.
- Produces: `var(--font-jetbrains-mono)` + `.tabular` class for mono numbers.

- [ ] **Step 1: Add JetBrains Mono in `frontend/app/layout.tsx`**

Add import and font instance, and wire the variable onto `<html>`:

```tsx
import type { Metadata } from "next";
import { Anton, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORKA",
  description:
    "ORKA automates proposals, escrow, milestone verification, payouts, invoices, and back-office finance for global service businesses.",
  icons: {
    icon: "/Favicon.svg",
    apple: "/Favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${anton.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Add `.tabular` utility to `frontend/app/globals.css`**

Append (outside the shadcn `:root`, near the ORKA product system):

```css
/* ORKA: JetBrains Mono for financial figures (amounts, balances, hashes) */
.tabular {
  font-family: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular,
    Menlo, monospace;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/globals.css
git commit -m "feat: add JetBrains Mono for financial figures (.tabular)"
```

---

### Task 5: Add shadcn dashboard components

**Files:**
- Create: `frontend/components/ui/{button,card,input,label,badge,avatar,progress,table,dropdown-menu,dialog,tabs,separator,sheet,tooltip,sonner}.tsx` (generated)

**Interfaces:**
- Consumes: `cn()`, `@/lib` alias (Task 2).
- Produces: the component library that Task 6/7 import.

- [ ] **Step 1: Add the component set**

Run: `cd frontend && pnpm dlx shadcn@latest add button card input label badge avatar progress table dropdown-menu dialog tabs separator sheet tooltip sonner -y`

Expected: each component created under `frontend/components/ui/`. If a name differs in the installed registry, run `pnpm dlx shadcn@latest add --all` minus the marketing scope, or add individually; verify the exact files exist after.

- [ ] **Step 2: Build to confirm components compile**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS (new components compile; no duplicate-name clash with existing `ui/Button.tsx` yet — Task 6 replaces those).

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ui frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat: add shadcn dashboard components (button, card, input, ...)"
```

---

### Task 6: Replace custom UI primitives with shadcn

**Files:**
- Delete: `frontend/components/ui/{Button,Card,Input,Avatar,StatusPill,EmptyState}.tsx`
- Modify: `frontend/components/ui/ProductPrimitives.tsx` (rebuild on shadcn tokens; `StatusPill`→`badge`, `ProgressBar`→`progress`, `DataTable`→`table`)
- Modify: all importers of the deleted files (grep in Task 6 Step 1) to import from new shadcn paths.

**Interfaces:**
- Consumes: shadcn components (Task 5), `cn()`, `StatusPill`/`ProductPrimitives` API used by shell (Task 7).
- Produces: shadcn-based equivalents with the same exported names where possible.

- [ ] **Step 1: Find importers of the custom primitives**

Run: `cd frontend && rg -l "components/ui/(Button|Card|Input|Avatar|StatusPill|EmptyState|ProductPrimitives)" --glob '!components/ui/**'`
Expected: list of files (dashboard + shell) to update in Steps 3-4.

- [ ] **Step 2: Rewrite `ProductPrimitives.tsx` on shadcn tokens**

Keep the same exported component names (`ProgressBar`, `DataTable`, `Timeline`, `IconBadge`, `SummaryRow`) but implement them with shadcn primitives + ORKA `orka-*` colors. Minimal example for the status surface:

```tsx
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_TONE: Record<string, string> = {
  success: "bg-orka-success/15 text-orka-success",
  warning: "bg-orka-warning/15 text-orka-warning",
  danger: "bg-orka-danger/15 text-orka-danger",
  info: "bg-orka-info/15 text-orka-info",
  neutral: "bg-white/10 text-white/70",
};

export function StatusPill({ tone = "neutral", children }: { tone?: keyof typeof STATUS_TONE; children: React.ReactNode }) {
  return (
    <Badge className={cn("gap-1.5 font-extrabold", STATUS_TONE[tone])}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {children}
    </Badge>
  );
}
```

(Re-implement `ProgressBar` using `@/components/ui/progress` with `orka-violet`/`orka-success`/`orka-warning`/`orka-danger` fills; `DataTable` using `@/components/ui/table`; keep `Timeline`/`IconBadge`/`SummaryRow` but drop hardcoded hex in favor of `orka-*` utilities.)

- [ ] **Step 3: Update importers to new shadcn paths**

For each file from Step 1, change imports:
- `components/ui/Button` → `components/ui/button`
- `components/ui/Card` → `components/ui/card`
- `components/ui/Input` → `components/ui/input`
- `components/ui/Avatar` → `components/ui/avatar`
- `components/ui/StatusPill` → `components/ui/product-primitives` (or keep `ProductPrimitives` re-export)
- `components/ui/ProductPrimitives` → `components/ui/product-primitives`

Use kebab-case shadcn file names. Adjust usages to shadcn prop APIs (e.g. `<Button variant=...>` instead of `.btn-primary` class).

- [ ] **Step 4: Delete the now-redundant custom primitive files**

```bash
rm frontend/components/ui/Button.tsx frontend/components/ui/Card.tsx frontend/components/ui/Input.tsx frontend/components/ui/Avatar.tsx frontend/components/ui/StatusPill.tsx frontend/components/ui/EmptyState.tsx
```

(Keep `ProductPrimitives.tsx` only if refactored in Step 2; otherwise delete and re-export from a shadcn-based module.)

- [ ] **Step 5: Build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS, no unresolved imports, no `orka-*` class errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/ui
git commit -m "refactor: replace custom primitives with shadcn equivalents"
```

---

### Task 7: Migrate shell components to shadcn

**Files:**
- Modify: `frontend/components/shell/{AppShell,Sidebar,PageHeader,MobileNav,WorkspaceSwitcher,SearchField}.tsx`

**Interfaces:**
- Consumes: shadcn `button/card/input/dropdown-menu/dialog/sheet/tooltip` + `ProductPrimitives` (Task 6).
- Produces: dashboard shell rendering on shadcn primitives with ORKA violet theme.

- [ ] **Step 1: Migrate each shell file to shadcn primitives**

Per file, swap custom `.btn*`/`.card`/`.panel`/`.input-field` usage for `<Button>`, `<Card>`, `<Input>`, etc. Maps:
- `MobileNav` → `Sheet` (mobile drawer).
- `WorkspaceSwitcher` → `DropdownMenu`.
- `SearchField` → shadcn `<Input>` + lucide search icon.
- `Sidebar`/`AppShell`/`PageHeader` → `Card`/`Button` + ORKA `orka-*` surface colors.

Add `className="tabular"` to any financial figure cells (amounts, balances, percentages, hashes).

- [ ] **Step 2: Build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/shell
git commit -m "refactor: migrate dashboard shell to shadcn primitives"
```

---

### Task 8: Remove deprecated custom CSS

**Files:**
- Modify: `frontend/app/globals.css` (delete product-system blocks)

**Interfaces:**
- Consumes: Task 6/7 (no code still references `.btn*`/`.product-*`/`.status-*`/`.card`/`.panel`/`.input-field`).

- [ ] **Step 1: Confirm no references remain**

Run: `cd frontend && rg -n "\.btn|\.product-|\.status-|\.input-field|\.card\b|\.panel\b" --glob '!app/globals.css'`
Expected: no matches in `components/` or `app/` (all migrated to shadcn).

- [ ] **Step 2: Delete the product-system block from `globals.css`**

Remove lines covering `.btn*`, `.input-field`, `.card`, `.panel`, `.status-pill*`, `.product-*`, `.product-ui`, and the `:where(.btn, .input-field, .card, .panel, a)` + reduced-motion/product-contrast media queries that reference them. **Keep** all landing-only classes (`.display`, `.section-label`, `.cut-corner`, `.speech`, `.noise`, `.float-*`, `.icon-pulse`, `.star-wiggle`, navbar/mobile/submenu animations) and the `.tabular` utility.

- [ ] **Step 3: Build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS; landing unchanged.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/globals.css
git commit -m "chore: remove deprecated custom ORKA product CSS (superseded by shadcn)"
```

---

### Task 9: Final verification

**Files:** none changed.

- [ ] **Step 1: Full build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS with zero type/lint errors.

- [ ] **Step 2: Visual regression — landing identical**

Run: `cd frontend && pnpm dev` → open `http://localhost:3000`.
Expected: marketing/landing page looks **identical** to pre-migration (same fonts, colors, animations).

- [ ] **Step 3: Visual check — dashboard themed**

Navigate dashboard → projects → milestones → payments.
Expected: DM Sans headings; violet shadcn theme; financial figures (escrow amounts, milestone balances, percentages, tx hashes) render in JetBrains Mono; mobile nav (Sheet), workspace switcher (DropdownMenu), modals (Dialog) functional.

- [ ] **Step 4: Commit a verification note (if any config tweaks were needed)**

Only if Steps 1-3 required follow-up edits:
```bash
git add -A && git commit -m "fix: post-migration verification tweaks"
```
Otherwise no commit needed.
