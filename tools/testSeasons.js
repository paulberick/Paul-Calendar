import { Seasons } from "astronomy-engine";

for (let year = 2026; year <= 2030; year++) {

    const s = Seasons(year);

    console.log(year);

    console.log(
        "Spring:",
        s.mar_equinox.date.toISOString()
    );

    console.log(
        "Summer:",
        s.jun_solstice.date.toISOString()
    );

    console.log(
        "Autumn:",
        s.sep_equinox.date.toISOString()
    );

    console.log(
        "Winter:",
        s.dec_solstice.date.toISOString()
    );

    console.log();

}