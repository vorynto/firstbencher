import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

/**
 * Public, unauthenticated upload endpoint for the guest blogging form.
 * Deliberately mirrors /api/upload's non-admin path (own storage prefix,
 * never touches media_assets) but skips the login check entirely since
 * guest authors have no account.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (file.type && !ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image." }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find((b) => b.name === "uploads")) {
            await supabase.storage.createBucket("uploads", { public: true });
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `guest-uploads/${fileName}`;

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

        return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (error: unknown) {
        console.error("Guest upload error:", error);
        return NextResponse.json({ error: (error as Error).message || "Upload failed" }, { status: 500 });
    }
}
