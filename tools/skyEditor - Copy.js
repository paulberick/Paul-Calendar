export function editConjunctions(events) {




const counts = {};

for (const e of events) {
    const key = [e.body1, e.body2].sort().join(" & ");
    counts[key] = (counts[key] || 0) + 1;
}

console.table(counts);




    return events.filter(isWorthSeeing)
                 .sort((a, b) => a.date - b.date);
}

function isWorthSeeing(event) {

    const pair = [event.body1, event.body2].sort().join("|");

    const ALWAYS = new Set([
        "Jupiter|Moon",
        "Moon|Saturn",
        "Moon|Venus",
        "Jupiter|Venus",
        "Saturn|Venus",
        "Jupiter|Saturn"
    ]);

    if (ALWAYS.has(pair))
        return true;

    // Everything else we'll score later.
    return false;
}

