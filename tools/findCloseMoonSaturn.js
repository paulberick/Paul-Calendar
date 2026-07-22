import { apparentSeparation } from "./astronomyUtils.js";

const start = new Date("2026-01-01T00:00:00Z");

for (let i = 0; i < 365; i++) {

    const t = new Date(start);
    t.setUTCDate(start.getUTCDate() + i);

    const sep = apparentSeparation("Moon", "Saturn", t);

    if (sep < 10) {
        console.log(
            t.toISOString().substring(0,10),
            sep.toFixed(2)
        );
    }
}