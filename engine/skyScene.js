import { getSkyPosition } from "./skyGeometry.js";
import { buildEcliptic } from "./ecliptic.js";

const BODIES = [
    { name: "Sun",      symbol: "☀" },
    { name: "Moon",     symbol: "☽" },
    { name: "Mercury",  symbol: "☿" },
    { name: "Venus",    symbol: "♀" },
    { name: "Mars",     symbol: "♂" },
    { name: "Jupiter",  symbol: "♃" },
    { name: "Saturn",   symbol: "♄" }
];


function angularSeparation(alt1, az1, alt2, az2) {
    // Convert to radians
    const a1 = alt1 * Math.PI / 180;
    const a2 = alt2 * Math.PI / 180;
    const dAz = (az1 - az2) * Math.PI / 180;

    // Spherical law of cosines
    const cosSep = Math.sin(a1) * Math.sin(a2) +
                   Math.cos(a1) * Math.cos(a2) * Math.cos(dAz);

    return Math.acos(Math.min(1, Math.max(-1, cosSep))) * 180 / Math.PI;
}



export function buildSkyScene(time, observer) {

    const scene = {

        time,

        observer,

        bodies: [],

        curves: [],

        overlays: [],

        metadata: {

            generated: new Date()

        }

    };

    //--------------------------------------------------
    // Celestial Bodies
    //--------------------------------------------------

    for (const body of BODIES) {

        const sky = getSkyPosition(
            body.name,
            time,
            observer
        );

        if (!sky.visible)
            continue;

        scene.bodies.push({
            id: body.name.toLowerCase(),
            name: body.name,
            symbol: body.symbol,
            altitude: sky.altitude,
            azimuth: sky.azimuth,
            visible: true,
            magnitude: sky.magnitude,
            phase: sky.phase,
            phaseAngle: sky.phaseAngle,
            phaseName: sky.phaseName,
            illumination: sky.illumination,
            zodiac: sky.zodiac,
            zodiacDegree: sky.zodiacDegree
        });

    }

    scene.bodies.sort(
        (a, b) => a.azimuth - b.azimuth
    );

//Grok below:

//--------------------------------------------------
// Conjunctions (bodies within 7°)
//--------------------------------------------------
const CONJUNCTION_THRESHOLD = 7.0; // degrees

scene.conjunctions = [];

for (let i = 0; i < scene.bodies.length; i++) {
    for (let j = i + 1; j < scene.bodies.length; j++) {
        const a = scene.bodies[i];
        const b = scene.bodies[j];

        const sep = angularSeparation(
            a.altitude, a.azimuth,
            b.altitude, b.azimuth
        );

        if (sep <= CONJUNCTION_THRESHOLD) {
            scene.conjunctions.push({
                id: `${a.id}-${b.id}`,
                bodies: [a, b],
                separation: sep,
                // midpoint for rendering
                altitude: (a.altitude + b.altitude) / 2,
                azimuth:  (a.azimuth  + b.azimuth)  / 2
            });
        }
    }
}








    //--------------------------------------------------
    // Sky Curves
    //--------------------------------------------------

    scene.curves.push({

        id: "ecliptic",

        name: "Ecliptic",

        color: "#ffe8a3",

        width: 1,

        opacity: 0.30,

        points: buildEcliptic(
            time,
            observer
        )

    });

    console.log(
        scene.bodies.map(b => ({
            name: b.name,
            altitude: b.altitude?.toFixed(1),
            azimuth:  b.azimuth?.toFixed(1),
            phase:    b.phaseName ?? null,
            illum:    b.illumination
        }))
    );

    return scene;

}