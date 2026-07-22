const HORIZON_MARGIN = 40;
const HORIZON_HEIGHT = 45;

export function projectToVault(
    altitude,
    azimuth,
    width,
    height
) {

    if (azimuth < 20 || azimuth > 340) {
        console.log("North-ish:", { azimuth, altitude });
    }

    if (altitude < 0) {
        return null;
    }

    const horizonY = height - HORIZON_HEIGHT;
    const centerX = width / 2;

    //
    // Normalize altitude.
    // 0 = horizon
    // 1 = zenith
    //
    const t = Math.min(Math.max(altitude / 90, 0), 1);

    //
    // Vertical projection.
    // Compress objects toward the zenith slightly.
    //
    const y =
        horizonY -
        Math.pow(t, 0.70) * (horizonY - 40);

    //
    // Horizontal projection.
    // Objects higher in the sky naturally move
    // toward the center of the dome.
    //
    const radius =
        (width / 2 - HORIZON_MARGIN) *
        (1 - 0.35 * t);

    const theta =
        ((azimuth - 180) * Math.PI) / 180;

    const x =
        centerX +
        Math.sin(theta) * radius;

    return {
        x,
        y
    };
}