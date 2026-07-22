import fs from "node:fs/promises";

import {
    Body,
    MakeTime,
    PairLongitude,
    Search
} from "astronomy-engine";

import { editConjunctions } from "./skyEditor.js";

const START = MakeTime(new Date("2026-01-01T00:00:00Z"));
const END   = MakeTime(new Date("2051-01-01T00:00:00Z"));

const STEP_DAYS = 5;

const pairs = [

    [Body.Moon,    Body.Venus],
    [Body.Moon,    Body.Mars],
    [Body.Moon,    Body.Jupiter],
    [Body.Moon,    Body.Saturn],

    [Body.Mercury, Body.Venus],
    [Body.Mercury, Body.Mars],
    [Body.Mercury, Body.Jupiter],
    [Body.Mercury, Body.Saturn],

    [Body.Venus,   Body.Mars],
    [Body.Venus,   Body.Jupiter],
    [Body.Venus,   Body.Saturn],

    [Body.Mars,    Body.Jupiter],
    [Body.Mars,    Body.Saturn],

    [Body.Jupiter, Body.Saturn]
];

function signedLongitude(body1, body2, time) {

    let angle = PairLongitude(body1, body2, time);

    if (angle > 180)
        angle -= 360;

    return angle;
}

let events = [];

for (const [body1, body2] of pairs) {

    console.log(`Searching ${body1} / ${body2}`);

    let t1 = START;

    while (t1.ut < END.ut) {

        let t2 = t1.AddDays(STEP_DAYS);

        if (t2.ut > END.ut)
            t2 = END;

        const f1 = signedLongitude(body1, body2, t1);
        const f2 = signedLongitude(body1, body2, t2);

        if (f1 < 0 && f2 >= 0) {

            const hit = Search(
                t => signedLongitude(body1, body2, t),
                t1,
                t2,
                {
                    init_f1: f1,
                    init_f2: f2
                }
            );

            if (hit) {

                events.push({

                    date: hit.date,

                    body1,
                    body2,

                    type: "conjunction",

                    title: `${body1} Meets ${body2}`,

                    description:
                        "These two worlds appear unusually close together."

                });

            }

        }

        t1 = t2;
    }
}

// <-- Paulmanac editorial decisions happen here
events = editConjunctions(events);

const rows = [

    "date,type,title,description"

];

for (const e of events) {

    rows.push(

        `${e.date.toISOString().slice(0,10)},` +
        `${e.type},` +
        `${e.title},` +
        `${e.description}`

    );

}

await fs.writeFile(

    "./imports/conjunctions.csv",

    rows.join("\n"),

    "utf8"

);

console.log(`✓ ${events.length} conjunctions published.`);