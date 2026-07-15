import { getPaulDate } from "./engine/calendarEngine.js";

/*==================================================
CURRENT DATE
==================================================*/

let currentDate = new Date();

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
"Twenty-Eight"
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
"Twenty-Seventh","Twenty-Eighth"
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
        return "TODAY";

    if(days === 1)
        return "Tomorrow";

    return `${days} Days Away`;

}

/*==================================================
DISPLAY
==================================================*/

function updateDisplay(){

    const paul =
        getPaulDate(currentDate);

console.log("PAUL OBJECT:", paul);

    /*------------------------------------------
    Gregorian
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

    document.getElementById("moonPhrase").textContent =
        `Night ${numberWords[
            paul.moon.night
        ]}`;

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
title:"Paul's Calendar",

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

Paul's Calendar

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

Beautiful Persephone once danced beneath the spring sun,
daughter of Demeter, goddess of the harvest.
Where she walked, flowers followed.

</p>

<p>

Then the earth opened.

Hades carried her into the Underworld,
changing not only her destiny,
but the rhythm of the seasons forever.

</p>

<p>

Each spring she returns.

Each autumn she descends.

The Earth remembers.

So do we.

</p>

`
},

{
title:"Why Another Calendar?",

art:"☀️",

body:`

<p>

Nature does not recognize January 1.

The Earth awakens at the Spring Equinox.

That is where this calendar begins.

</p>

<p>

Each Solar Year contains
Thirteen Quatrains,
plus one great celebration at year's end.

</p>

<p>

It is simple.

Predictable.

And aligned with the seasons.

</p>

`
},

{
title:"The Moon",

art:"🌕",

body:`

<p>

While the Sun governs our days,
the Moon quietly governs our nights.

</p>

<p>

Each Full Moon begins a new Moon.

The Solar Year and Lunar Year overlap naturally,
just as they do in the heavens.

</p>

<p>

Rather than forcing them into agreement,

this calendar lets each keep its own rhythm.

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

<li>☀ Solday</li>

<li>🌙 Lunaday</li>

<li>🌍 Terraday</li>

<li>💧 Waterday</li>

<li>🌌 Dreamday</li>

<li>🔥 Fireday</li>

<li>☮ Paxday</li>

</ul>

`
},

{
title:"The Thirteen Moons",

art:"🌱 🌸 🌾",

body:`

<ul class="moonList">

<li>🌱 Renewal</li>

<li>🌸 Flower</li>

<li>💃 Dance</li>

<li>💧 Water</li>

<li>☀ Hot</li>

<li>🥾 Pilgrim</li>

<li>❤️ Love</li>

<li>🌾 Gather</li>

<li>❄ Ice</li>

<li>✨ Spirit</li>

<li>🦴 Bone</li>

<li>🐦‍⬛ Crow</li>

<li>🕯 Ancestor</li>

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

The heavens determine the calendar.

Not the other way around.

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

updateDisplay();
