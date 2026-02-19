const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
];

const splitOrigins = (value) => {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }
};

const getCorsOrigins = () => splitOrigins(process.env.CORS_ORIGIN || '');

module.exports = {
    validateEnv,
    getCorsOrigins,
};
