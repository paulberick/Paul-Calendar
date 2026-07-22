import * as Astronomy from "astronomy-engine";

const names = Object.keys(Astronomy).sort();

for (const name of names) {
    console.log(name);
}