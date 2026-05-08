import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const OLD_HOST = "db.firstbencher.com";
const NEW_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "db.firstbencher.com";

function fixUrl(url: string): string {
  return url?.includes(OLD_HOST) ? url.replace(OLD_HOST, NEW_HOST) : url;
}

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("admin_users").select("id").eq("id", user.id).single();
  return data ? user : null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    let dbQuery = supabase
      .from("media_assets")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (query) {
      dbQuery = dbQuery.ilike("filename", `%${query}%`);
    }

    const { data, error, count } = await dbQuery;

    if (error) throw error;

    const assets = (data || []).map((a) => ({ ...a, url: fixUrl(a.url) }));

    return NextResponse.json({
      assets,
      total: count,
    });
  } catch (error: unknown) {
    console.error("Media fetch error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch media" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get asset to find storage path
    const { data: asset, error: fetchError } = await supabase
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const storagePath = asset.metadata?.path;

    // Delete from storage if path exists
    if (storagePath) {
      await supabase.storage.from("uploads").remove([storagePath]);
    }

    // Delete from DB
    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete media" },
      { status: 500 },
    );
  }
}
