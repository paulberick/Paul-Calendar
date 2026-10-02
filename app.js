import { getPaulDate } 
from "./engine/calendarEngine.js";

import { getSkyToday }
from "./engine/skyToday.js";

import { buildSkyScene }
from "./engine/skyScene.js";

import { getSkyPosition }
from "./engine/skyGeometry.js";

import { renderSkyVault, moonEmoji } from "./ui/components/SkyVault.js";

import { formatOverheadCompanion }
from "./engine/overheadCopy.js";

/*==================================================
CURRENT DATE
==================================================*/

let currentDate = new Date();


let cachedSky = null;
let cachedSkyDate = "";
let cachedPosition = null;
let cachedGeoOk = false;

/*==================================================
NUMBER WORDS
==================================================*/

const moonWords = [
"",
"One","Two","Three","Four","Five","Six",
"Seven","Eight","Nine","Ten","Eleven",
"Twelve","Thirteen"
];

const numberWords = [
"",
"One","Two","Three","Four","Five","Six",
"Seven","Eight","Nine","Ten","Eleven",
"Twelve","Thirteen","Fourteen","Fifteen",
"Sixteen","Seventeen","Eighteen",
"Nineteen","Twenty","Twenty-One",
"Twenty-Two","Twenty-Three",
"Twenty-Four","Twenty-Five",
"Twenty-Six","Twenty-Seven",
"Twenty-Eight","Twenty-Nine",
"Thirty","Thirty-One"
];

const ordinalWords = [
"",
"First","Second","Third","Fourth","Fifth",
"Sixth","Seventh","Eighth","Ninth",
"Tenth","Eleventh","Twelfth",
"Thirteenth","Fourteenth","Fifteenth",
"Sixteenth","Seventeenth","Eighteenth",
"Nineteenth","Twentieth",
"Twenty-First","Twenty-Second",
"Twenty-Third","Twenty-Fourth",
"Twenty-Fifth","Twenty-Sixth",
"Twenty-Seventh","Twenty-Eighth",
"Twenty-Ninth",
"Thirtieth",
"Thirty-First"
];

/*==================================================
HELPERS
==================================================*/

function formatCountdown(targetDate){

    if(!targetDate)
        return "--";

    const today = new Date(currentDate);
    today.setHours(0,0,0,0);

    const target = new Date(targetDate);
    target.setHours(0,0,0,0);

    const days = Math.round(
        (target - today) / 86400000
    );

    if(days < 0)
        return "";

    if(days === 0)
        return "Tonight";

    if(days === 1)
        return "Tomorrow";

    return `${days} Days Away`;

}


/*==================================================
SKY MAP LOCATION LABEL

Shown as a chip ON the sky map so you can trust the render
is the sky over where you are. The label always describes the
coordinates the sky render actually used.
==================================================*/

const LOCATION_CACHE_KEY = "paulCalendar.skyLocation";
const DEFAULT_COORDS = { latitude: 39.9612, longitude: -82.9988 };
const DEFAULT_CITY = "Columbus, OH";

function formatCoordLabel(lat, lon) {
    const ns = lat >= 0 ? "N" : "S";
    const ew = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

// Cached city is only reused if it was resolved for roughly these coords
function readCachedCity(lat, lon) {
    try {
        const parsed = JSON.parse(localStorage.getItem(LOCATION_CACHE_KEY) || "null");
        if (!parsed?.label) return null;
        if (lat == null || lon == null) return null;
        const close =
            Math.abs(parsed.latitude - lat) < 0.15 &&
            Math.abs(parsed.longitude - lon) < 0.15;
        return close ? parsed.label : null;
    } catch {
        return null;
    }
}

function writeCachedCity(label, lat, lon) {
    try {
        localStorage.setItem(
            LOCATION_CACHE_KEY,
            JSON.stringify({ label, latitude: lat, longitude: lon, savedAt: Date.now() })
        );
    } catch {
        /* ignore quota / private mode */
    }
}

export async function reverseGeocodeCity(latitude, longitude) {
    const url =
        "https://api.bigdatacloud.net/data/reverse-geocode-client" +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        "&localityLanguage=en";

    const response = await fetch(url);
    if (!response.ok) throw new Error(`geocode ${response.status}`);

    const data = await response.json();
    const city = data.city || data.locality || null;
    const sub = String(data.principalSubdivisionCode || "").replace(/^[A-Z]+-/, "");
    // "Columbus, OH" in the US/Canada/Australia, "London, GB" elsewhere
    const region = ["US", "CA", "AU"].includes(data.countryCode) && /^[A-Z]{2,3}$/.test(sub)
        ? sub
        : data.countryCode || null;

    if (city && region) return `${city}, ${region}`;
    if (city) return city;
    if (data.countryName) return data.countryName;
    return null;
}

function setSkyLocationLabel(text, title = text) {
    const el = document.getElementById("skyLocation");
    if (!el) return;
    el.textContent = text;
    el.title = title;
}

let lastLocationKey = "";

async function updateSkyLocationLabel(position, geoOk) {
    const lat = position?.coords?.latitude;
    const lon = position?.coords?.longitude;

    if (!geoOk || lat == null || lon == null) {
        // Render fell back to the default coordinates — say so honestly.
        setSkyLocationLabel(
            `${DEFAULT_CITY} (default)`,
            "Location is off — showing the sky over Columbus, OH. Allow location to see your own sky."
        );
        return;
    }

    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    if (key === lastLocationKey) return;   // already resolved for these coords
    lastLocationKey = key;

    const cached = readCachedCity(lat, lon);
    setSkyLocationLabel(cached || "Locating…");

    try {
        const city = await reverseGeocodeCity(lat, lon);
        if (city) {
            writeCachedCity(city, lat, lon);
            setSkyLocationLabel(city, `Sky over ${city} (${formatCoordLabel(lat, lon)})`);
            return;
        }
    } catch (err) {
        console.warn("Reverse geocode failed:", err);
        lastLocationKey = "";   // retry on next refresh
    }

    if (!cached) setSkyLocationLabel(formatCoordLabel(lat, lon));
}


/*==================================================
DISPLAY
==================================================*/

function parseTodayTime(timeString) {

    if (!timeString || timeString === "—")
        return Number.MAX_SAFE_INTEGER;

    const d = new Date(`2000-01-01 ${timeString}`);

    return d.getTime();

}


async function updateDisplay(){

    const paul =
        getPaulDate(currentDate);
        console.log("PAUL:", paul);
        console.log("MOON:", paul.moon);

const todayKey = currentDate.toISOString().slice(0,10);

if (!cachedPosition) {

    try {

        cachedPosition = await new Promise(

            (resolve, reject) =>

                navigator.geolocation.getCurrentPosition(

                    resolve,

                    reject,

                    {

                        enableHighAccuracy:false,

                        maximumAge:86400000,

                        timeout:5000

                    }

                )

        );
        cachedGeoOk = true;

    }

    catch {

        cachedPosition = {

            coords:{

                latitude: DEFAULT_COORDS.latitude,

                longitude: DEFAULT_COORDS.longitude

            }

        };
        cachedGeoOk = false;

    }

}

// City / location label on sky map chrome (non-blocking refresh)
updateSkyLocationLabel(cachedPosition, cachedGeoOk);

if (!cachedSky || cachedSkyDate !== todayKey) {

    cachedSky = await getSkyToday(

        cachedPosition.coords.latitude,

        cachedPosition.coords.longitude,

        currentDate

    );

    cachedSkyDate = todayKey;

}

const sky = cachedSky;


const observer = {
    latitude: cachedPosition.coords.latitude,
    longitude: cachedPosition.coords.longitude,
    height: 250
};

const scene = buildSkyScene(
    currentDate,
    observer
);

const vault = document.getElementById("vault");

if (vault) {
    renderSkyVault(vault, scene);
}


console.log("DATE:", currentDate.toISOString());
console.log("SKY:", sky);






console.log("Golden Morning:",
    sky.goldenMorningStart,
    sky.goldenMorningEnd);

console.log("Golden Evening:",
    sky.goldenEveningStart,
    sky.goldenEveningEnd);










    const skyEvents = [
        { icon: "🌅", label: "Sunrise",     time: sky.sunrise },
        { icon: "🌙", label: "Moonrise",    time: sky.moonrise },
        { icon: "🌅", label: "Golden Hour", time: sky.goldenHour },
        { icon: "🌇", label: "Sunset",      time: sky.sunset },
        { icon: "🌘", label: "Moonset",     time: sky.moonset }
    ];
    
    // Show the next five rise/set events from now, rolling into tomorrow
    function skyTimeOn(timeString, day) {
        if (!timeString || timeString === "—") return null;
        const d = new Date(`${day.toDateString()} ${timeString}`);
        return isNaN(d.getTime()) ? null : d;
    }

    const now = new Date();
    const viewDay = new Date(currentDate);
    const nextDay = new Date(viewDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const upcomingToday = skyEvents
        .map(e => ({ ...e, when: skyTimeOn(e.time, viewDay), dayLabel: null }))
        .filter(e => e.when && e.when > now);
    const upcomingTomorrow = skyEvents
        .map(e => ({ ...e, when: skyTimeOn(e.time, nextDay), dayLabel: "tomorrow" }))
        .filter(e => e.when);
    const nextSkyEvents = [...upcomingToday, ...upcomingTomorrow]
        .sort((a, b) => a.when - b.when)
        .slice(0, 5);

    document.getElementById("todaySkyEvents").innerHTML =
        nextSkyEvents.map(event => `
            <div class="event">
                <div>
                    <div class="eventTitle">
                        ${event.icon} ${event.label}${event.dayLabel ? ` <span style="opacity:0.6;font-size:0.8em">(${event.dayLabel})</span>` : ""}
                    </div>
                    <div>${event.time}</div>
                </div>
            </div>
        `).join("");


console.log("PAUL OBJECT:", paul);

    /*------------------------------------------
    Gregorian above this is garbage.
    ------------------------------------------*/

    document.getElementById("gregorianDate").textContent =
        currentDate.toLocaleDateString(
            "en-US",
            {
                weekday:"long",
                month:"long",
                day:"numeric",
                year:"numeric"
            }
        );


document.getElementById("currentTime").textContent =
    currentDate.toLocaleTimeString(

        "en-US",

        {

            hour:"numeric",

            minute:"2-digit"

        }

    );





    /*------------------------------------------
    Solar Coordinates
    ------------------------------------------*/

    document.getElementById("solarYear").textContent =
        paul.solar.solarYear;

    if(paul.solar.festDay){

        document.getElementById("solarDay").textContent =
            "Fest";

        document.getElementById("solarMoonNumber").textContent =
            "";

        document.getElementById("weekday").textContent =
            "Festdays";

        document.getElementById("quatrainDay").textContent =
            "Year Celebration";

    }
    else{

        const quatrain =
            Math.floor(
                (paul.solar.solarDay-1)/28
            )+1;

        const day =
            ((paul.solar.solarDay-1)%28)+1;

        document.getElementById("solarDay").textContent =
            paul.solar.solarDay;

        /* IMPORTANT:
           The label already says "Moon"
           so ONLY show "Four"
        */

        document.getElementById("solarMoonNumber").textContent =
            moonWords[
                paul.moon.number
            ];

        document.getElementById("weekday").textContent =
            paul.solar.weekday + ",";

        document.getElementById("quatrainDay").innerHTML =
            `The ${ordinalWords[day]} Day<br>of Quatrain ${moonWords[quatrain]}`;

    }

    /*------------------------------------------
    Moon
    ------------------------------------------*/

    document.getElementById("moonName").textContent =
        `${paul.moon.name} Moon`;

    /*
       No repetition.

       Water Moon

       Night Two
    */

       const companion = formatOverheadCompanion(paul, currentDate);
       const moonPhraseEl = document.getElementById("moonPhrase");

       if (paul.moon.night == null) {
           moonPhraseEl.textContent = "Moon data unavailable";
       } else if (companion) {
           moonPhraseEl.innerHTML = `
    Night ${numberWords[paul.moon.night] ?? "—"}
    <div class="overheadBlurb">
        ${companion}
    </div>
`;
       } else {
           moonPhraseEl.textContent = `Night ${numberWords[paul.moon.night]}`;
       }

       console.log("COMPANION DEBUG:", {
           companion,
           paulmanac: paul.paulmanac,
           today: currentDate.toISOString().slice(0, 10)
       });




/*------------------------------------------
Grok's Moon Thing!
------------------------------------------*/


// Moon phase even when the Moon is below the horizon
const moonBody = getSkyPosition("Moon", currentDate, observer);

const moonIconEl = document.getElementById("moonIcon");
if (moonIconEl && moonBody) {
    moonIconEl.textContent = moonEmoji(moonBody.moonPhase);
    moonIconEl.title =
        `${moonBody.phaseName ?? "Moon"} | elongation: ${moonBody.moonPhase?.toFixed(1)}° | illum: ${moonBody.illumination}%`;
} else if (moonIconEl) {
    moonIconEl.textContent = "🌕"; // fallback
}






/*------------------------------------------
Paulmanac
------------------------------------------*/

let html = "";

for (const event of paul.paulmanac) {

    html += `

    <div class="event">

        <div>

            <div class="eventTitle">

                ${event.icon} ${event.title}

            </div>

            <div class="countdown">

                ${formatCountdown(event.date)}

            </div>

        </div>

    </div>

    `;

}

document.getElementById("upcomingEvents").innerHTML =
    html;
}


/*==================================================
THE BOOK
==================================================*/

let currentAboutPage = 0;

const aboutPages = [

{
title:"Paulmanac",

art:"🌍 ☀️ 🌕",

body:`

<div class="coverQuote">

<p>

An Astronomical Calendar

in Harmony with

the Sun, Moon & Earth

</p>

</div>

<div class="coverSubtitle">

<div class="coverLarge">

Paulmanac

</div>

<div class="coverSmall">

Inspired by the Journey of Persephone

</div>

</div>

`
},

{
title:"Dedicated to Persephone",

art:"🌸",

body:`

<p>

Beautiful Persephone once danced in sunlit meadows, daughter of Demeter, goddess of the harvest. Her laughter drifted through wildflowers, and every step coaxed new blossoms from the earth. She was spring incarnate, her world a tapestry of eternal growth beneath her mother's golden gaze.

</p>

<p>

Yet beneath this splendor, the earth held shadows. Hades, lord of the underworld, beheld her radiance and longed to claim it. In a single moment, the ground split open, and he swept Persephone into the depths, her cries echoing upward as petals fell.

</p>

<p>

Time passed in the underworld, and Persephone was transformed. No longer only a maiden, she became Queen beside Hades. Though her heart longed for the world above, she came to understand the quiet beauty and solemn purpose of the realm below.

</p>

<p>

Meanwhile, Demeter's grief spread across the Earth. Crops withered, flowers faded, and winter settled over the land. At last Zeus decreed a compromise: Persephone would spend part of each year in the underworld and part with her mother upon the Earth.

</p>

<p>

Thus began the great rhythm of the seasons. When Persephone returns, spring awakens, flowers unfurl, and the world bursts into life. When she descends once more, autumn yields to winter, and the Earth rests until her return.

</p>

<p>

Paulmanac follows this rhythm. Each year begins with Persephone's return at the Spring Equinox, reminding us that every ending carries within it the promise of renewal.

</p>

`
},
{
title:"Why Paulmanac Exists",

art:"🌍",

body:`

<p>

Every day, countless systems compete for our attention.

Notifications, deadlines, schedules, and endless streams of information ask us to look downward—toward our devices, our obligations, and the clocks that measure them.

</p>

<p>

<b>Other apps say, "Look at me."</b>

</p>

<p>

<b>Paulmanac quietly says, "🌅 Look up."</b>

</p>

<p>

It is not a replacement for the Gregorian calendar.

It is a companion.

A gentle reminder that another rhythm has always existed alongside the one we created.

</p>

<p>

The Sun still marks the seasons.

<br>

The Moon still keeps her ancient cycle.

<br>

The Earth still carries us through space.

</p>

<p>

If this calendar helps you pause, breathe, step outside, or simply remember where you are beneath the sky...

then it has fulfilled its purpose.

</p>

`},

{
title:"The Sun & Moon",

art:"🌕",

body:`

<p>

The solar year begins with the Spring Equinox and unfolds through thirteen equal Quatrains.

</p>

<p>

The Moon follows her own independent rhythm.

Each Full Moon begins a new Moonth.

</p>

<p>

Rather than forcing the Sun and Moon into agreement, Paulmanac allows each to keep its own beautiful rhythm.

</p>

<p>

Let the Sun shape your days.

Let the Moon guide your nights.

</p>

`

},

{
title:"The Week",

art:"✨",

body:`

<p>

The weekdays honor the forces that shape life.

</p>

<ul class="moonList">

<li>☀ <b>Solday</b> — the Sun's radiant gift of life.</li>

<li>🌙 <b>Lunaday</b> — the Moon's gentle guidance through the night.</li>

<li>🌍 <b>Terraday</b> — the Earth's steadfast embrace beneath our feet.</li>

<li>💧 <b>Waterday</b> — transformation, emotion, and renewal.</li>

<li>🌌 <b>Dreamday</b> — the underworld and dreamworld we all visit each night.</li>

<li>🔥 <b>Fireday</b> — Hades, change, loss, and the courage to become someone new.</li>

<li>☮ <b>Paxday</b> — peace found through embracing uncertainty with grace.</li>

</ul>


`
},

{
title:"The Thirteen Moonths",

art:"🌱 🌸 🌾",

body:`

<p>

Throughout history, cultures have named the Full Moons according to the seasons, the land, and the lives they lived beneath them. Paulmanac continues that tradition. Each Full Moon begins a new Moonth, reminding us that while calendars may change, the sky continues its ancient rhythm.

</p>

<ul class="moonList">

<li>🌱 <b>Renewal</b> — the Earth's first breath after winter.</li>

<li>🌸 <b>Flower</b> — blossoms, possibility, and new beginnings.</li>

<li>💃 <b>Dance</b> — celebration, movement, and the joy of longer days.</li>

<li>💧 <b>Water</b> — life, nourishment, and quiet transformation.</li>

<li>☀ <b>Hot</b> — the warmth and abundance of midsummer.</li>

<li>🥾 <b>Pilgrim</b> — journeys outward and inward.</li>

<li>❤️ <b>Love</b> — connection, gratitude, and golden evenings.</li>

<li>🌾 <b>Gather</b> — the harvest of fields, friendships, and experience.</li>

<li>❄ <b>Ice</b> — the first quiet breath of winter.</li>

<li>✨ <b>Spirit</b> — reflection beneath long nights and bright stars.</li>

<li>🦴 <b>Bone</b> — mortality, resilience, and what endures.</li>

<li>🐦‍⬛ <b>Crow</b> — wisdom, mystery, playfulness, and remembrance.</li>

<li>🕯 <b>Ancestor</b> — those who came before us, whose stories continue through us.</li>

</ul>

`
},
{
title:"Astronomy",

art:"🔭",

body:`

<p>

Every astronomical event shown in this app
comes from real observations.

</p>

<p>

Equinoxes.

Solstices.

Full Moons.

Meteor Showers.

Planetary conjunctions.

Eclipses.

</p>

<p>

The heavens are not adjusted to fit the calendar.

The calendar is adjusted to fit the heavens.

</p>

`
},

{
title:"May It Serve You Well",

art:"🕯",

body:`

<div class="closingPage">

<p>

May this calendar

support your health,

encourage your growth,

and bring you joy

for many Moons.

</p>

<br>

<p>

— Paul Berick

</p>

</div>

`
}

];

/*==================================================
BOOK RENDERER
==================================================*/

function renderAboutPage(){

    const page = aboutPages[currentAboutPage];

    document.getElementById("aboutPages").innerHTML = `

        <div class="aboutArt">

            ${page.art}

        </div>

        <h1>

            ${page.title}

        </h1>

        <div class="aboutBody">

            ${page.body}

        </div>

    `;

    document.getElementById("pageIndicator").textContent =
        `Page ${currentAboutPage + 1} of ${aboutPages.length}`;

}

/*==================================================
BOOK
==================================================*/

const aboutModal =
    document.getElementById("aboutModal");

document.getElementById("aboutButton").onclick = () => {

    currentAboutPage = 0;

    renderAboutPage();

    aboutModal.classList.remove("hidden");

};

document.getElementById("closeAbout").onclick = () => {

    aboutModal.classList.add("hidden");

};

document.getElementById("nextPage").onclick = () => {

    if(currentAboutPage < aboutPages.length - 1){

        currentAboutPage++;

        fadeBook();

    } else {

        aboutModal.classList.add("hidden");

    }

};

document.getElementById("previousPage").onclick = () => {

    if(currentAboutPage > 0){

        currentAboutPage--;

        fadeBook();

    }

};

function fadeBook(){

    const container =
        document.getElementById("aboutPages");

    container.classList.add("fade");

    setTimeout(()=>{

        renderAboutPage();

        container.classList.remove("fade");

    },200);

}

/*==================================================
DAY NAVIGATION
==================================================*/

document.getElementById("todayButton").onclick = () => {

    currentDate = new Date();

    updateDisplay();

};

document.getElementById("previousDay").onclick = () => {

    currentDate.setDate(

        currentDate.getDate()-1

    );

    updateDisplay();

};

document.getElementById("nextDay").onclick = () => {

    currentDate.setDate(

        currentDate.getDate()+1

    );

    updateDisplay();

};

//--------------------------------------------------
// Refresh when app becomes visible again
//--------------------------------------------------

document.addEventListener(

    "visibilitychange",

    () => {

        if (!document.hidden) {

            updateDisplay();

        }

    }

);



/*==================================================
PLACEHOLDER BUTTONS
==================================================*/

/*
Future versions:

Export Calendar

Settings

Search

Favorites

Astronomy Details

Notifications

*/

/*==================================================
INITIALIZE
==================================================*/

//--------------------------------------------------
// Keep the sky live: redraw every minute, and snap
// back to "now" every 90s / when the app is reopened.
//--------------------------------------------------

setInterval(() => {
    if (!document.hidden) updateDisplay();
}, 60000);

currentDate = new Date();
updateDisplay();

setInterval(() => {
    if (!document.hidden) {
        currentDate = new Date();
        updateDisplay();
    }
}, 90000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        currentDate = new Date();
        updateDisplay();
    }
});

//--------------------------------------------------
// Service worker: retire any old cache-first worker so
// phones never get stuck on a stale build.
//--------------------------------------------------

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./service-worker.js")
        .catch(console.error);
}

