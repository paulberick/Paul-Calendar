export async function getSkyToday(latitude, longitude, date) {

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const url =
        `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${yyyy}-${mm}-${dd}`;

    const response = await fetch(url);

    const json = await response.json();

    return {

        sunrise: json.results.sunrise,

        sunset: json.results.sunset,

        moonrise: json.results.moonrise,

        moonset: json.results.moonset

    };

}