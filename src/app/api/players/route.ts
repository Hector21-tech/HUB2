// src/app/api/players/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireTenant } from "@/lib/server/authz";
import { transformToDatabase, transformDatabasePlayer } from "@/lib/player-utils";

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
    .eq("tenantId", authz.tenantId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // Transform database data to frontend format
  const transformedData = data?.map(transformDatabasePlayer) || [];
  return NextResponse.json({ success: true, data: transformedData });
}

export async function POST(req: Request) {
  const authz = await requireTenant({ request: req });
  if (!authz.ok) return NextResponse.json({ success: false, error: authz.message }, { status: authz.status });

  const body = await req.json();

  // Transform frontend data to database format (auto-sanitized, no id/timestamps)
  const cleanData = transformToDatabase(body);
  const payload = { ...cleanData, tenantId: authz.tenantId }; // Server-side injection

  const supabase = sbServer();
  const { data, error } = await supabase.from("players").insert(payload).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // Transform back to frontend format
  const transformedResult = data ? transformDatabasePlayer(data) : null;
  return NextResponse.json({ success: true, data: transformedResult });
}