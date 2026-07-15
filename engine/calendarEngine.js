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

function findCurrentMoon(calendarDate, solarYear){

    const moons =
        yearData(solarYear).fullMoons;

    let current = null;

    for(const moon of moons){

        if(compareDates(
            calendarDate,
            moon.date
        ) >= 0){

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


const moon = findCurrentMoon(
    calendarDate,
    solarYear
);

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

	const nextSolar =
    next(SOLAR_EVENTS[solarYear]);

    const nextFullMoon =
        next(FULL_MOONS[solarYear]);

    const nextNewMoon =
        next(NEW_MOONS[solarYear]);

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
    next(FULL_MOONS[solarYear]);

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
// UPCOMING EVENTS
//==========================================================

function getUpcomingEvents(currentDate, solarYear){

    const events = [];

    const today = new Date(currentDate);
    today.setHours(0,0,0,0);

    function add(icon, title, date){

        if(!date) return;

        const d = new Date(date);
        d.setHours(0,0,0,0);

        if(d < today) return;

        events.push({

            icon,
            title,
            date

        });

    }

    //------------------------------------------------------
    // Solar Events
    //------------------------------------------------------

    for(const event of SOLAR_EVENTS[solarYear]){

        add(

            "☀",

            event.type,

            event.date

        );

    }

    //------------------------------------------------------
    // Lunar Events
    //------------------------------------------------------

    for(const moon of NEW_MOONS[solarYear]){

        add(

            "🌙",

            "New Moon",

            moon.date

        );

    }

    //------------------------------------------------------
    // Paulmanac Events
    //------------------------------------------------------

    for(const moon of FULL_MOONS[solarYear]){

        add(

            "📖",

            `${moon.name} Moon Begins`,

            moon.date

        );

    }

    //------------------------------------------------------

    events.sort(

        (a,b)=>

            new Date(a.date)-new Date(b.date)

    );

    return events.slice(0,6);

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

    upcoming:getUpcomingEvents(

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