import * as Astronomy from "astronomy-engine";

/**
 * Returns the apparent position of a celestial body
 * for a specific observer.
 *
 * body:
 *   "Sun", "Moon", "Mercury", "Venus",
 *   "Mars", "Jupiter", "Saturn"
 *
 * observer:
 * {
 *     latitude,
 *     longitude,
 *     height   // meters (optional)
 * }
 */
export function getSkyPosition(body, time, observer) {

    const astroTime = new Astronomy.AstroTime(time);

    const obs = new Astronomy.Observer(

        observer.latitude,
        observer.longitude,
        observer.height ?? 0

    );

    const equ = Astronomy.Equator(

        body,
        astroTime,
        obs,
        true,
        true

    );

    const hor = Astronomy.Horizon(

        astroTime,
        obs,
        equ.ra,
        equ.dec,
        "normal"

    );

    return {

        body,

        altitude: hor.altitude,

        azimuth: hor.azimuth,

        visible: hor.altitude > 0,

        aboveHorizon: hor.altitude > 0

    };

}