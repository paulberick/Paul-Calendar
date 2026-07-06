import fs from "node:fs/promises";

const START_YEAR = 2026;
const END_YEAR = 2050;

const TZ = "America/New_York";


const MOON_NAMES = [
    "",
    "Renewal",
    "Flower",
    "Dance",
    "Water",
    "Hot",
    "Pilgrim",
    "Love",
    "Gather",
    "Ice",
    "Spirit",
    "Bone",
    "Crow",
    "Ancestor"
];

async function fetchYear(year){

    const url =
        `https://aa.usno.navy.mil/api/moon/phases/year?year=${year}`;

    console.log(`Downloading ${year}...`);

    const response = await fetch(url);

    if(!response.ok){

        throw new Error(`Unable to fetch ${year}`);

    }

    return response.json();

}




async function fetchSeasons(year){

    const url =
        `https://aa.usno.navy.mil/api/seasons?year=${year}&tz=-5&dst=true`;

    console.log(`Downloading seasons ${year}...`);

    const response = await fetch(url);

    if(!response.ok){

        throw new Error(`Unable to fetch seasons ${year}`);

    }

    return response.json();

}




function toEastern(phase){

    const utc = new Date(
        `${phase.year}-${String(phase.month).padStart(2,"0")}-${String(phase.day).padStart(2,"0")}T${phase.time}:00Z`
    );

    const parts = new Intl.DateTimeFormat("en-US",{
        timeZone:"America/New_York",
        year:"numeric",
        month:"2-digit",
        day:"2-digit",
        hour:"2-digit",
        minute:"2-digit",
        hour12:false,
        timeZoneName:"short"
    }).formatToParts(utc);

    const get = type =>
        parts.find(p=>p.type===type).value;

    return {

        date:`${get("year")}-${get("month")}-${get("day")}`,

        time:`${get("hour")}:${get("minute")} ${get("timeZoneName")}`

    };

}




const FULL_MOONS = {};
const NEW_MOONS = {};
const QUARTERS = {};
const SOLAR_EVENTS = {};

(async () => {

    for (let year = START_YEAR; year <= END_YEAR; year++) {



const data = await fetchYear(year);
const seasons = await fetchSeasons(year);

FULL_MOONS[year] = [];
NEW_MOONS[year] = [];
QUARTERS[year] = [];
SOLAR_EVENTS[year] = [];

for (const event of seasons.data) {

    if (
        event.phenom !== "Equinox" &&
        event.phenom !== "Solstice"
    ) continue;

    let type;

    if (event.phenom === "Equinox") {

        type =
            event.month === 3
                ? "Spring Equinox"
                : "Autumn Equinox";

    } else {

        type =
            event.month === 6
                ? "Summer Solstice"
                : "Winter Solstice";

    }

    SOLAR_EVENTS[year].push({

        type,

        date:
            `${event.year}-${String(event.month).padStart(2,"0")}-${String(event.day).padStart(2,"0")}`,

        time:
            event.time
                .replace("DT","EDT")
                .replace("ST","EST")

    });

}

let moonNumber = 1;

        for (const phase of data.phasedata) {

            const entry = toEastern(phase);

            switch (phase.phase) {

                case "Full Moon":

                    FULL_MOONS[year].push({

                        number: moonNumber,

                        name: MOON_NAMES[moonNumber],

                        ...entry

                    });

                    moonNumber++;

                    break;

                case "New Moon":

                    NEW_MOONS[year].push(entry);

                    break;

                case "First Quarter":

                    QUARTERS[year].push({

                        phase: "First",

                        ...entry

                    });

                    break;

                case "Last Quarter":

                    QUARTERS[year].push({

                        phase: "Last",

                        ...entry

                    });

                    break;

            }

        }

    }




    const header = `//==========================================================
//
// PAULMANAC EPHEMERIDES
//
// Generated automatically.
// Do not edit by hand.
//
//==========================================================

`;

    await fs.writeFile(
        "./engine/fullMoons.js",
        header +
        `export const FULL_MOONS = ${JSON.stringify(FULL_MOONS, null, 4)};\n`,
        "utf8"
    );

    await fs.writeFile(
        "./engine/newMoons.js",
        header +
        `export const NEW_MOONS = ${JSON.stringify(NEW_MOONS, null, 4)};\n`,
        "utf8"
    );

    await fs.writeFile(
        "./engine/quarters.js",
        header +
        `export const QUARTERS = ${JSON.stringify(QUARTERS, null, 4)};\n`,
        "utf8"
    );



await fs.writeFile(
    "./engine/solarEvents.js",
    header +
    `export const SOLAR_EVENTS = ${JSON.stringify(SOLAR_EVENTS, null, 4)};\n`,
    "utf8"
);

console.log("✓ solarEvents.js created");



    console.log("✓ fullMoons.js created");
    console.log("✓ newMoons.js created");
    console.log("✓ quarters.js created");

})();