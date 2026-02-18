const prisma = require('../prisma');
const {
    cloneDefaultOfficeConfig,
    normalizeOfficeConfig,
} = require('../config/officeConfig');

const parseSettingValue = (rawValue) => {
    if (typeof rawValue !== 'string') {
        return rawValue;
    }

    try {
        return JSON.parse(rawValue);
    } catch (_error) {
        return rawValue;
    }
};

const serializeSettingValue = (value) => {
    if (typeof value === 'string') {
        return value;
    }

    return JSON.stringify(value);
};

const upsertSetting = async (key, value) => {
    const stringValue = serializeSettingValue(value);
    return prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
    });
};

const getAllSettingsMap = async () => {
    const settings = await prisma.setting.findMany();
    const result = {};

    for (const setting of settings) {
        result[setting.key] = parseSettingValue(setting.value);
    }

    if (!result.OFFICE_CONFIG) {
        result.OFFICE_CONFIG = cloneDefaultOfficeConfig();
        await upsertSetting('OFFICE_CONFIG', result.OFFICE_CONFIG);
    } else {
        const normalized = normalizeOfficeConfig(result.OFFICE_CONFIG);
        result.OFFICE_CONFIG = normalized;
        await upsertSetting('OFFICE_CONFIG', normalized);
    }

    return result;
};

const getOfficeConfig = async () => {
    const all = await getAllSettingsMap();
    return all.OFFICE_CONFIG;
};

module.exports = {
    parseSettingValue,
    serializeSettingValue,
    upsertSetting,
    getAllSettingsMap,
    getOfficeConfig,
};
