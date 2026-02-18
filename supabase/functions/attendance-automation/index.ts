import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    return new Response(
        JSON.stringify({
            success: false,
            deprecated: true,
            message:
                "attendance-automation edge function is deprecated. Use server scheduler auto-absent job.",
        }),
        {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 410,
        },
    );
});
