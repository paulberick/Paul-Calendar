// Run: node tests/paulmanacEvents.test.mjs
// The dashboard's five upcoming events must always include the next
// solar event (solstice, equinox, or solar eclipse), in date order.
import { getPaulDate } from "../engine/calendarEngine.js";

let failures = 0;

function dayStamp(date) {
    if (date instanceof Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    return String(date).slice(0, 10);
}

function titles(events) {
    return events.map(e => `${dayStamp(e.date)} ${e.title}`);
}

function eq(label, got, want) {
    const ok = Object.is(got, want);
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}

function deepEq(label, got, want) {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${label}:\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`);
}

function listOn(year, monthIndex, day) {
    return getPaulDate(new Date(year, monthIndex, day)).paulmanac;
}

function assertChronological(label, events) {
    const days = events.map(e => dayStamp(e.date));
    const sorted = [...days].sort();
    eq(`${label} is chronological`, days.join("|"), sorted.join("|"));
}

function assertHasSolar(label, events, date, titlePart) {
    const hit = events.find(e =>
        dayStamp(e.date) === date && String(e.title).toLowerCase().includes(titlePart.toLowerCase())
    );
    eq(`${label} includes ${date} ${titlePart}`, Boolean(hit), true);
    const solarCount = events.filter(e =>
        /solstice|equinox|solar\s+eclipse/i.test(e.title) ||
        ["solstice", "equinox", "solar-eclipse"].includes(e.type)
    ).length;
    eq(`${label} has exactly one guaranteed solar slot (may be 1+)`, solarCount >= 1, true);
}

// Nov 25, 2026: five nearer sky events would otherwise hide the Dec 21 solstice.
const nov25 = listOn(2026, 10, 25);
eq("Nov 25 2026 length", nov25.length, 5);
deepEq("Nov 25 2026 list", titles(nov25), [
    "2026-11-30 Moon meets Mars",
    "2026-11-30 Moon meets Jupiter",
    "2026-11-30 Triple: Jupiter + Mars + Moon",
    "2026-12-05 Moon meets Venus",
    "2026-12-21 Winter Solstice",
]);
assertChronological("Nov 25 2026", nov25);
eq("Nov 25 2026 has no Geminids (dropped 5th)", nov25.some(e => /geminids/i.test(e.title)), false);
eq("Nov 25 2026 solstice not duplicated", nov25.filter(e => /winter solstice/i.test(e.title)).length, 1);

// On the solstice itself it still appears, once, as the first item.
const dec21 = listOn(2026, 11, 21);
eq("Dec 21 2026 first is Winter Solstice", `${dec21[0].date.slice(0, 10)} ${dec21[0].title}`, "2026-12-21 Winter Solstice");
eq("Dec 21 2026 no duplicate solstice", dec21.filter(e => /solstice|equinox/i.test(e.title)).length, 1);
eq("Dec 21 2026 length", dec21.length, 5);

// The day after, the next solar event is the Feb 6 2027 annular eclipse
// (sooner than the March equinox).
const dec22 = listOn(2026, 11, 22);
eq("Dec 22 2026 length", dec22.length, 5);
deepEq("Dec 22 2026 list", titles(dec22), [
    "2026-12-23 Spirit Moon",
    "2026-12-27 Moon meets Jupiter",
    "2026-12-28 Moon meets Mars",
    "2026-12-28 Triple: Jupiter + Mars + Moon",
    "2027-02-06 annular Solar Eclipse",
]);
assertHasSolar("Dec 22 2026", dec22, "2027-02-06", "Solar Eclipse");
eq("Dec 22 2026 does not list the later equinox", dec22.some(e => /equinox/i.test(e.title)), false);
assertChronological("Dec 22 2026", dec22);

// Feb 1, 2027: the eclipse is already in the natural top 5, so the list is unchanged.
const feb1 = listOn(2027, 1, 1);
deepEq("Feb 1 2027 list (eclipse already in top 5)", titles(feb1), [
    "2027-02-02 Moon meets Venus",
    "2027-02-06 annular Solar Eclipse",
    "2027-02-10 Moon meets Saturn",
    "2027-02-20 Crow Moon",
    "2027-02-20 penumbral Lunar Eclipse",
]);

// Feb 7, 2027: next solar is the March 20 Spring Equinox, not the August eclipse.
const feb7 = listOn(2027, 1, 7);
eq("Feb 7 2027 length", feb7.length, 5);
assertHasSolar("Feb 7 2027", feb7, "2027-03-20", "Spring Equinox");
eq("Feb 7 2027 does not list the later August eclipse", feb7.some(e => /eclipse/i.test(e.title) && /solar/i.test(e.title)), false);
assertChronological("Feb 7 2027", feb7);

// Sep 1, 2026: Autumn Equinox is already in the natural top 5 (Eastern date Sep 22, not UTC Sep 23).
const sep1 = listOn(2026, 8, 1);
assertHasSolar("Sep 1 2026", sep1, "2026-09-22", "Autumn Equinox");
eq("Sep 1 2026 no UTC-day duplicate", sep1.filter(e => /equinox/i.test(e.title)).length, 1);
eq("Sep 1 2026 length", sep1.length, 5);

// Jun 1, 2026: Summer Solstice is more than five events out and must be inserted.
const jun1 = listOn(2026, 5, 1);
eq("Jun 1 2026 length", jun1.length, 5);
assertHasSolar("Jun 1 2026", jun1, "2026-06-21", "Summer Solstice");
assertChronological("Jun 1 2026", jun1);

if (failures) {
    console.log(`\n${failures} failure(s)`);
    process.exit(1);
}
console.log("\nall paulmanac event list checks passed");
