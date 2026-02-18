const {
    getAllSettingsMap,
    upsertSetting,
} = require('../services/settingsService');
const { normalizeOfficeConfig } = require('../config/officeConfig');

exports.getSettings = async (req, res) => {
    try {
        const settingsMap = await getAllSettingsMap();
        return res.json(settingsMap);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch settings' });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body || {};
        if (!key) {
            return res.status(400).json({ message: 'key is required' });
        }

        const finalValue = key === 'OFFICE_CONFIG' ? normalizeOfficeConfig(value || {}) : value;
        await upsertSetting(key, finalValue);

        if (key === 'OFFICE_CONFIG') {
            const scheduler = req.app.get('scheduler');
            if (scheduler?.reschedule) {
                await scheduler.reschedule();
            }
        }

        return res.json({ key, value: finalValue });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update setting' });
    }
};
