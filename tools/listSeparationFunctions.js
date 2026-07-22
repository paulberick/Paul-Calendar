import * as Astronomy from "astronomy-engine";

for (const name of Object.keys(Astronomy).sort()) {

    if (
        name.toLowerCase().includes("angle") ||
        name.toLowerCase().includes("separation") ||
        name.toLowerCase().includes("distance") ||
        name.toLowerCase().includes("elong")
    ) {
        console.log(name);
    }

}