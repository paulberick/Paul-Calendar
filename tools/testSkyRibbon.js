import { getSkyPosition } from "./skyGeometry.js";

const observer = {

    latitude: 39.9612,
    longitude: -82.9988,
    height: 250

};

const bodies = [

    "Sun",
    "Moon",

    "Mercury",
    "Venus",
    "Mars",

    "Jupiter",
    "Saturn"

];

const WIDTH = 80;
const HEIGHT = 24;

const canvas = Array.from(
    { length: HEIGHT },
    () => Array(WIDTH).fill(" ")
);

const symbols = {

    Sun: "☀",
    Moon: "☽",

    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",

    Jupiter: "♃",
    Saturn: "♄"

};

const now = new Date();

for (const body of bodies) {

    const p = getSkyPosition(body, now, observer);

    //
    // Horizontal position from azimuth
    //

    const x = Math.round(
        (p.azimuth / 360) * (WIDTH - 1)
    );

    //
    // Compress altitude
    //

    let y;

    if (p.altitude >= 0) {

        y = Math.round(
            (1 - p.altitude / 90) * 15
        );

    } else {

        y = 16 + Math.round(
            (-p.altitude / 90) * 7
        );

    }

    if (
        x >= 0 &&
        x < WIDTH &&
        y >= 0 &&
        y < HEIGHT
    ) {

        canvas[y][x] = symbols[body];

    }

}

//
// Horizon
//

for (let x = 0; x < WIDTH; x++)
    canvas[16][x] = "─";

//
// Print
//

console.clear();

for (const row of canvas)
    console.log(row.join(""));