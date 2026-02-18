const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let cachedClient = null;

const getSupabaseAdmin = () => {
    if (cachedClient) {
        return cachedClient;
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return cachedClient;
};

const supabaseAdmin = new Proxy(
    {},
    {
        get(_target, property) {
            return getSupabaseAdmin()[property];
        },
    }
);

module.exports = {
    supabaseAdmin,
    getSupabaseAdmin,
};
