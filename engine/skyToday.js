import { getSky } from "./astronomy.js";

function formatTime(astroTime) {

    if (!astroTime)
        return "—";

    const date = astroTime.date ?? astroTime.toDate?.();

    if (!date)
        return "—";

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

}

export async function getSkyToday(latitude, longitude, date) {

    const sky = getSky(latitude, longitude, date);

    return {

        sunrise: formatTime(sky.sunrise),
        sunset: formatTime(sky.sunset),

        moonrise: formatTime(sky.moonrise),
        moonset: formatTime(sky.moonset),

        civilDawn: formatTime(sky.civilDawn),
        civilDusk: formatTime(sky.civilDusk),

        nauticalDawn: formatTime(sky.nauticalDawn),
        nauticalDusk: formatTime(sky.nauticalDusk),

        astronomicalDawn: formatTime(sky.astronomicalDawn),
        astronomicalDusk: formatTime(sky.astronomicalDusk),

        goldenHour: formatTime(sky.goldenHour)

    };
}