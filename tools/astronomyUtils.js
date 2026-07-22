import * as Astronomy from "astronomy-engine";

export function apparentSeparation(body1, body2, time) {

    const v1 = Astronomy.GeoVector(body1, time, false);
    const v2 = Astronomy.GeoVector(body2, time, false);

    return Astronomy.AngleBetween(v1, v2);

}