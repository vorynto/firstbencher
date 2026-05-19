import { supabaseAdmin } from "@/lib/supabase-admin";
import GlobalCtaBarClient from "./GlobalCtaBarClient";

const DEFAULTS = {
    phone: "+1 (234) 567-8900",
    email: "info@firstbencher.com",
};

export default async function GlobalCtaBar() {
    let phone = DEFAULTS.phone;
    let email = DEFAULTS.email;

    try {
        const { data } = await supabaseAdmin
            .from("pages_content")
            .select("content")
            .eq("page_name", "site_header")
            .single();

        const content = data?.content as Record<string, unknown> | null;
        if (typeof content?.phone === "string" && content.phone) phone = content.phone;
        if (typeof content?.email === "string" && content.email) email = content.email;
    } catch {
        // fall through to defaults
    }

    return <GlobalCtaBarClient phone={phone} email={email} />;
}
