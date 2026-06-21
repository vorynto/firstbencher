import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

/**
 * Returns the uploader's auth context, or null if not allowed to upload.
 * Admins (in admin_users) may upload and have their files added to the shared
 * media library. Regular logged-in *active* users may also upload (e.g. for
 * success-story photos) but their files are not added to the admin library.
 */
async function resolveUploader(): Promise<{ isAdmin: boolean } | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: admin } = await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
    if (admin) return { isAdmin: true };

    // Non-admin: must be an active registered user
    const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("is_active")
        .eq("id", user.id)
        .maybeSingle();
    if (profile?.is_active) return { isAdmin: false };

    return null;
}

export async function POST(request: Request) {
    const uploader = await resolveUploader();
    if (!uploader) {
        return NextResponse.json(
            { error: "You must be logged in to upload." },
            { status: 401 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (file.type && !ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Unsupported file type. Please upload an image." }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
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
        const filePath = `${uploader.isAdmin ? "pages" : "user-uploads"}/${fileName}`;

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

        // Only admins' uploads populate the shared media library.
        if (uploader.isAdmin) {
            await supabase.from("media_assets").insert({
                url: publicUrl,
                filename: file.name,
                type: file.type,
                size: file.size,
                metadata: {
                    path: filePath,
                }
            });
        }

        return NextResponse.json({ url: publicUrl });
    } catch (error: unknown) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: (error as Error).message || "Upload failed" }, { status: 500 });
    }
}
