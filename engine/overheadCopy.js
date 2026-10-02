//==========================================================
// OVERHEAD COMPANION COPY
//
// Turns nearby Paulmanac events into one natural sentence.
// Overlapping conjunctions ("Moon meets Mars",
// "Triple: Jupiter + Mars + Moon", "Moon meets Jupiter") are
// merged into one group of bodies so we never print "+" or
// repeat a body:
//   "Jupiter, Mars, and the Moon are lighting up the sky."
//==========================================================

const KNOWN_BODIES = [
    "Sun", "Moon", "Mercury", "Venus",
    "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
];

// Display order: bright planets first, the Moon last reads best
const BODY_ORDER = [
    "Jupiter", "Venus", "Mars", "Saturn", "Mercury",
    "Uranus", "Neptune", "Pluto", "Sun", "Moon"
];

function displayBodyName(name) {
    return name === "Moon" || name === "Sun" ? `the ${name}` : name;
}

export function formatList(items) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function extractBodies(title) {
    const found = [];
    for (const body of KNOWN_BODIES) {
        if (new RegExp(`\\b${body}\\b`, "i").test(String(title ?? ""))) {
            found.push(body);
        }
    }
    return found;
}

function isConjunction(event) {
    if (event.type === "conjunction") return true;
    const title = String(event.title ?? "");
    return extractBodies(title).length >= 2 ||
        /\bmeets\b|\+|\bwith\b|^Triple:/i.test(title);
}

// "2026-10-05" → local midnight (new Date("2026-10-05") is UTC,
// which lands on the previous evening in the Americas).
function localDay(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
}

function namedEventClause(title) {
    const label = String(title)
        .replace(/\s+Peak$/i, "")
        .trim();

    if (/eclipse/i.test(label)) {
        return `the ${label.toLowerCase()} is underway`;
    }
    if (/equinox|solstice/i.test(label)) {
        return `it's the ${label}`;
    }
    if (/\bMoon$/i.test(label)) {
        return `the ${label} is full`;
    }
    if (/ids$/i.test(label) || /meteor|shower/i.test(label)) {
        return `the ${label} are peaking`;
    }
    return `the ${label} is overhead`;
}

// Union overlapping conjunctions into groups of bodies
function groupConjunctions(events) {
    const groups = [];
    for (const event of events) {
        const bodies = extractBodies(event.title);
        if (bodies.length === 0) continue;

        const touching = groups.filter(g => bodies.some(b => g.has(b)));
        const merged = new Set(bodies);
        for (const g of touching) {
            for (const b of g) merged.add(b);
            groups.splice(groups.indexOf(g), 1);
        }
        groups.push(merged);
    }
    return groups.map(g =>
        [...g].sort((a, b) => BODY_ORDER.indexOf(a) - BODY_ORDER.indexOf(b))
    );
}

/**
 * @param {{paulmanac?: Array<{title:string,date:string,type?:string,
 *          windowDays?:number, visibleFromHome?:boolean}>}} paul
 * @param {Date} date
 * @returns {string|null}
 */
export function formatOverheadCompanion(paul, date = new Date()) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const nearby = (paul?.paulmanac || []).filter(event => {
        const dayDelta = Math.round((localDay(event.date) - today) / 86400000);
        const windowDays = event.windowDays ?? 1;
        return dayDelta >= -windowDays && dayDelta <= windowDays;
    });

    if (nearby.length === 0) return null;

    const conjunctions = nearby.filter(isConjunction);
    let named = nearby.filter(e => !isConjunction(e));

    const clauses = [];
    const groups = groupConjunctions(conjunctions);

    // A named full Moon ("Love Moon") that's also in a conjunction reads
    // better folded in: "Saturn and the full Love Moon are lighting up the sky."
    const fullMoon = named.find(e => /^\w+ Moon$/.test(String(e.title).trim()));
    let moonName = "the Moon";
    if (fullMoon && groups.some(g => g.includes("Moon"))) {
        moonName = `the full ${String(fullMoon.title).trim()}`;
        named = named.filter(e => e !== fullMoon);
    }
    const nameOf = b => (b === "Moon" ? moonName : displayBodyName(b));

    groups.forEach((bodies, i) => {
        const list = formatList(bodies.map(nameOf));
        if (bodies.length === 1) {
            clauses.push(`${list} is brightening the sky tonight`);
        } else if (i === 0) {
            clauses.push(`${list} are lighting up the sky`);
        } else {
            clauses.push(`${list} are close together`);
        }
    });

    const seen = new Set();
    for (const event of named) {
        const clause = namedEventClause(event.title);
        if (!seen.has(clause)) {
            seen.add(clause);
            clauses.push(clause);
        }
    }

    if (clauses.length === 0) return null;

    let sentence;
    if (clauses.length === 1) sentence = clauses[0];
    else if (clauses.length === 2) sentence = `${clauses[0]}, and ${clauses[1]}`;
    else sentence = `${clauses.slice(0, -1).join("; ")}; and ${clauses.at(-1)}`;

    // Visibility hint (optional, from curated data)
    const visibility = nearby
        .map(e => e.visibleFromHome)
        .filter(v => v !== undefined);

    if (visibility.length > 0) {
        if (visibility.every(v => v === true)) sentence += " — look up";
        else if (visibility.some(v => v === true)) sentence += " — partly visible from here";
        else sentence += " — not really visible from here";
    }

    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return sentence.endsWith(".") ? sentence : `${sentence}.`;
}
