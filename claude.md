# CLAUDE.md – Scout Hub 2 Coding Standards & Rules

## 🎯 General Principles
- Always use **descriptive variable names** (no abbreviations like `plr`, always `player` or `playerList`).
- Code must be **type-safe** (TypeScript everywhere, no `any` unless unavoidable).
- Keep **functions under 50 lines** – split into helpers if bigger.
- Never hardcode tenant, user, or auth values – always resolve from context/env.

## 🏗️ Project Structure Rules
- All code lives in `/src` with clear module boundaries:
  - `/modules/{feature}/components` → UI
  - `/modules/{feature}/services` → server/data logic
  - `/modules/{feature}/types` → shared TS types
- Shared utilities go in `/lib`.
- Global UI components (buttons, modals, etc.) go in `/components/ui`.

## 🔐 Multi-Tenant Rules
- Tenant resolution is **path-based**: `/[tenant]/...`
- No tenant resolution in middleware → only **auth validation** in middleware.
- Every DB table must include a `tenant_id`.
- All Supabase RLS policies must check both `tenant_id` and `auth.uid()` membership.
- Do not trust client input for `tenant_id` → always derive from server context.

## 🗄️ Database & ORM
- Use **Prisma** for migrations and server-side queries.
- Use **Supabase client** for auth, realtime, and lightweight client queries.
- Always scope queries with `tenant_id`.
- Add indexes on `tenant_id` + frequently queried columns.

## 👥 Roles & Permissions
- Allowed roles: `owner`, `admin`, `manager`, `scout`, `viewer`.
- RLS = tenant isolation.  
- Server guards = business logic (who can create/update/delete).
- No feature may bypass server guards or RLS.

## 🎨 UI/UX
- Tailwind + shadcn/ui only.
- Design tokens for colors, spacing, typography – no ad-hoc hex values.
- Portal-based modals only via `/components/modals`.
- Dark/light mode must be supported in all new components.

## 🔍 Testing & Validation
- Every feature must include at least one E2E test.
- Test data isolation with at least 2 tenants in seed.
- Never merge code without verifying tenant isolation.

## 🚀 Deployment
- ENV variables must be defined in `.env.local` and Vercel dashboard.
- No hardcoded secrets in code.
- Robots.txt must block indexing in Preview/Dev environments.


## Coding Standards
- Always use descriptive variable names
- No `window` globals – only ES6 imports/exports
- All DB queries must be scoped by tenant_id
- Use Node runtime for Prisma (never Edge)
- Lös aldrig problem genom att ta bort funktionalitet.
- Föreslå aldrig quickfix utan att förklara varför det bryter mot våra regler.
- Alltid Tenant-isolation via RLS, aldrig “temporär bypass”.

## 🚫 No Shortcuts
- Do not disable TypeScript checks
- Do not remove RLS to make queries work
- Do not bypass role checks
- Do not hardcode tenant_id or user_id

