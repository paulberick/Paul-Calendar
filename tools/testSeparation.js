import { apparentSeparation } from "./astronomyUtils.js";

for (let d = 10; d <= 20; d++) {

    const time = new Date(`2026-07-${String(d).padStart(2,"0")}T00:00:00Z`);

    console.log(
        time.toISOString().substring(0,10),
        apparentSeparation("Moon","Saturn",time).toFixed(3)
    );
}