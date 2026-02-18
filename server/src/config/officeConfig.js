const DEFAULT_OFFICE_CONFIG = Object.freeze({
    START_TIME: '10:00 AM',
    LATE_GRACE_MINUTES: 15,
    LATE_THRESHOLD: '10:15 AM',
    HALF_DAY_THRESHOLD: '1:00 PM',
    AUTO_ABSENT_TIME: '11:00 AM',
    WORK_END_TIME: '7:00 PM',
    BREAK_WINDOW: {
        START: '2:30 PM',
        END: '3:30 PM',
    },
});

const cloneDefaultOfficeConfig = () =>
    JSON.parse(JSON.stringify(DEFAULT_OFFICE_CONFIG));

const normalizeOfficeConfig = (input = {}) => {
    const merged = {
        ...cloneDefaultOfficeConfig(),
        ...input,
        BREAK_WINDOW: {
            ...cloneDefaultOfficeConfig().BREAK_WINDOW,
            ...(input.BREAK_WINDOW || {}),
        },
    };

    return merged;
};

const parseTimeToMinutes = (timeStr) => {
    const [rawTime, rawModifier] = String(timeStr).trim().split(' ');
    if (!rawTime || !rawModifier) {
        throw new Error(`Invalid 12-hour time string: "${timeStr}"`);
    }

    const [rawHours, rawMinutes] = rawTime.split(':');
    let hours = Number.parseInt(rawHours, 10);
    const minutes = Number.parseInt(rawMinutes, 10);
    const modifier = rawModifier.toUpperCase();

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        minutes < 0 ||
        minutes > 59 ||
        !['AM', 'PM'].includes(modifier)
    ) {
        throw new Error(`Invalid 12-hour time string: "${timeStr}"`);
    }

    if (hours === 12) {
        hours = 0;
    }

    if (modifier === 'PM') {
        hours += 12;
    }

    return hours * 60 + minutes;
};

const timeToCronExpression = (timeStr) => {
    const totalMinutes = parseTimeToMinutes(timeStr);
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${minute} ${hour} * * *`;
};

const getIstNowParts = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const map = {};

    for (const part of parts) {
        if (part.type !== 'literal') {
            map[part.type] = part.value;
        }
    }

    return {
        year: Number.parseInt(map.year, 10),
        month: Number.parseInt(map.month, 10),
        day: Number.parseInt(map.day, 10),
        hour: Number.parseInt(map.hour, 10),
        minute: Number.parseInt(map.minute, 10),
        second: Number.parseInt(map.second, 10),
    };
};

const getIstDateString = () => {
    const { year, month, day } = getIstNowParts();
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
};

const getIstCurrentMinutes = () => {
    const { hour, minute } = getIstNowParts();
    return hour * 60 + minute;
};

module.exports = {
    DEFAULT_OFFICE_CONFIG,
    cloneDefaultOfficeConfig,
    normalizeOfficeConfig,
    parseTimeToMinutes,
    timeToCronExpression,
    getIstDateString,
    getIstCurrentMinutes,
};
