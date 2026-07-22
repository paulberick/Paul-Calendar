import * as Astronomy from "astronomy-engine";

export function buildEcliptic(time, observer) {

    const astroTime = new Astronomy.AstroTime(time);

    const obs = new Astronomy.Observer(
        observer.latitude,
        observer.longitude,
        observer.height ?? 0
    );

    const rotation =
        Astronomy.Rotation_ECL_HOR(
            astroTime,
            obs
        );

    const points = [];

    for (let longitude = 0; longitude <= 360; longitude += 0.5)
        
        
        
        {

        //
        // Unit vector on the J2000 ecliptic.
        // Latitude is always zero because the
        // ecliptic itself is the reference plane.
        //

const ecl =
    Astronomy.VectorFromSphere(
        {
            lat: 0,
            lon: longitude,
            dist: 1
        },
        astroTime
    );

        //
        // Rotate into the observer's
        // horizontal reference frame.
        //

        const horVector =
            Astronomy.RotateVector(
                rotation,
                ecl
            );

        //
        // Convert to azimuth / altitude.
        //

        const hor =
            Astronomy.HorizonFromVector(
                horVector,
                "normal"
            );

        //
        // Keep only the visible portion.
        //

        if (hor.lat > -2) {

            points.push({

                azimuth: hor.lon,
                altitude: hor.lat

            });

        }

    }

    return points;

}