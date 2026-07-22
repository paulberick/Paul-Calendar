import {
    Body,
    Equator,
    Horizon,
    Illumination,
    SearchRiseSet,
    SearchAltitude,
    Observer
} from "astronomy-engine";

export function getSky(latitude, longitude, date) {

    const observer = new Observer(latitude, longitude, 0);

    const start = new Date(date);
    start.setHours(0,0,0,0);

    return {

        sunrise: SearchRiseSet(
            Body.Sun,
            observer,
            +1,
            start,
            1
        ),

        sunset: SearchRiseSet(
            Body.Sun,
            observer,
            -1,
            start,
            1
        ),

        moonrise: SearchRiseSet(
            Body.Moon,
            observer,
            +1,
            start,
            1
        ),

        moonset: SearchRiseSet(
            Body.Moon,
            observer,
            -1,
            start,
            1
        ),

        civilDawn: SearchAltitude(
            Body.Sun,
            observer,
            +1,
            start,
            1,
            -6
        ),

        civilDusk: SearchAltitude(
            Body.Sun,
            observer,
            -1,
            start,
            1,
            -6
        ),

        nauticalDawn: SearchAltitude(
            Body.Sun,
            observer,
            +1,
            start,
            1,
            -12
        ),

        nauticalDusk: SearchAltitude(
            Body.Sun,
            observer,
            -1,
            start,
            1,
            -12
        ),

        astronomicalDawn: SearchAltitude(
            Body.Sun,
            observer,
            +1,
            start,
            1,
            -18
        ),

        astronomicalDusk: SearchAltitude(
            Body.Sun,
            observer,
            -1,
            start,
            1,
            -18
        ),
        
        goldenHour: SearchAltitude(
            Body.Sun,
            observer,
            -1,
            start,
            1,
            6
        )

    };

}

