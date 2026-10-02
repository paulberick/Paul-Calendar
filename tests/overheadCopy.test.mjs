// Run: node tests/overheadCopy.test.mjs
import { getPaulDate } from "../engine/calendarEngine.js";
import { formatOverheadCompanion } from "../engine/overheadCopy.js";

let failures = 0;
function check(label, out) {
    const bad = out && (/\+/.test(out) || /\bmeets\b|Triple/i.test(out) || repeated(out));
    if (bad) failures++;
    console.log(`${bad ? "FAIL" : "ok  "} ${label}: ${out}`);
}
function repeated(s) {
    s = s.replace(/\b\w+ Moon is full/, "");
    const bodies = s.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn)\b/g) || [];
    return new Set(bodies).size !== bodies.length;
}

// 1) The exact event sets from the screenshots
const ev = (title, date, extra = {}) => ({ title, date, ...extra });
const cases = {
    "phone 10/2 (Moon+Mars, Triple, Moon+Jupiter)": [
        ev("Moon meets Mars", "2026-10-05", { type: "conjunction" }),
        ev("Triple: Jupiter + Mars + Moon", "2026-10-05", { type: "conjunction" }),
        ev("Moon meets Jupiter", "2026-10-06", { type: "conjunction" })
    ],
    "earlier (Triple, Moon+Jupiter)": [
        ev("Triple: Jupiter + Mars + Moon", "2026-10-05"),
        ev("Moon meets Jupiter", "2026-10-06")
    ],
    "single conjunction": [ev("Moon meets Saturn", "2026-10-05")],
    "two separate groups": [
        ev("Triple: Jupiter + Mars + Moon", "2026-10-05"),
        ev("Mercury meets Venus", "2026-10-05")
    ],
    "conjunction + meteor + full moon": [
        ev("Moon meets Venus", "2026-10-05"),
        ev("Orionids", "2026-10-05"),
        ev("Bone Moon", "2026-10-05")
    ],
    "equinox": [ev("Autumn Equinox", "2026-10-05")],
    "eclipse": [ev("total Lunar Eclipse", "2026-10-05")],
    "visibleFromHome all true": [ev("Moon meets Mars", "2026-10-05", { visibleFromHome: true })],
    "visibleFromHome mixed": [
        ev("Moon meets Mars", "2026-10-05", { visibleFromHome: true }),
        ev("Orionids", "2026-10-05", { visibleFromHome: false })
    ],
    "visibleFromHome none": [ev("Orionids", "2026-10-05", { visibleFromHome: false })]
};
const day = new Date(2026, 9, 5, 9, 0);
for (const [label, paulmanac] of Object.entries(cases)) {
    check(label, formatOverheadCompanion({ paulmanac }, day));
}

// 2) Real engine data, every day Sep 13 → Oct 8 2026
console.log("\n--- real engine data ---");
for (let d = new Date(2026, 8, 13, 9); d <= new Date(2026, 9, 8, 9); d.setDate(d.getDate() + 1)) {
    const paul = getPaulDate(new Date(d));
    const out = formatOverheadCompanion(paul, new Date(d));
    check(d.toDateString(), out ?? "(no blurb)");
}

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
