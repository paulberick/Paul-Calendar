import * as Astronomy from "astronomy-engine";

const ZODIAC = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function getSkyPosition(body, time, observer) {
    const astroTime = new Astronomy.AstroTime(time);

    const obs = new Astronomy.Observer(
        observer.latitude,
        observer.longitude,
        observer.height ?? 0
    );

    const equ = Astronomy.Equator(body, astroTime, obs, true, true);
    const hor = Astronomy.Horizon(astroTime, obs, equ.ra, equ.dec, "normal");

    // Ecliptic longitude → zodiac
    const vec = Astronomy.GeoVector(body, astroTime, true);
    const ecl = Astronomy.Ecliptic(vec);
    const lon = ((ecl.elon % 360) + 360) % 360;
    const signIndex = Math.floor(lon / 30);
    const sign = ZODIAC[signIndex];
    const degreeInSign = lon % 30;

    const result = {
        body,
        altitude: hor.altitude,
        azimuth: hor.azimuth,
        visible: hor.altitude > 0,
        aboveHorizon: hor.altitude > 0,
        magnitude: null,
        phase: null,           // 0–1 illuminated fraction
        phaseAngle: null,      // 0 = new, 180 = full
        phaseName: null,
        illumination: null,    // percentage
        zodiac: sign,
        zodiacDegree: degreeInSign
    };

    // Extra data for Moon (and optionally planets)
    try {
        const illum = Astronomy.Illumination(body, astroTime);
    
        result.magnitude     = illum.mag;
        result.phaseAngle    = illum.phase_angle;          // 0 = full, 180 = new
        result.phase         = illum.phase_fraction;        // 0–1
        result.illumination  = Math.round(illum.phase_fraction * 100);
    
        if (body === "Moon") {
            result.phaseName = phaseNameFromAngle(illum.phase_angle);
        }
    } catch (e) {
        // some bodies don't support Illumination
    }

    return result;
}

function phaseNameFromAngle(angle) {
    // astronomy-engine: 0° = Full, 180° = New
    if (angle < 22.5)  return "Full";
    if (angle < 67.5)  return "Waning Gibbous";
    if (angle < 112.5) return "Last Quarter";
    if (angle < 157.5) return "Waning Crescent";
    if (angle < 202.5) return "New";
    if (angle < 247.5) return "Waxing Crescent";
    if (angle < 292.5) return "First Quarter";
    if (angle < 337.5) return "Waxing Gibbous";
    return "Full";
}