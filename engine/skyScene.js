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

            magnitude: sky.magnitude ?? null,

            phase: sky.phase ?? null,

            illumination: sky.illumination ?? null

        });

    }

    scene.bodies.sort(
        (a, b) => a.azimuth - b.azimuth
    );

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
            body: b.body,
            altitude: b.altitude,
            azimuth: b.azimuth,
            visible: b.visible
        }))
    );

    return scene;

}