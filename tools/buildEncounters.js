import { apparentSeparation } from "./astronomyUtils.js";

const BODY_PAIRS = [

    ["Moon", "Mercury"],
    ["Moon", "Venus"],
    ["Moon", "Mars"],
    ["Moon", "Jupiter"],
    ["Moon", "Saturn"],

    ["Venus", "Jupiter"],
    ["Venus", "Saturn"],

    ["Jupiter", "Saturn"]

];

const STEP_HOURS = 6;

const ENTER_THRESHOLD = 12;
const EXIT_THRESHOLD  = 13;

const START = new Date("2026-01-01T00:00:00Z");
const END   = new Date("2050-12-31T23:59:59Z");

function newEncounter(body1, body2) {

    return {

        body1,
        body2,

        startTime: null,
        peakTime: null,
        endTime: null,

        minimumSeparation: Infinity,

        samples: []

    };

}

const encounters = [];

for (const [body1, body2] of BODY_PAIRS) {

    console.log(`Scanning ${body1} ↔ ${body2}...`);

    let encounter = null;

    for (
        let time = new Date(START);
        time <= END;
        time = new Date(time.getTime() + STEP_HOURS * 3600000)
    ) {

        const separation = apparentSeparation(body1, body2, time);

        //
        // ENTER ENCOUNTER
        //

        if (encounter === null) {

            if (separation <= ENTER_THRESHOLD) {

                encounter = newEncounter(body1, body2);

                encounter.startTime = new Date(time);

            } else {

                continue;

            }

        }

        //
        // RECORD SAMPLE
        //

        encounter.samples.push({

            time: new Date(time),
            separation

        });

        //
        // TRACK PEAK
        //

        if (separation < encounter.minimumSeparation) {

            encounter.minimumSeparation = separation;
            encounter.peakTime = new Date(time);

        }

        //
        // EXIT ENCOUNTER
        //

        if (separation >= EXIT_THRESHOLD) {

            encounter.endTime = new Date(time);

            encounters.push(encounter);

            encounter = null;

        }

    }

    //
    // Handle encounter still open at end of scan
    //

    if (encounter !== null) {

        encounter.endTime = new Date(END);

        encounters.push(encounter);

    }

}

console.log("");
console.log("==========================================");
console.log(`Found ${encounters.length} encounters.`);
console.log("==========================================");

for (const e of encounters) {

    console.log("");

    console.log(`${e.body1} — ${e.body2}`);

    console.log(`Start : ${e.startTime.toISOString()}`);
    console.log(`Peak  : ${e.peakTime.toISOString()}`);
    console.log(`End   : ${e.endTime.toISOString()}`);

    console.log(
        `Minimum Separation: ${e.minimumSeparation.toFixed(2)}°`
    );

    console.log(
        `Samples: ${e.samples.length}`
    );

}