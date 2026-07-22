import fs from "node:fs/promises";
import { Seasons } from "astronomy-engine";

const OUTPUT = "./imports/solar.csv";

const rows = [
    "date,type,title,description"
];

for (let year = 2026; year <= 2050; year++) {

    const s = Seasons(year);

    rows.push(
        `${s.mar_equinox.date.toISOString().slice(0,10)},equinox,Spring Equinox,Persephone returns. The Paulmanac year begins.`
    );

    rows.push(
        `${s.jun_solstice.date.toISOString().slice(0,10)},solstice,Summer Solstice,The longest day of the year.`
    );

    rows.push(
        `${s.sep_equinox.date.toISOString().slice(0,10)},equinox,Autumn Equinox,Day and night stand in balance.`
    );

    rows.push(
        `${s.dec_solstice.date.toISOString().slice(0,10)},solstice,Winter Solstice,The longest night of the year.`
    );

}

await fs.writeFile(
    OUTPUT,
    rows.join("\n"),
    "utf8"
);

console.log(`✓ Wrote ${rows.length - 1} solar events.`);