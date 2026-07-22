import { projectToVault } from "./SkyProjection.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const WIDTH = 900;
const HEIGHT = 420;

const BODY_STYLES = {

    Sun: {
        symbol: "☉",
        size: 38,
        glow: "#ffd85c",
        icon: null
    },

    Moon: {
        symbol: "☽",
        size: 34,
        glow: "#cfe6ff",
        icon: null
    },

    Mercury: {
        symbol: "☿",
        size: 24,
        glow: "#d8d8d8",
        icon: null
    },

    Venus: {
        symbol: "♀",
        size: 28,
        glow: "#fff2b8",
        icon: null
    },

    Mars: {
        symbol: "♂",
        size: 28,
        glow: "#ff9b7a",
        icon: null
    },

    Jupiter: {
        symbol: "♃",
        size: 32,
        glow: "#ffd48c",
        icon: null
    },

    Saturn: {
        symbol: "♄",
        size: 32,
        glow: "#ffe5a8",
        icon: null
    }

};

export function renderSkyVault(svg, scene) {

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    drawBackground(svg);
    drawCurves(svg, scene.curves ?? []);
    drawBodies(svg, scene.bodies ?? []);
}

function drawBackground(svg) {

    const defs = document.createElementNS(SVG_NS, "defs");

    const gradient = document.createElementNS(SVG_NS, "radialGradient");

    gradient.id = "skyGlow";
    gradient.setAttribute("cx", "50%");
    gradient.setAttribute("cy", "100%");
    gradient.setAttribute("r", "90%");

    const stop1 = document.createElementNS(SVG_NS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#1d3567");
    stop1.setAttribute("stop-opacity", ".30");

    const stop2 = document.createElementNS(SVG_NS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#08111f");
    stop2.setAttribute("stop-opacity", "0");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);

    defs.appendChild(gradient);

    svg.appendChild(defs);

    const glow = document.createElementNS(SVG_NS, "ellipse");

    glow.setAttribute("cx", WIDTH / 2);
    glow.setAttribute("cy", HEIGHT - 50);

    glow.setAttribute("rx", 520);
    glow.setAttribute("ry", 260);

    glow.setAttribute("fill", "url(#skyGlow)");

    svg.appendChild(glow);

    const horizonY = HEIGHT - 45;

    const dome = document.createElementNS(SVG_NS, "path");

    dome.setAttribute(
        "d",
        `M40 ${horizonY}
         Q450 ${horizonY - 120}
         860 ${horizonY}`
    );

    dome.setAttribute("fill", "none");
    dome.setAttribute("stroke", "#6f8fdd");
    dome.setAttribute("stroke-width", "1.5");
    dome.setAttribute("opacity", ".20");

    svg.appendChild(dome);
}

function drawCurves(svg, curves) {

    for (const curve of curves) {

        if (!curve.points || curve.points.length < 2)
            continue;

        let d = "";
let started = false;

for (const point of curve.points) {

    const p = projectToVault(
        point.altitude,
        point.azimuth,
        WIDTH,
        HEIGHT
    );

    if (!p) {
        started = false;
        continue;
    }

    if (!started) {

        d += `M ${p.x} ${p.y}`;
        started = true;

    } else {

        d += ` L ${p.x} ${p.y}`;
    }
}

if (!d)
    continue;

//
// Soft outer glow
//

const glow = document.createElementNS(SVG_NS, "path");

glow.setAttribute("d", d);
glow.setAttribute("fill", "none");
glow.setAttribute("stroke", "#fff6c7");
glow.setAttribute("stroke-width", "8");
glow.setAttribute("opacity", ".05");
glow.setAttribute("stroke-linecap", "round");
glow.setAttribute("stroke-linejoin", "round");

svg.appendChild(glow);

//
// Main ribbon
//

const ribbon = document.createElementNS(SVG_NS, "path");

ribbon.setAttribute("d", d);
ribbon.setAttribute("fill", "none");
ribbon.setAttribute("stroke", "#f4d77a");
ribbon.setAttribute("stroke-width", "3");
ribbon.setAttribute("opacity", ".70");
ribbon.setAttribute("stroke-linecap", "round");
ribbon.setAttribute("stroke-linejoin", "round");

svg.appendChild(ribbon);

//
// Bright center highlight
//

const highlight = document.createElementNS(SVG_NS, "path");

highlight.setAttribute("d", d);
highlight.setAttribute("fill", "none");
highlight.setAttribute("stroke", "#fffdf1");
highlight.setAttribute("stroke-width", "1");
highlight.setAttribute("opacity", ".80");
highlight.setAttribute("stroke-linecap", "round");
highlight.setAttribute("stroke-linejoin", "round");

svg.appendChild(highlight);
    }
}

function drawBodies(svg, bodies) {

    const placed = [];


    for (const body of bodies) {
        const style = BODY_STYLES[body.body] ?? {};
        const p = projectToVault(
            body.altitude,
            body.azimuth,
            WIDTH,
            HEIGHT
        );

        if (!p)
            continue;

        //
        // Very simple collision avoidance.
        //

        let y = p.y;

        for (const other of placed) {

            const dx = p.x - other.x;
            const dy = y - other.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 28) {
                y -= 18;
            }
        }

        const halo = document.createElementNS(SVG_NS, "circle");

        halo.setAttribute("cx", p.x);
        halo.setAttribute("cy", y - 8);
        halo.setAttribute("r", "12");
        halo.setAttribute(
            "fill",
           style.glow ?? "#ffffff"
        );
        
        halo.setAttribute("r", "16");
        halo.setAttribute("opacity", ".10");
        halo.setAttribute("opacity", ".05");

        svg.appendChild(halo);

        const symbol = document.createElementNS(SVG_NS, "text");

        symbol.setAttribute("x", p.x);
        symbol.setAttribute("y", y);

        symbol.setAttribute("text-anchor", "middle");
        symbol.setAttribute(
            "font-size",
            style.size ?? 28
        );
        symbol.setAttribute("fill", "white");

        symbol.textContent =
        style.symbol ??
        body.symbol;

        svg.appendChild(symbol);

        placed.push({
            x: p.x,
            y: y
        });
    }
}