const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const requireEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required env var: ${key}`);
    }
    return value;
};

const safeJson = async (response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (_error) {
        return text;
    }
};

const summarizePayload = (payload) => {
    if (Array.isArray(payload)) {
        return `array(length=${payload.length})`;
    }

    if (payload && typeof payload === 'object') {
        return `object(keys=${Object.keys(payload).join(',')})`;
    }

    return String(payload);
};

const main = async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || requireEnv('SUPABASE_URL');
    const supabaseAnonKey = requireEnv('VITE_SUPABASE_ANON_KEY');
    const adminEmail = requireEnv('VERIFY_ADMIN_EMAIL');
    const adminPassword = requireEnv('VERIFY_ADMIN_PASSWORD');
    const expectedRole = (process.env.VERIFY_EXPECTED_ROLE || 'ADMIN').toUpperCase();
    const backendUrl = process.env.VERIFY_BACKEND_URL || 'http://localhost:5000';
    const adminEndpoint = process.env.VERIFY_ADMIN_ENDPOINT || '/api/users';

    const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    const loginResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: adminEmail,
            password: adminPassword,
        }),
    });

    const loginPayload = await safeJson(loginResponse);
    if (!loginResponse.ok) {
        throw new Error(
            `Supabase login failed (${loginResponse.status}): ${JSON.stringify(loginPayload)}`
        );
    }

    const accessToken = loginPayload?.access_token;
    const userId = loginPayload?.user?.id;
    if (!accessToken || !userId) {
        throw new Error('Supabase login succeeded but no access token/user id was returned.');
    }

    const profileUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(
        userId
    )}&select=id,email,role,emp_id`;
    const profileResponse = await fetch(profileUrl, {
        headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const profilePayload = await safeJson(profileResponse);
    if (!profileResponse.ok) {
        throw new Error(
            `Supabase profiles query failed (${profileResponse.status}): ${JSON.stringify(profilePayload)}`
        );
    }

    const profile = Array.isArray(profilePayload) ? profilePayload[0] : null;
    const profileRole =
        (profile?.role && String(profile.role).trim().toUpperCase()) || '(missing)';

    if (profileRole !== expectedRole) {
        throw new Error(
            `Profile role mismatch. Expected ${expectedRole}, got ${profileRole}.`
        );
    }

    const backendResponse = await fetch(`${backendUrl}${adminEndpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const backendPayload = await safeJson(backendResponse);
    if (!backendResponse.ok) {
        throw new Error(
            `Backend admin call failed (${backendResponse.status}): ${JSON.stringify(backendPayload)}`
        );
    }

    console.log('Admin flow verification passed.');
    console.log(`- Supabase login: OK (${adminEmail})`);
    console.log(`- Profile role: ${profileRole}`);
    console.log(`- Backend admin API: ${adminEndpoint} -> ${backendResponse.status}`);
    console.log(`- Payload summary: ${summarizePayload(backendPayload)}`);
};

main().catch((error) => {
    console.error('Admin flow verification failed.');
    console.error(error.message || error);
    process.exit(1);
});
