import { getSkyPosition } from "./skyGeometry.js";

const observer = {

    latitude: 39.9612,
    longitude: -82.9988,
    height: 250

};

const time = new Date();

const bodies = [

    "Sun",
    "Moon",

    "Mercury",
    "Venus",
    "Mars",

    "Jupiter",
    "Saturn"

];

for (const body of bodies) {

    const p = getSkyPosition(

        body,
        time,
        observer

    );

    console.log("");

    console.log(body);

    console.log(
        "Altitude:",
        p.altitude.toFixed(1)
    );

    console.log(
        "Azimuth :",
        p.azimuth.toFixed(1)
    );

    console.log(
        "Visible :",
        p.visible
    );

}