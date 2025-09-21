// src/app/api/players/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireTenant } from "@/lib/server/authz";

function sbServer() {
  const cookieStore = cookies();
  return createServerClient(
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
}

export async function GET(req: Request) {
  const authz = await requireTenant({ request: req });
  if (!authz.ok) return NextResponse.json({ success: false, error: authz.message }, { status: authz.status });

  const supabase = sbServer();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("tenant_id", authz.tenantId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const authz = await requireTenant({ request: req });
  if (!authz.ok) return NextResponse.json({ success: false, error: authz.message }, { status: authz.status });

  const body = await req.json();
  const payload = { ...body, tenant_id: authz.tenantId }; // <— viktigt

  const supabase = sbServer();
  const { data, error } = await supabase.from("players").insert(payload).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}