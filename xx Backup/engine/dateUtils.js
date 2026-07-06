/**
 * ==========================================================
 * Paul's Calendar Engine
 * dateUtils.js
 *
 * All date calculations for the engine.
 *
 * IMPORTANT:
 * The calendar engine only works with CALENDAR DATES.
 * Hours, minutes, seconds, and time zones are ignored
 * after the current Eastern date has been determined.
 * ==========================================================
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a Date object from YYYY-MM-DD
 */
export function parseDate(dateString) {

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    // Noon avoids timezone rollover issues.
    return new Date(year, month - 1, day, 12, 0, 0);

}

/**
 * Removes time from a Date object.
 */
export function startOfDay(date) {

    return new Date(

        date.getFullYear(),
        date.getMonth(),
        date.getDate()

    );

}

/**
 * Returns:
 * -1 if a < b
 *  0 if same date
 *  1 if a > b
 */
export function compareDates(a, b) {

    const aa = startOfDay(a);
    const bb = startOfDay(b);

    if (aa < bb) return -1;
    if (aa > bb) return 1;

    return 0;

}

/**
 * Whole calendar days between two dates.
 */
export function daysBetween(laterDate, earlierDate) {

    const a = startOfDay(laterDate);
    const b = startOfDay(earlierDate);

    return Math.round((a - b) / DAY_MS);

}

/**
 * Returns a NEW date.
 */
export function addDays(date, days) {

    const d = startOfDay(date);

    d.setDate(d.getDate() + days);

    return d;

}

/**
 * Returns YYYY-MM-DD
 */
export function toISODate(date) {

    const y = date.getFullYear();

    const m = String(date.getMonth() + 1)
        .padStart(2, "0");

    const d = String(date.getDate())
        .padStart(2, "0");

    return `${y}-${m}-${d}`;

}

/**
 * Developer formatting only.
 */
export function prettyDate(date) {

    return new Intl.DateTimeFormat("en-US", {

        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York"

    }).format(date);

}