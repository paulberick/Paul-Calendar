/**
 * ==========================================================
 * Paul's Calendar Engine
 * calendarDatabase.js
 *
 * This file is the ONLY source of astronomical truth.
 *
 * The engine NEVER calculates astronomy.
 *
 * ==========================================================
 */

import {
    parseDate,
    compareDates
} from "./dateUtils.js";
import { FULL_MOONS } from "./fullMoons.js";
import { SOLAR_EVENTS } from "./solarEvents.js";

const PAUL_MOON_NAMES = [
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

const DATABASE = {};

for (const yearKey of Object.keys(SOLAR_EVENTS)) {

    const year = Number(yearKey);

    const events = SOLAR_EVENTS[year];

    const byType = {};

    for (const event of events) {
        byType[event.type] = parseDate(event.date);
    }

    // -----------------------------
    // Build Paulmanac moons
    // -----------------------------

    const astronomicalMoons = [

        ...(FULL_MOONS[year - 1] ?? []),
    
        ...(FULL_MOONS[year] ?? []),
    
        ...(FULL_MOONS[year + 1] ?? [])
    
    ]
    .map(moon => ({
        ...moon,
        date: parseDate(moon.date)
    }))
    .sort((a, b) => a.date - b.date);
    
    const springEquinox =
        byType["Spring Equinox"];
    
        const nextYearEvents =
        SOLAR_EVENTS[Number(year) + 1];
    
    if (!nextYearEvents) {
    
        DATABASE[year] = {
            springEquinox,
            summerSolstice: byType["Summer Solstice"],
            autumnEquinox: byType["Autumn Equinox"],
            winterSolstice: byType["Winter Solstice"],
            fullMoons: []
        };
    
        continue;
    }
    
    const nextSpringEquinox =
        parseDate(
            nextYearEvents.find(
                e => e.type === "Spring Equinox"
            ).date
        );
    
    // First full moon ON OR AFTER this equinox
    const firstPaulMoon =
        astronomicalMoons.findIndex(moon =>
            compareDates(
                moon.date,
                springEquinox
            ) >= 0
        );
    
    // First full moon ON OR AFTER next equinox
    const endPaulMoon =
        astronomicalMoons.findIndex(moon =>
            compareDates(
                moon.date,
                nextSpringEquinox
            ) >= 0
        );
    
        const sliceEnd =
        endPaulMoon === -1
            ? astronomicalMoons.length
            : endPaulMoon;
    
    const paulMoons =
        astronomicalMoons
            .slice(firstPaulMoon, sliceEnd)
            .map((moon, index) => ({
    
                number: index + 1,
    
                name:
                    PAUL_MOON_NAMES[index] ??
                    `Moon ${index + 1}`,
    
                date: moon.date
    
            }));


    // -----------------------------
    // Store the year
    // -----------------------------

    DATABASE[year] = {

        springEquinox,

        summerSolstice:
            byType["Summer Solstice"],

        autumnEquinox:
            byType["Autumn Equinox"],

        winterSolstice:
            byType["Winter Solstice"],

        fullMoons: paulMoons

    };

}

export { DATABASE };