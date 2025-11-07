export const APP_TIMEZONE = 'America/Bogota';

export const getTodayLocal = (): string =>
{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isToday = (dateString: string): boolean =>
{
    return dateString === getTodayLocal();
};

export const parseLocalDate = (dateString: string): Date =>
{
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const utcToLocal = (utcDate: string | Date): Date =>
{
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Date(date.getTime());
};

export const localToUTC = (dateStr: string): string =>
{
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const offset = localDate.getTimezoneOffset() * 60000;
    const utcDate = new Date(localDate.getTime() - offset);

    return utcDate.toISOString().split('T')[0];
};

export const getStartOfDayUTC = (dateString: string): string => {
    const localDate = parseLocalDate(dateString);
    localDate.setHours(0, 0, 0, 0);
    return localDate.toISOString();
};

export const getEndOfDayUTC = (dateString: string): string =>
{
    const localDate = parseLocalDate(dateString);
    localDate.setHours(23, 59, 59, 999);
    return localDate.toISOString();
};

export const formatDateLocal = (dateString: string): string =>
{
    const localDate = parseLocalDate(dateString);
    return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: APP_TIMEZONE
    }).format(localDate);
};

export const formatTimeLocal = (date: Date | string): string =>
{
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-CO", {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: APP_TIMEZONE
    }).format(dateObj);
};

export const formatDateTimeLocal = (date: Date | string): string =>
{
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: APP_TIMEZONE
    }).format(dateObj);
};

export const getMaxDate = (): string => getTodayLocal();

export const isAfter = (date1: Date | string, date2: Date | string): boolean =>
{
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return d1.getTime() > d2.getTime();
};