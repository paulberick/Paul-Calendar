/**
 * ==========================================================
 * Paul's Calendar Engine
 * calendarEngine.js
 *
 * Core calendar calculations.
 *
 * Version 0.2
 *
 * This engine NEVER performs astronomical calculations.
 *
 * It simply interprets the astronomical database according
 * to the rules defined in CALENDAR_SPEC.md.
 * ==========================================================
 */

import { FULL_MOONS }
from "./fullMoons.js";

import { NEW_MOONS }
from "./newMoons.js";

import { SKY_EVENTS }
from "./skyEvents.js";

import { SOLAR_EVENTS }
from "./solarEvents.js";

import { DATABASE } from "./calendarDatabase.js";

import {

    DAYS_IN_YEAR,
    WEEKDAYS

} from "./constants.js";

import {

    compareDates,
    daysBetween

} from "./dateUtils.js";


//==========================================================
// INTERNAL HELPERS
//==========================================================

function databaseYears(){

    return Object.keys(DATABASE)
        .map(Number)
        .sort((a,b)=>a-b);

}


//----------------------------------------------------------

function yearData(year){

    return DATABASE[year];

}


//----------------------------------------------------------

function nextYearData(year){

    return DATABASE[year+1];

}

function allFullMoons() {

    return databaseYears()
        .flatMap(year => yearData(year).fullMoons ?? []);

}

//==========================================================
// SOLAR YEAR
//==========================================================

function findSolarYear(calendarDate){

    const years = databaseYears();

    let current = years[0];

    for(const year of years){

        const equinox =
            yearData(year).springEquinox;

        if(compareDates(

            calendarDate,
            equinox

        ) >= 0){

            current = year;

        }

    }

    return current;

}


//==========================================================
// SOLAR DATE
//==========================================================

function getSolar(calendarDate){

    const solarYear =

        findSolarYear(calendarDate);

    const currentYear =

        yearData(solarYear);

    const followingYear =

        nextYearData(solarYear);

        if (!followingYear) {

            throw new Error(
                `No astronomical data for ${solarYear + 1}.`
            );
        
        }

    const day =

        daysBetween(

            calendarDate,

            currentYear.springEquinox

        ) + 1;

    const totalLength =

        daysBetween(

            followingYear.springEquinox,

            currentYear.springEquinox

        );

    const festDays =

        totalLength - DAYS_IN_YEAR;

    //------------------------------------------------------
    // FESTDAYS
    //------------------------------------------------------

    if(day>DAYS_IN_YEAR){

        return{

            solarYear,

            festDay:true,

            festNumber:
                day-DAYS_IN_YEAR,

            festDays,

            weekday:null,

            solarDay:null

        };

    }

    //------------------------------------------------------

    return{

        solarYear,

        festDay:false,

        festNumber:0,

        festDays,

        solarDay:day,

        weekday:

            WEEKDAYS[(day-1)%7]

    };

}



//==========================================================
// MOON HELPERS
//==========================================================

function firstRenewalMoon(year){

    const moons =

        yearData(year).fullMoons;

    return moons[0];

}



//----------------------------------------------------------

function findCurrentMoon(calendarDate) {

    let current = null;

    for (const moon of allFullMoons()) {

        if (compareDates(calendarDate, moon.date) >= 0) {
            current = moon;
        }

    }

    return current;

}

//==========================================================
// MOON ENGINE
//==========================================================

function getMoon(calendarDate, solarYear){

    const moons = yearData(solarYear).fullMoons;

    // No moon data yet?
 if (!moons || moons.length === 0) {

    return {

        number: 0,
        name: null,
        night: null,
        startDate: null

    };

}   


const moon = findCurrentMoon(calendarDate);

if (!moon) {

    return {

        number: 0,
        name: null,
        night: null,
        startDate: null

    };

}

    const night =

        daysBetween(

            calendarDate,
            moon.date

        ) + 1;

    return{

        number: moon.number ?? null,

        name:moon.name,

        night,

        startDate:moon.date

    };

}

function getNextAstronomyEvent(currentDate, solarYear){

    const today = new Date(currentDate);
    today.setHours(0,0,0,0);

    function next(list){

        if(!list) return null;

        return list.find(item=>{

            const d = new Date(item.date);
            d.setHours(0,0,0,0);

            return d >= today;

        });

    }

	const nextSolar = next([
        ...(SOLAR_EVENTS[solarYear] ?? []),
        ...(SOLAR_EVENTS[solarYear + 1] ?? [])
    ]);

    const nextFullMoon = next([
        ...(FULL_MOONS[solarYear] ?? []),
        ...(FULL_MOONS[solarYear + 1] ?? [])
    ]);

    const nextNewMoon = next([
        ...(NEW_MOONS[solarYear] ?? []),
        ...(NEW_MOONS[solarYear + 1] ?? [])
    ]);

    let nextLunar = nextFullMoon;

    if(
        nextNewMoon &&
        (
            !nextFullMoon ||
            new Date(nextNewMoon.date) <
            new Date(nextFullMoon.date)
        )
    ){

        nextLunar = {

            ...nextNewMoon,

            name:"New Moon"

        };

    }


    const nextPaulmanac =
    next(yearData(solarYear).fullMoons);

return {

    solar: nextSolar,

    lunar: nextLunar,

    paulmanac: nextPaulmanac
        ? {
            title: `${nextPaulmanac.name} Moon Begins`,
            date: nextPaulmanac.date
        }
        : null

};

}


//==========================================================
// PAULMANAC
//==========================================================

function parseLocalDay(date){

    if(!date) return null;

    if(/^\d{4}-\d{2}-\d{2}$/.test(date)){

        return new Date(...date.split("-").map((n, i) => i === 1 ? n - 1 : +n));

    }

    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d;

}

function isSolarEvent(event){

    const type = String(event.type || "").toLowerCase();
    const title = String(event.title || event.type || "");

    if(type === "lunar-eclipse" || /lunar\s+eclipse/i.test(title)){
        return false;
    }

    if(type === "solar-eclipse" || type === "solstice" || type === "equinox"){
        return true;
    }

    if(/solar\s+eclipse/i.test(title)) return true;
    if(/\b(solstice|equinox)\b/i.test(title)) return true;

    return false;

}

function solarIconFor(title){

    const t = String(title || "").toLowerCase();

    if(t.includes("eclipse")) return "🌞";
    if(t.includes("spring") && t.includes("equinox")) return "🌸";
    if((t.includes("autumn") || t.includes("fall")) && t.includes("equinox")) return "🍂";
    if(t.includes("summer") && t.includes("solstice")) return "☀️";
    if(t.includes("winter") && t.includes("solstice")) return "❄️";
    if(t.includes("equinox")) return "🌸";
    return "☀";

}

function eventTitleKey(event){

    return String(event.title || "").toLowerCase().replace(/\s+/g, " ").trim();

}

function toDateString(date){

    const d = parseLocalDay(date);
    if(!d || Number.isNaN(d.getTime())) return null;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;

}

function seasonDedupeKey(event){

    const title = String(event.title || event.type || "").toLowerCase();
    const match = title.match(/\b(spring|summer|autumn|fall|winter)\s+(equinox|solstice)\b/);
    if(!match) return null;

    const day = parseLocalDay(event.date);
    if(!day || Number.isNaN(day.getTime())) return null;

    const season = match[1] === "fall" ? "autumn" : match[1];
    return `${day.getFullYear()}|${season}|${match[2]}`;

}

function allTableEvents(table){

    return Object.keys(table)
        .map(Number)
        .sort((a,b)=>a-b)
        .flatMap(year => table[year] ?? []);

}

function getPaulmanac(currentDate, solarYear){

    const today = new Date(currentDate);
    today.setHours(0,0,0,0);

    const events = [];
    const seenTitles = new Set();
    const seenSeasons = new Set();

    //------------------------------------------------------
    // helper
    //------------------------------------------------------

    function add(icon,title,date,extra={}){

        if(!date) return;

        // "YYYY-MM-DD" must be read as a local day; new Date("2026-10-05")
        // is UTC midnight, i.e. the evening before in the Americas, which
        // made events vanish from the list on their own day.
        // Named-moon dates arrive as Date objects (UTC instants); store a
        // local calendar day so the list stays consistent.
        const dateStr = toDateString(date);
        const d = parseLocalDay(dateStr);

        if(!dateStr || !d || Number.isNaN(d.getTime()) || d < today) return;

        const event = {
            icon,
            title,
            date: dateStr,
            ...extra
        };

        const titleKey = `${event.date}|${eventTitleKey(event)}`;
        if(seenTitles.has(titleKey)) return;

        const seasonKey = seasonDedupeKey(event);
        if(seasonKey && seenSeasons.has(seasonKey)) return;

        seenTitles.add(titleKey);
        if(seasonKey) seenSeasons.add(seasonKey);

        events.push(event);

    }

    //------------------------------------------------------
    // next moon
    //------------------------------------------------------

    const moon =
    (yearData(solarYear).fullMoons ?? []).find(m => {

        const d = parseLocalDay(m.date);

        return d && d >= today;

    });

    if(moon){

        add(

            "🌕",

            `${moon.name} Moon`,

            moon.date

        );

    }

    //------------------------------------------------------
    // solstices and equinoxes (local Eastern dates)
    // Look through the full table so a season ~3 months out is not cut off.
    //------------------------------------------------------

    for(const solar of allTableEvents(SOLAR_EVENTS)){

        const kind = /\bsolstice\b/i.test(solar.type) ? "solstice"
            : /\bequinox\b/i.test(solar.type) ? "equinox"
            : null;

        add(

            solarIconFor(solar.type),

            solar.type,

            solar.date,

            kind ? { type: kind } : {}

        );

    }

    //------------------------------------------------------
    // sky events (eclipses, meteors, conjunctions, ...)
    // Solstices/equinoxes already come from SOLAR_EVENTS, whose dates
    // follow America/New_York; the sky table can be a UTC day later.
    //------------------------------------------------------

    for(const event of allTableEvents(SKY_EVENTS)){

        if(event.type === "solstice" || event.type === "equinox") continue;

        add(
            event.icon,
            event.title,
            event.date,
            {
                type: event.type,
                windowDays: event.windowDays,
                visibleFromHome: event.visibleFromHome
            }
        );

    }

    //------------------------------------------------------

    events.sort(

        (a,b)=>

            parseLocalDay(a.date) - parseLocalDay(b.date)

    );

    const nextSolar = events.find(isSolarEvent);
    const top = events.slice(0,5);

    if(!nextSolar) return top;

    if(top.some(event =>
        event === nextSolar ||
        (event.date === nextSolar.date && eventTitleKey(event) === eventTitleKey(nextSolar)) ||
        (seasonDedupeKey(event) && seasonDedupeKey(event) === seasonDedupeKey(nextSolar))
    )){
        return top;
    }

    const kept = top.slice(0,4);
    kept.push(nextSolar);
    kept.sort((a,b)=> parseLocalDay(a.date) - parseLocalDay(b.date));
    return kept;

}

//==========================================================
// PAUL DATE
//==========================================================

export function getPaulDate(calendarDate){

    const solar =

        getSolar(calendarDate);

const moon = getMoon(
    calendarDate,
    solar.solarYear
);

return{

    solar,

    moon,

    nextEvent:getNextAstronomyEvent(

        calendarDate,

        solar.solarYear

    ),

    paulmanac:
    getPaulmanac(

        calendarDate,

        solar.solarYear

    )

};

}


//==========================================================
// DEVELOPER EXPORTS
//
// These are exported so the validation tools can
// inspect individual portions of the engine.
//==========================================================

export {

    findSolarYear,

    getSolar,

    getMoon

};