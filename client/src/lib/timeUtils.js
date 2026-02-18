import { DEFAULT_OFFICE_CONFIG } from '@/constants/config';

/**
 * Converts a time string like "10:15 AM" to minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;

    return hours * 60 + minutes;
};

/**
 * Gets current time in minutes since midnight
 */
export const getCurrentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

/**
 * Determines attendance status based on check-in time
 */
export const getAttendanceStatus = (
    checkInTimeMinutes,
    officeConfig = DEFAULT_OFFICE_CONFIG
) => {
    const lateThresholdMins = timeToMinutes(officeConfig.LATE_THRESHOLD);
    const halfDayThresholdMins = timeToMinutes(officeConfig.HALF_DAY_THRESHOLD);

    if (checkInTimeMinutes > halfDayThresholdMins) {
        return 'half_day';
    } else if (checkInTimeMinutes > lateThresholdMins) {
        return 'late';
    } else {
        return 'present';
    }
};

/**
 * Checks if current time is within the allowed mark present window (10:00 AM - 11:00 AM)
 */
export const isWithinMarkPresentWindow = (
    officeConfig = DEFAULT_OFFICE_CONFIG,
    currentMins = getCurrentMinutes()
) => {
    const startMins = timeToMinutes(officeConfig.START_TIME);
    const autoAbsentMins = timeToMinutes(officeConfig.AUTO_ABSENT_TIME);

    return currentMins >= startMins && currentMins < autoAbsentMins;
};
