import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function requireAdmin() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("admin_users").select("id").eq("id", user.id).single();
    return data ? user : null;
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find((b) => b.name === "uploads")) {
            await supabase.storage.createBucket("uploads", {
                public: true,
            });
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `pages/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("uploads")
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        // Save to media_assets table
        await supabase.from("media_assets").insert({
            url: publicUrl,
            filename: file.name,
            type: file.type,
            size: file.size,
            metadata: {
                path: filePath,
            }
        });

        return NextResponse.json({ url: publicUrl });
    } catch (error: unknown) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: (error as Error).message || "Upload failed" }, { status: 500 });
    }
}
