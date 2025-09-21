// src/app/api/media/avatar-proxy/route.ts
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/server/authz";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const authz = await requireTenant({ request: req });
  if (!authz.ok) return NextResponse.json({ success: false, error: authz.message }, { status: authz.status });

  const url = new URL(req.url);
  const path = url.searchParams.get("path"); // ex: players/{playerId}.jpg
  if (!path) return NextResponse.json({ success: false, error: "Missing path" }, { status: 400 });

  const objectPath = `avatars/${authz.tenantId}/${path}`;

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: signed, error } = await sb.storage.from("avatars").createSignedUrl(objectPath, 60);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const r = await fetch(signed.signedUrl);
  if (!r.ok) return NextResponse.json({ success: false, error: `Upstream ${r.status}` }, { status: 502 });

  return new NextResponse(r.body, {
    headers: {
      "Content-Type": r.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=60",
    },
  });
}