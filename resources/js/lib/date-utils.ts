/**
 * Utility functions for timezone conversions and datetime formatting.
 */

/**
 * Converts an ISO 8601 date string (e.g. UTC from backend "2026-09-15T12:30:00+00:00")
 * to a local `datetime-local` input value ("YYYY-MM-DDTHH:mm") in the user's browser timezone.
 */
export function formatToDatetimeLocalInput(isoDateString?: string | null): string {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts a `datetime-local` input value ("YYYY-MM-DDTHH:mm") into an ISO 8601 string with timezone offset
 * (e.g. "2026-09-15T19:30:00+07:00").
 */
export function formatDatetimeLocalToIsoWithTimezone(datetimeLocalValue?: string | null): string | null {
    if (!datetimeLocalValue || datetimeLocalValue.trim() === '') return null;
    const date = new Date(datetimeLocalValue);
    if (isNaN(date.getTime())) return null;

    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num: number) => String(Math.floor(Math.abs(num))).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const tzHours = pad(tzo / 60);
    const tzMinutes = pad(tzo % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${dif}${tzHours}:${tzMinutes}`;
}

/**
 * Formats an ISO date string into user-facing localized date string (in user timezone).
 */
export function formatUserDate(
    isoDateString?: string | null,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
): string {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, options).format(date);
}

/**
 * Formats an ISO date string into user-facing localized date & time string (in user timezone).
 */
export function formatUserDateTime(
    isoDateString?: string | null,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }
): string {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, options).format(date);
}
