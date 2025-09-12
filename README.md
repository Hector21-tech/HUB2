# Scout Hub 2 – Multi-Tenant SaaS Platform

## 🚀 Vision
Scout Hub 2 är en enterprise-skalig, multi-tenant scoutingplattform byggd för att hantera spelardata, scout requests, provträningar och kalenderfunktioner i en säker och modern miljö.

## 🏗️ Tech Stack
- **Next.js 14 (App Router)** – server-side rendering, middleware för auth
- **TypeScript** – typ-säker utveckling
- **Supabase (Postgres + Auth + Realtime)** – databas med Row Level Security
- **Prisma** – migrations och datamodellering
- **Tailwind CSS + shadcn/ui** – UI-komponenter och styling
- **TanStack Query + Zustand** – state management
- **Vercel** – hosting och CI/CD

## 🔐 Multi-Tenant Arkitektur
- Path-baserad routing: `/[tenant]/dashboard`
- Tenant-isolation via Supabase RLS (alla tabeller har `tenant_id`)
- Roller: `owner`, `admin`, `manager`, `scout`, `viewer`
- Server guards för affärsregler, RLS för dataskydd

## 📦 Moduler
- **Dashboard** – översikt per tenant
- **Players** – spelardatabas och profiler
- **Requests** – klubbarnas scoutingbehov
- **Trials** – provträningar och utvärderingar
- **Calendar** – full kalender med alla funktioner

## 🛡️ Coding Standards
- Always use **descriptive variable names**
- Ingen hårdkodad `tenant_id` eller `user_id` → alltid från server context
- Alla queries måste skopas med `tenant_id`
- Funktioner ska vara små och fokuserade (<50 rader)
- Ingen kod får merge:as utan test för tenant isolation

## 📄 Dokumentation
Detaljerade arkitektur- och kodregler finns i `CLAUDE.md`.

---

🔧 **Status:** Repository initierat, färdigställ Vercel + Supabase konfiguration innan kodstart.
