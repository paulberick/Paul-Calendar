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
        phaseAngle: null,      // Sun–body–Earth angle: 0 = full, 180 = new (no waxing/waning info)
        moonPhase: null,       // Moon only: ecliptic elongation 0–360 (0 new, 90 first qtr, 180 full, 270 last qtr)
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
            result.moonPhase = Astronomy.MoonPhase(astroTime);
            result.phaseName = moonPhaseName(result.moonPhase);
        }
    } catch (e) {
        // some bodies don't support Illumination
    }

    return result;
}

// Moon phase name from ecliptic elongation (Astronomy.MoonPhase):
// 0 = new, 90 = first quarter, 180 = full, 270 = last quarter.
// 45° bins centred on each principal/intermediate phase.
const PHASE_NAMES = [
    "New", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"
];

export function moonPhaseIndex(elongation) {
    const e = ((elongation % 360) + 360) % 360;
    return Math.floor((e + 22.5) / 45) % 8;
}

export function moonPhaseName(elongation) {
    if (elongation == null || Number.isNaN(elongation)) return null;
    return PHASE_NAMES[moonPhaseIndex(elongation)];
}
