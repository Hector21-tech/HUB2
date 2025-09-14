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
  - `countries.ts` → Complete world countries database (195+ countries) for nationality selection, scout locations, etc.
  - Includes search functions and ISO country codes for reusability across features
- Global UI components (buttons, modals, etc.) go in `/components/ui`.
  - `SearchableSelect.tsx` → Reusable dropdown with real-time search, keyboard navigation, and glassmorphism styling

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

---

## 📋 Development Progress Status

### ✅ Completed - Steg 1: Initial Project Setup
- **Project Foundation:** ✅ Complete Next.js 14 setup med TypeScript, Tailwind CSS, Prisma
- **Folder Structure:** ✅ Modulär arkitektur enligt CLAUDE.md standarder
- **Multi-Tenant Architecture:** ✅ [tenant] dynamic routing, middleware för auth validation
- **Database Schema:** ✅ Komplett Prisma schema med multi-tenant struktur och RLS support
- **Core Components:** ✅ Navigation, dashboard komponenter, shadcn/ui setup
- **Git Repository:** ✅ Initial commit och push till GitHub (Hector21-tech/HUB2)

### ✅ Completed - Steg 2: Supabase Configuration  
- **Environment Setup:** ✅ Kompletta Supabase credentials konfigurerade
- **URL Corrections:** ✅ Fixad typo i project reference (latgzpdzxsrkiihfxfvn)
- **Database URLs:** ✅ Korrekta PostgreSQL connection strings

### ✅ Completed - Steg 3: Supabase Integration & Database Setup
- **Database Connection:** ✅ Successful connection via Vercel pooler (port 6543)
- **Schema Migration:** ✅ All 7 tables created (tenants, users, tenant_memberships, players, requests, trials, calendar_events)
- **Row Level Security:** ✅ RLS enabled on all tables with basic policies
- **CRUD Testing:** ✅ Full Prisma integration verified with test API endpoints
- **Seed Data:** ✅ Complete test data created (Test Scout Hub, sample players, trials)

### 🎯 Next Steps - Frontend Development
1. **Authentication Setup** med Supabase Auth integration
2. **Dashboard Components** för tenant management
3. **Player Management** interface med CRUD operations
4. **Scout Request** workflow implementation
5. **Calendar Integration** för trials och events

### 🔧 Project Credentials
- **Supabase Project:** wjwgwzxdgjtwwrnvsltp (corrected)
- **GitHub Repo:** Hector21-tech/HUB2
- **Database:** PostgreSQL via Supabase med RLS support
- **Framework:** Next.js 14 med App Router och TypeScript
- **Production URL:** https://hub2-seven.vercel.app
- **Test APIs:** /api/migrate, /api/setup-rls, /api/test-crud

## Databastabeller

- **tenants** – Tenant-hantering (multi-tenant)  
- **users** – Användarkonton  
- **tenant_memberships** – Koppling user ↔ tenant med roller  
- **players** – Spelarinformation  
- **requests** – Scout-requests från klubbar  
- **trials** – Trial sessions & utvärderingar  
- **calendar_events** – Kalenderhändelser  

## Viktiga Enums

- **TenantRole** – OWNER, ADMIN, MANAGER, SCOUT, VIEWER  
- **Priority** – LOW, MEDIUM, HIGH, URGENT  
- **RequestStatus** – OPEN, IN_PROGRESS, COMPLETED, CANCELLED  
- **TrialStatus** – SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW  
- **EventType** – TRIAL, MEETING, MATCH, TRAINING, SCOUTING, OTHER  


