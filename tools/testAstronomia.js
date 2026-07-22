import solstice from "astronomia/solstice";

for (let year = 2026; year <= 2030; year++) {

    console.log(year);

    console.log(
        "March Equinox:",
        solstice.march2(year)
    );

    console.log(
        "June Solstice:",
        solstice.june2(year)
    );

    console.log(
        "September Equinox:",
        solstice.september2(year)
    );

    console.log(
        "December Solstice:",
        solstice.december2(year)
    );

    console.log();
}