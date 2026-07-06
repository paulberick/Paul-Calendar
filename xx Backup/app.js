import { getPaulDate } from "./engine/calendarEngine.js";

let currentDate = new Date();







const aboutPages = [

{
    title: "Paul's Calendar",

    subtitle: `
        <div class="coverSubtitle">

            An Astronomical Calendar

            <br><br>

            <span class="coverSmall">

                Living in Harmony with

            </span>

            <br>

            <span class="coverLarge">

                the Sun, Moon & Earth

            </span>

            <br><br>

            <span class="coverInspired">

                Inspired by the Journey of Persephone

            </span>

        </div>
    `,

    art: "☀️ 🌍 🌕",

    body: `

        <div class="coverQuote">

            <p>

            Time is more than the counting of days.

            </p>

            <p>

            It is the rhythm by which we live.

            </p>

            <br>

            <p>

            Awakening.

            Flourishing.

            Harvest.

            Descent.

            Reflection.

            Renewal.

            </p>

        </div>

    `
},
{
    title: "Dedicated to Persephone",

    art: "🌸",

    body: `

<p>Beautiful Persephone once danced in sunlit meadows, daughter of Demeter, goddess of the harvest. Her laughter wove through wildflowers, her steps coaxing blooms from the earth. She was spring incarnate, her world a tapestry of eternal growth under her mother’s golden gaze. Beneath this splendor, however, the earth held shadows. Hades, lord of the underworld, beheld her radiance and yearned to claim it. In a moment, the ground split, and he swept her into the depths, her cries echoing as petals fell.</p>

<p>Time passed in the underworld, Persephone transformed. No longer just a maiden, she slowly became Hades’ queen. Her heart ached for her former life, but grew to admire the dark enchantment of the underworld. The earth withered and froze as Demeter wept, inconsolable, until Zeus intervened with a divine pact: Persephone would spend half of each year below, ruling with Hades, and half above, reunited with Demeter and returning lush life to nature. Thus began the cycle — when she ascends, spring awakens, flowers unfurl, and the hemisphere sings. When she descends, autumn yields to winter and the earth rests in her absence.</p>

<p>Persephone’s rhythm guides this planner as part of us joins her journey between these worlds of light and shadow.</p>

`

},

{
title:"This Calendar",

art:"☀️ 🌍 🌕",

body:`

<p>
This calendar follows a living rhythm shaped by the Sun, Moon, and Earth.
</p>

<p>
The Solar Year begins with the Spring Equinox—Persephone's return—and unfolds in thirteen Quatrains of four weeks each.
</p>

<p>
Each Full Moon begins a new Moon, creating a second rhythm that gently overlaps the Solar Year rather than conforming to it.
</p>

<p>
Together, these celestial cycles offer a natural way to organize life: the Sun shapes our days, the Moon guides our nights, and the Earth carries us through the seasons.
</p>

`
},

{
title:"A Different Way of Keeping Time",

art:"📜",

body:`

<h3>The Year</h3>

<p>
The Spring Equinox marks the beginning of every Solar Year, celebrating Persephone's return and the awakening of life.
</p>

<h3>The Quatrains</h3>

<p>
The year unfolds through thirteen Quatrains, each containing four complete weeks of seven days.
</p>

<h3>The Moons</h3>

<p>
Every Full Moon begins a new Moon. Because the Moon follows its own celestial rhythm, it occasionally overlaps two Solar Years rather than ending neatly with one.
</p>

<h3>The Festdays</h3>

<p>
The final day—or two during leap years—belongs to celebration outside the weekly cycle before a new year begins.
</p>

`
},

{
title:"The Seven Days",

art:"☀️🌙",

body:`

<p>
The weekdays are renamed to honor the sources of our light, life, and natural rhythms, as well as the human condition woven within them.
</p>

<p>
The Gregorian calendar draws its weekdays from several mythologies. Paul's Calendar instead follows the elegant journey of Persephone, whose story reflects both nature's seasons and our own lives.
</p>

<p>
Solday celebrates the radiant life of the Sun.
</p>

<p>
Lunaday honors the Moon's quiet guidance.
</p>

<p>
Terraday recognizes Earth's steadfast embrace.
</p>

<p>
Waterday embodies transformation, emotion, and Persephone herself.
</p>

<p>
Dreamday belongs to sleep, dreams, and the Underworld we visit each night.
</p>

<p>
Fireday reflects Hades—the destructive and renewing power of change.
</p>

<p>
Paxday reminds us that peace is found by embracing uncertainty rather than avoiding it.
</p>

`
},

{
title:"The Thirteen Moons",

art:"🌱 🌸 💃 💧",

body:`

<p>
Throughout history, cultures have named the Full Moons after the rhythms of nature. Paul's Calendar continues that tradition with thirteen named Moons that accompany the Solar Year.
</p>

<ul class="moonList">

<li>🌱 <strong>Renewal</strong> — The year's rebirth.</li>

<li>🌸 <strong>Flower</strong> — Spring blossoms.</li>

<li>💃 <strong>Dance</strong> — Celebration and movement.</li>

<li>💧 <strong>Water</strong> — Transformation and life.</li>

<li>☀️ <strong>Hot</strong> — Summer's height.</li>

<li>🥾 <strong>Pilgrim</strong> — Journeys outward and inward.</li>

<li>❤️ <strong>Love</strong> — Warm evenings and connection.</li>

<li>🌾 <strong>Gather</strong> — Harvest in every form.</li>

<li>❄️ <strong>Ice</strong> — Winter approaches.</li>

<li>✨ <strong>Spirit</strong> — Reflection beneath long nights.</li>

<li>🦴 <strong>Bone</strong> — Mortality remembered.</li>

<li>🐦‍⬛ <strong>Crow</strong> — Wisdom through endings.</li>

<li>🕯️ <strong>Ancestor</strong> — The rare Thirteenth Moon.</li>

</ul>

`
},

{
title:"Astronomy",

art:"☀️ 🌍 🌕",

body:`

<p>

Paul's Calendar follows the heavens rather than convention.

</p>

<p>

The Solar Year begins with the Spring Equinox because it marks Earth's awakening.

</p>

<p>

Each Full Moon begins a new Moon, creating a second rhythm that naturally overlaps the Solar Year.

</p>

<p>

Rather than forcing nature into equal months, this calendar allows the Sun and Moon to keep their own time.

</p>

<p>

It does not attempt to simplify nature.

</p>

<p>

It attempts to follow it.

</p>

`
},

{
title:"May It Serve You Well",

art:"🕯️",

body:`

<div class="closingPage">

<p>

May this calendar support

your health,

your growth,

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





let currentAboutPage = 0;

function renderAboutPage(){

    const page = aboutPages[currentAboutPage];

    document.getElementById("aboutPages").innerHTML = `

        <h1>${page.title}</h1>

        ${page.subtitle ? `<h2>${page.subtitle}</h2>` : ""}

        <div class="art">

            <div class="aboutArt">

${page.art}

</div>

        </div>

        <div class="aboutBody">

            ${page.body}

        </div>

    `;

document.getElementById("pageIndicator").textContent =
`Page ${currentAboutPage+1} of ${aboutPages.length}`;

}



function ordinalWord(n){

    const words = [
        "",
        "First","Second","Third","Fourth","Fifth","Sixth","Seventh",
        "Eighth","Ninth","Tenth","Eleventh","Twelfth","Thirteenth",
        "Fourteenth","Fifteenth","Sixteenth","Seventeenth",
        "Eighteenth","Nineteenth","Twentieth","Twenty-first",
        "Twenty-second","Twenty-third","Twenty-fourth",
        "Twenty-fifth","Twenty-sixth","Twenty-seventh","Twenty-eighth"
    ];

    return words[n] ?? n;

}

function numberWord(n){

    const words = [
        "Zero","One","Two","Three","Four","Five","Six",
        "Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen"
    ];

    return words[n] ?? n;

}


function updateDisplay() {

    const paul = getPaulDate(currentDate);

    //--------------------------------------------------
    // Gregorian Date
    //--------------------------------------------------

    document.getElementById("gregorianDate").textContent =
        currentDate.toLocaleDateString("en-US",{
            weekday:"long",
            month:"long",
            day:"numeric",
            year:"numeric"
        });

    //--------------------------------------------------
    // Number Words
    //--------------------------------------------------

    const moonWords = [
        "",
        "One","Two","Three","Four","Five","Six",
        "Seven","Eight","Nine","Ten","Eleven",
        "Twelve","Thirteen"
    ];

    const nightWords = [
        "",
        "One","Two","Three","Four","Five","Six","Seven",
        "Eight","Nine","Ten","Eleven","Twelve","Thirteen",
        "Fourteen","Fifteen","Sixteen","Seventeen",
        "Eighteen","Nineteen","Twenty","Twenty-One",
        "Twenty-Two","Twenty-Three","Twenty-Four",
        "Twenty-Five","Twenty-Six","Twenty-Seven","Twenty-Eight"
    ];

    //--------------------------------------------------
    // Solar Card
    //--------------------------------------------------

    document.getElementById("solarMoonNumber").textContent =
        "Moon " + moonWords[paul.moon.number];

    if (paul.solar.festDay) {

        document.getElementById("yearDayHeader").textContent =
            `${paul.solar.solarYear} • FESTDAY`;

        document.getElementById("weekday").textContent =
            "Festday";

        document.getElementById("quatrainDay").textContent =
            "Year Celebration";

    } else {

        const quatrain =
            Math.floor((paul.solar.solarDay - 1) / 28) + 1;

        const day =
            ((paul.solar.solarDay - 1) % 28) + 1;

document.getElementById("solarYear").textContent =
    paul.solar.solarYear;

document.getElementById("solarDay").textContent =
    paul.solar.solarDay;

        document.getElementById("weekday").textContent =
            paul.solar.weekday + ",";

        document.getElementById("quatrainDay").innerHTML =
            `The ${ordinalWord(day)} Day<br>of Quatrain ${numberWord(quatrain)}`;

    }

    //--------------------------------------------------
    // Moon Card
    //--------------------------------------------------

    document.getElementById("moonName").textContent =
        `${paul.moon.name} Moon`;

    document.getElementById("moonNumber").textContent =
        "Moon " + moonWords[paul.moon.number];

    document.getElementById("nightNumber").textContent =
        paul.moon.night;

    document.getElementById("moonPhrase").innerHTML =
        `Night ${nightWords[paul.moon.night]}<br>of the ${paul.moon.name} Moon`;

    //--------------------------------------------------
    // Astronomy
    //--------------------------------------------------

    document.getElementById("nextFullMoon").textContent =
        paul.nextEvent?.fullMoon ?? "--";

    document.getElementById("nextEquinox").textContent =
        paul.nextEvent?.equinox ?? "--";

}
document.getElementById("todayButton").onclick = () => {

    currentDate = new Date();

    updateDisplay();

};

document.getElementById("previousDay").onclick = () => {

    currentDate.setDate(currentDate.getDate() - 1);

    updateDisplay();

};

document.getElementById("nextDay").onclick = () => {

    currentDate.setDate(currentDate.getDate() + 1);

    updateDisplay();

};

const aboutModal =
    document.getElementById("aboutModal");

document.getElementById("aboutButton").onclick = () => {

    currentAboutPage = 0;

    renderAboutPage();

    aboutModal.classList.remove("hidden");

};

document.getElementById("nextPage").onclick = () => {

    if(currentAboutPage < aboutPages.length - 1){

        currentAboutPage++;

        renderAboutPage();

    }

};

document.getElementById("previousPage").onclick = () => {

    if(currentAboutPage > 0){

        currentAboutPage--;

        renderAboutPage();

    }

};

document.getElementById("closeAbout").onclick = () => {

    aboutModal.classList.add("hidden");

};

updateDisplay();