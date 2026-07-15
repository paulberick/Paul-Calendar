import fs from "node:fs/promises";

const IMPORTS = "./imports";
const OUTPUT = "./data/draftSkyEvents.json";

async function readCsv(filename) {

    const text = await fs.readFile(
        `${IMPORTS}/${filename}`,
        "utf8"
    );

    const lines = text
        .split(/\r?\n/)
        .filter(line => line.trim());

    return lines.slice(1).map(line =>
        line.split(",").map(x => x.trim())
    );

}

async function main() {

    console.log("Importing sky events...");

    const events = [];

    //--------------------------------------------------
    // Meteors
    //--------------------------------------------------

    for (const row of await readCsv("meteors.csv")) {

        events.push({

            date: row[0],

            type: "meteor",

            icon: "☄",

            title: row[1],

            description: "",

            learnMore: ""

        });

    }

    //--------------------------------------------------
    // Eclipses
    //--------------------------------------------------

    for (const row of await readCsv("eclipses.csv")) {

        events.push({

            date: row[0],

            type: row[1],

            icon:
                row[1] === "solar-eclipse"
                    ? "🌞"
                    : "🌑",

            title: row[2],

            description: "",

            learnMore: ""

        });

    }

    //--------------------------------------------------
    // Conjunctions
    //--------------------------------------------------

    for (const row of await readCsv("conjunctions.csv")) {

        events.push({

            date: row[0],

            type: "conjunction",

            icon: "🪐",

            title: row[1],

            description: "",

            learnMore: ""

        });

    }

    //--------------------------------------------------
    // Comets
    //--------------------------------------------------

    for (const row of await readCsv("comets.csv")) {

        if (!row[0]) continue;

        events.push({

            date: row[0],

            type: "comet",

            icon: "☄",

            title: row[1],

            description: "",

            learnMore: ""

        });

    }

    //--------------------------------------------------
    // Sort
    //--------------------------------------------------

    events.sort(

        (a, b) =>

            new Date(a.date) -

            new Date(b.date)

    );

    //--------------------------------------------------
    // Write draft
    //--------------------------------------------------

    await fs.writeFile(

        OUTPUT,

        JSON.stringify(events, null, 4),

        "utf8"

    );

    console.log(
        `✓ Imported ${events.length} events.`
    );

}

main().catch(err => {

    console.error(err);

    process.exit(1);

});