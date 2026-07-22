import fs from "node:fs/promises";

import {

    MakeTime,

    SearchLunarEclipse,

    SearchGlobalSolarEclipse

} from "astronomy-engine";

const START = MakeTime(new Date("2026-01-01T00:00:00Z"));
const END_YEAR = 2051;

const rows = [

    "date,type,title,description"

];

let time = START;

//--------------------------------------
// Lunar Eclipses
//--------------------------------------

while (time.date.getUTCFullYear() < END_YEAR) {

    const eclipse = SearchLunarEclipse(time);

    if (!eclipse)
        break;

    rows.push(

        `${eclipse.peak.date.toISOString().slice(0,10)},` +
        `lunar-eclipse,` +
        `${eclipse.kind} Lunar Eclipse,` +
        `Watch Earth's shadow slowly cross the Moon.`

    );

    time = eclipse.peak.AddDays(1);

}

//--------------------------------------
// Solar Eclipses
//--------------------------------------

time = START;

while (time.date.getUTCFullYear() < END_YEAR) {

    const eclipse = SearchGlobalSolarEclipse(time);

    if (!eclipse)
        break;

    rows.push(

        `${eclipse.peak.date.toISOString().slice(0,10)},` +
        `solar-eclipse,` +
        `${eclipse.kind} Solar Eclipse,` +
        `The Moon briefly hides the Sun.`

    );

    time = eclipse.peak.AddDays(1);

}

rows.sort();

await fs.writeFile(

    "./imports/eclipses.csv",

    rows.join("\n"),

    "utf8"

);

console.log(

    `✓ ${rows.length-1} eclipses written.`

);