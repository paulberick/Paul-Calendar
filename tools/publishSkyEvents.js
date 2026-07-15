import fs from "node:fs/promises";

const SOURCE = "./data/skyEvents.json";
const OUTPUT = "./engine/skyEvents.js";

const HEADER = `//==========================================================
//
// PAULMANAC SKY EVENTS
//
// Generated automatically.
// Do not edit by hand.
//
//==========================================================

`;

async function main() {

    console.log("Loading sky events...");

    const text = await fs.readFile(SOURCE, "utf8");

    const events = JSON.parse(text);

    if (!Array.isArray(events)) {
        throw new Error("skyEvents.json must contain an array.");
    }

    //--------------------------------------------------
    // Sort everything first
    //--------------------------------------------------

    events.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    //--------------------------------------------------
    // Validation
    //--------------------------------------------------

    const grouped = {};
    const seen = new Set();

    for (const event of events) {

        if (!event.date)
            throw new Error("Event missing date.");

        if (!event.title)
            throw new Error("Event missing title.");

        if (!event.icon)
            throw new Error("Event missing icon.");

        if (!event.type)
            throw new Error("Event missing type.");

        if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date))
            throw new Error(
                `Invalid date format: ${event.date}`
            );

        const key = `${event.date}|${event.title}`;

        if (seen.has(key)) {
            throw new Error(
                `Duplicate event: ${key}`
            );
        }

        seen.add(key);

        const year = event.date.substring(0, 4);

        if (!grouped[year]) {
            grouped[year] = [];
        }

        grouped[year].push({
            type: event.type,
            icon: event.icon,
            title: event.title,
            date: event.date
        });

    }

    //--------------------------------------------------
    // Order years
    //--------------------------------------------------

    const ordered = {};

    Object.keys(grouped)
        .sort()
        .forEach(year => {

            ordered[year] = grouped[year];

        });

    //--------------------------------------------------
    // Write engine file
    //--------------------------------------------------

    const output =
        HEADER +
        "export const SKY_EVENTS = " +
        JSON.stringify(ordered, null, 4) +
        ";\n";

    await fs.writeFile(
        OUTPUT,
        output,
        "utf8"
    );

    console.log("✓ skyEvents.js created");

}

main().catch(err => {

    console.error(err);

    process.exit(1);

});