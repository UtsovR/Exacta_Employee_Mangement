export const DEFAULT_OFFICE_CONFIG = {
    START_TIME: "10:00 AM",
    LATE_GRACE_MINUTES: 15,
    LATE_THRESHOLD: "10:15 AM",
    HALF_DAY_THRESHOLD: "1:00 PM",
    AUTO_ABSENT_TIME: "11:00 AM",
    WORK_END_TIME: "7:00 PM",
    BREAK_WINDOW: {
        START: "2:30 PM",
        END: "3:30 PM"
    }
};

export const OFFICE_CONFIG = DEFAULT_OFFICE_CONFIG;

export const ROLES = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE'
};

export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    LATE: 'late',
    HALF_DAY: 'half_day',
    ABSENT: 'absent',
    LEAVE: 'leave'
};
