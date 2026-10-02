// Run: node tests/moonPhase.test.mjs
// Moon emoji / phase name must follow waxing vs waning (northern hemisphere).
import * as Astronomy from "astronomy-engine";
import { getSkyPosition, moonPhaseName } from "../engine/skyGeometry.js";

let failures = 0;
function eq(label, got, want) {
    const ok = got === want;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${label}: got ${got}, want ${want}`);
}

// SkyVault.js touches no DOM at import time, but guard just in case.
const { moonEmoji } = await import("../ui/components/SkyVault.js");

// Pure bin mapping
const bins = [
    [0, "🌑", "New"], [10, "🌑", "New"], [350, "🌑", "New"],
    [45, "🌒", "Waxing Crescent"], [90, "🌓", "First Quarter"],
    [135, "🌔", "Waxing Gibbous"], [180, "🌕", "Full"],
    [225, "🌖", "Waning Gibbous"], [257.5, "🌗", "Last Quarter"],
    [270, "🌗", "Last Quarter"], [315, "🌘", "Waning Crescent"],
    [337.4, "🌘", "Waning Crescent"], [337.6, "🌑", "New"],
];
for (const [e, emoji, name] of bins) {
    eq(`emoji(${e})`, moonEmoji(e), emoji);
    eq(`name(${e})`, moonPhaseName(e), name);
}
eq("emoji(null)", moonEmoji(null), "🌕");

// Real dates via the engine (Columbus, OH)
const obs = { latitude: 39.96, longitude: -83.0, height: 0 };
const real = [
    ["2026-10-02T14:00:00Z", "🌗", "Last Quarter"],      // waning, ~257°
    ["2026-09-26T17:00:00Z", "🌕", "Full"],              // full moon Sep 26 2026
    ["2026-10-10T16:00:00Z", "🌑", "New"],               // new moon Oct 10 2026
    ["2026-10-18T16:00:00Z", "🌓", "First Quarter"],     // first quarter Oct 18 2026
];
for (const [iso, emoji, name] of real) {
    const d = new Date(iso);
    const m = getSkyPosition("Moon", d, obs);
    const e = Astronomy.MoonPhase(d);
    eq(`${iso} emoji (elong ${e.toFixed(1)}°)`, moonEmoji(m.moonPhase), emoji);
    eq(`${iso} name`, m.phaseName, name);
}

// Waxing and waning gibbous at equal illumination must differ
const wax = getSkyPosition("Moon", new Date("2026-09-22T12:00:00Z"), obs);
const wan = getSkyPosition("Moon", new Date("2026-09-30T12:00:00Z"), obs);
console.log(`     waxing ${wax.moonPhase.toFixed(1)}° ${wax.illumination}% ${moonEmoji(wax.moonPhase)} | waning ${wan.moonPhase.toFixed(1)}° ${wan.illumination}% ${moonEmoji(wan.moonPhase)}`);
eq("waxing gibbous Sep 22", moonEmoji(wax.moonPhase), "🌔");
eq("waning gibbous Sep 30", moonEmoji(wan.moonPhase), "🌖");

if (failures) { console.log(`\n${failures} failure(s)`); process.exit(1); }
console.log("\nall moon phase checks passed");
