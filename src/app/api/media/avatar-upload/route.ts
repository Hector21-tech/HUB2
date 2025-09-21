// src/app/api/media/avatar-upload/route.ts
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/server/authz";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const authz = await requireTenant({ request: req });
  if (!authz.ok) return NextResponse.json({ success: false, error: authz.message }, { status: authz.status });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const playerId = form.get("playerId") as string | null;
  if (!file || !playerId) return NextResponse.json({ success: false, error: "Missing file/playerId" }, { status: 400 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const path = `avatars/${authz.tenantId}/players/${playerId}.jpg`;
  const { error } = await sb.storage.from("avatars").upload(path, await file.arrayBuffer(), {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, path: `players/${playerId}.jpg` });
}