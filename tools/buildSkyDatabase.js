import fs from "node:fs/promises";

const INPUT = "./imports/nasaSky.csv";
const OUTPUT = "./imports/skyEvents.csv";

async function main() {

    console.log("Building Paulmanac Sky Database...");

    const text = await fs.readFile(INPUT,"utf8");

    const lines = text
        .split(/\r?\n/)
        .filter(x=>x.trim());

    const output = [

        "date,type,title,description"

    ];

    for(const line of lines.slice(1)){

        const row = line.split(",");

        const date = row[0]?.trim();
        const type = row[1]?.trim();
        const title = row[2]?.trim();
        const description = row[3]?.trim() || "";

        //--------------------------------------------------
        // Paulmanac Filter
        //--------------------------------------------------

        switch(type){

            case "equinox":
            case "solstice":
            case "meteor":
            case "solar-eclipse":
            case "lunar-eclipse":
            case "conjunction":
            case "comet":

                output.push(
                    `${date},${type},${title},${description}`
                );

                break;

            default:
                break;

        }

    }

    await fs.writeFile(

        OUTPUT,

        output.join("\n"),

        "utf8"

    );

    console.log(
        `✓ ${output.length-1} curated events written.`
    );

}

main().catch(console.error);