// src/lib/server/authz.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type Ok =
  | { ok: true; user: any; tenantId: string; tenantSlug?: string }
  | { ok: false; status: 401 | 403 | 500; message: string };

export async function requireTenant(ctx: { request: Request }): Promise<Ok> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }

  const url = new URL(ctx.request.url);
  const tenantSlug = url.searchParams.get("tenant") ?? undefined;

  const { data: memberships, error: mErr } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, tenants!inner(slug)")
    .eq("user_id", user.id);

  if (mErr) return { ok: false, status: 500, message: "Membership lookup failed" };
  if (!memberships?.length) return { ok: false, status: 403, message: "No tenant memberships" };

  let tenantId: string | undefined;

  if (tenantSlug) {
    tenantId = memberships.find((m: any) => m.tenants?.slug === tenantSlug)?.tenant_id;
  } else {
    // fallback: första membership (eller läs från user_profile.current_tenant_id om du har det)
    tenantId = memberships[0].tenant_id;
  }

  if (!tenantId) return { ok: false, status: 401, message: "Access denied to tenant" };

  return { ok: true, user, tenantId, tenantSlug };
}