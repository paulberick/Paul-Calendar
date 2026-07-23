import { projectToVault } from "./SkyProjection.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const WIDTH  = 900;
const HEIGHT = 420;

// Sizes as fraction of vault WIDTH so they scale on phone
const BODY_STYLES = {
    Sun:     { symbol: "☉", sizePct: 0.085, glow: "#ffd85c" },
    Moon:    { symbol: "☽", sizePct: 0.080, glow: "#cfe6ff" },
    Mercury: { symbol: "☿", sizePct: 0.048, glow: "#d8d8d8" },
    Venus:   { symbol: "♀", sizePct: 0.055, glow: "#fff2b8" },
    Mars:    { symbol: "♂", sizePct: 0.055, glow: "#ff9b7a" },
    Jupiter: { symbol: "♃", sizePct: 0.068, glow: "#ffd48c" },
    Saturn:  { symbol: "♄", sizePct: 0.068, glow: "#ffe5a8" }
};

// Nice Unicode moons that match real phase
export function moonEmoji(phaseAngle) {
    // astronomy-engine: 0° = Full, 180° = New
    if (phaseAngle == null) return "🌕";
    if (phaseAngle < 22.5)  return "🌕"; // Full
    if (phaseAngle < 67.5)  return "🌖"; // Waning Gibbous
    if (phaseAngle < 112.5) return "🌗"; // Last Quarter
    if (phaseAngle < 157.5) return "🌘"; // Waning Crescent
    if (phaseAngle < 202.5) return "🌑"; // New
    if (phaseAngle < 247.5) return "🌒"; // Waxing Crescent
    if (phaseAngle < 292.5) return "🌓"; // First Quarter
    if (phaseAngle < 337.5) return "🌔"; // Waxing Gibbous
    return "🌕";
}


export function renderSkyVault(svg, scene) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Make sure the SVG itself is responsive
    svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    drawBackground(svg);
    drawCurves(svg, scene.curves ?? []);
    drawBodies(svg, scene.bodies ?? []);
    drawConjunctions(svg, scene.conjunctions ?? []);
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
    dome.setAttribute("d",
        `M40 ${horizonY} Q450 ${horizonY - 120} 860 ${horizonY}`);
    dome.setAttribute("fill", "none");
    dome.setAttribute("stroke", "#6f8fdd");
    dome.setAttribute("stroke-width", "1.5");
    dome.setAttribute("opacity", ".20");
    svg.appendChild(dome);
}

function drawCurves(svg, curves) {
    for (const curve of curves) {
        if (!curve.points || curve.points.length < 2) continue;

        let d = "";
        let started = false;

        for (const point of curve.points) {
            const p = projectToVault(point.altitude, point.azimuth, WIDTH, HEIGHT);
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
        if (!d) continue;

        // Soft outer glow
        const glow = document.createElementNS(SVG_NS, "path");
        glow.setAttribute("d", d);
        glow.setAttribute("fill", "none");
        glow.setAttribute("stroke", "#fff6c7");
        glow.setAttribute("stroke-width", "8");
        glow.setAttribute("opacity", ".05");
        glow.setAttribute("stroke-linecap", "round");
        svg.appendChild(glow);

        // Main ribbon
        const ribbon = document.createElementNS(SVG_NS, "path");
        ribbon.setAttribute("d", d);
        ribbon.setAttribute("fill", "none");
        ribbon.setAttribute("stroke", "#f4d77a");
        ribbon.setAttribute("stroke-width", "3");
        ribbon.setAttribute("opacity", ".70");
        ribbon.setAttribute("stroke-linecap", "round");
        svg.appendChild(ribbon);

        // Bright center
        const highlight = document.createElementNS(SVG_NS, "path");
        highlight.setAttribute("d", d);
        highlight.setAttribute("fill", "none");
        highlight.setAttribute("stroke", "#fffdf1");
        highlight.setAttribute("stroke-width", "1");
        highlight.setAttribute("opacity", ".80");
        highlight.setAttribute("stroke-linecap", "round");
        svg.appendChild(highlight);
    }
}

function drawBodies(svg, bodies) {
    const placed = [];

    for (const body of bodies) {
        const style = BODY_STYLES[body.name] ?? { sizePct: 0.05, glow: "#ffffff" };
        const p = projectToVault(body.altitude, body.azimuth, WIDTH, HEIGHT);
        if (!p) continue;

        const size = WIDTH * style.sizePct;          // true pixel size inside viewBox
        const hitRadius = size * 0.85;               // generous touch target

        // Simple collision avoidance (scaled)
        let y = p.y;
        for (const other of placed) {
            const dx = p.x - other.x;
            const dy = y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < hitRadius * 1.6) {
                y -= hitRadius * 0.9;
            }
        }

        // ── Group for the whole body (clickable) ──
        const group = document.createElementNS(SVG_NS, "g");
        group.style.cursor = "pointer";
        group.setAttribute("data-body", body.name);

        // Soft halo
        const halo = document.createElementNS(SVG_NS, "circle");
        halo.setAttribute("cx", p.x);
        halo.setAttribute("cy", y);
        halo.setAttribute("r", size * 0.75);
        halo.setAttribute("fill", style.glow);
        halo.setAttribute("opacity", "0.12");
        group.appendChild(halo);

        // Invisible larger hit area for fat fingers
        const hit = document.createElementNS(SVG_NS, "circle");
        hit.setAttribute("cx", p.x);
        hit.setAttribute("cy", y);
        hit.setAttribute("r", hitRadius);
        hit.setAttribute("fill", "transparent");
        group.appendChild(hit);

        // The actual symbol / emoji
        const symbol = document.createElementNS(SVG_NS, "text");
        symbol.setAttribute("x", p.x);
        symbol.setAttribute("y", y);
        symbol.setAttribute("text-anchor", "middle");
        symbol.setAttribute("dominant-baseline", "central");
        symbol.setAttribute("font-size", size);
        symbol.setAttribute("fill", "white");
        symbol.style.pointerEvents = "none"; // let the group handle clicks

        if (body.name === "Moon") {
            symbol.textContent = moonEmoji(body.phaseAngle);
        } else {
            symbol.textContent = style.symbol ?? body.symbol ?? "?";
        }

        group.appendChild(symbol);

        // Click / tap
        group.addEventListener("click", (e) => {
            e.stopPropagation();
            showBodyDetail(body, e.clientX, e.clientY);
        });

        svg.appendChild(group);

        placed.push({ x: p.x, y });
    }
}

function drawConjunctions(svg, conjunctions) {
    for (const conj of conjunctions) {
        const p = projectToVault(conj.altitude, conj.azimuth, WIDTH, HEIGHT);
        if (!p) continue;

        const group = document.createElementNS(SVG_NS, "g");
        group.style.cursor = "pointer";

        // Soft golden glow ring
        const ring = document.createElementNS(SVG_NS, "circle");
        ring.setAttribute("cx", p.x);
        ring.setAttribute("cy", p.y);
        ring.setAttribute("r", 38);
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#ffd978");
        ring.setAttribute("stroke-width", "2");
        ring.setAttribute("opacity", "0.55");
        group.appendChild(ring);

        // Tiny label
        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", p.x);
        label.setAttribute("y", p.y + 48);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "13");
        label.setAttribute("fill", "#ffd978");
        label.setAttribute("opacity", "0.85");
        label.textContent = "Conjunction";
        group.appendChild(label);

        // Click → special conjunction card
        group.addEventListener("click", (e) => {
            e.stopPropagation();
            showConjunctionDetail(conj, e.clientX, e.clientY);
        });

        svg.appendChild(group);
    }
}

/*──────────────────────────────────────────────────────────
  Detail panels
──────────────────────────────────────────────────────────*/

function showBodyDetail(body, clientX, clientY) {
    document.getElementById("skyBodyPanel")?.remove();

    const panel = document.createElement("div");
    panel.id = "skyBodyPanel";
    panel.style.cssText = `
        position: fixed;
        z-index: 10000;
        background: linear-gradient(180deg, #1e2f52, #121c31);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 18px;
        padding: 20px 24px;
        color: #eef3ff;
        font-family: Inter, sans-serif;
        box-shadow: 0 20px 50px rgba(0,0,0,0.55);
        max-width: 280px;
        min-width: 220px;
        backdrop-filter: blur(12px);
    `;

    const title = body.name === "Moon" && body.phaseName
        ? `${body.phaseName} Moon`
        : body.name;

    let html = `
        <div style="font-size:1.35rem; font-weight:700; color:#ffd978; margin-bottom:12px;">
            ${title}
        </div>
        <div style="font-size:0.92rem; line-height:1.7; color:#c8d4ee;">
    `;

    if (body.zodiac) {
        html += `<div>In <b>${body.zodiac}</b> (${body.zodiacDegree?.toFixed(1)}°)</div>`;
    }
    html += `<div>Altitude: ${body.altitude?.toFixed(1)}°</div>`;
    html += `<div>Azimuth: ${body.azimuth?.toFixed(1)}°</div>`;

    if (body.magnitude != null) {
        html += `<div>Magnitude: ${body.magnitude.toFixed(2)}</div>`;
    }
    if (body.illumination != null) {
        html += `<div>Illuminated: ${body.illumination}%</div>`;
    }
    if (body.phaseName) {
        html += `<div>Phase: ${body.phaseName}</div>`;
    }

    html += `</div>
        <button id="closeSkyPanel" style="
            margin-top:16px; width:100%;
            background:#2d5fc7; color:white; border:none;
            border-radius:12px; padding:10px; font-weight:600;
            cursor:pointer;">
            Close
        </button>
    `;

    panel.innerHTML = html;
    document.body.appendChild(panel);

    // Position near the click, keep on screen
    const rect = panel.getBoundingClientRect();
    let left = clientX - rect.width / 2;
    let top  = clientY - rect.height - 16;

    left = Math.max(12, Math.min(left, window.innerWidth  - rect.width  - 12));
    top  = Math.max(12, Math.min(top,  window.innerHeight - rect.height - 12));

    panel.style.left = `${left}px`;
    panel.style.top  = `${top}px`;

    document.getElementById("closeSkyPanel").onclick = () => panel.remove();

    // Also close if you tap elsewhere
    setTimeout(() => {
        const closer = (e) => {
            if (!panel.contains(e.target)) {
                panel.remove();
                document.removeEventListener("click", closer);
            }
        };
        document.addEventListener("click", closer);
    }, 50);
}

function showConjunctionDetail(conj, clientX, clientY) {
    document.getElementById("skyBodyPanel")?.remove();

    const [a, b] = conj.bodies;

    const panel = document.createElement("div");
    panel.id = "skyBodyPanel";
    panel.style.cssText = `
        position: fixed; z-index: 10000;
        background: linear-gradient(180deg, #1e2f52, #121c31);
        border: 1px solid rgba(255,217,120,0.35);
        border-radius: 18px; padding: 20px 24px;
        color: #eef3ff; font-family: Inter, sans-serif;
        box-shadow: 0 20px 50px rgba(0,0,0,0.55);
        max-width: 300px; min-width: 240px;
    `;

    panel.innerHTML = `
        <div style="font-size:1.3rem; font-weight:700; color:#ffd978; margin-bottom:14px;">
            ✦ Conjunction
        </div>
        <div style="font-size:0.95rem; line-height:1.7; color:#c8d4ee;">
            <div><b>${a.name}</b> + <b>${b.name}</b></div>
            <div>Separation: ${conj.separation.toFixed(1)}°</div>
            <hr style="border:none; border-top:1px solid rgba(255,255,255,0.12); margin:12px 0;">
            <div>${a.name}: ${a.zodiac ?? "—"} (${a.zodiacDegree?.toFixed(1) ?? "—"}°)</div>
            <div>${b.name}: ${b.zodiac ?? "—"} (${b.zodiacDegree?.toFixed(1) ?? "—"}°)</div>
        </div>
        <button id="closeSkyPanel" style="
            margin-top:16px; width:100%;
            background:#2d5fc7; color:white; border:none;
            border-radius:12px; padding:10px; font-weight:600;
            cursor:pointer;">
            Close
        </button>
    `;

    document.body.appendChild(panel);

    const rect = panel.getBoundingClientRect();
    let left = clientX - rect.width / 2;
    let top  = clientY - rect.height - 16;
    left = Math.max(12, Math.min(left, window.innerWidth  - rect.width  - 12));
    top  = Math.max(12, Math.min(top,  window.innerHeight - rect.height - 12));
    panel.style.left = `${left}px`;
    panel.style.top  = `${top}px`;

    document.getElementById("closeSkyPanel").onclick = () => panel.remove();

    setTimeout(() => {
        const closer = (e) => {
            if (!panel.contains(e.target)) {
                panel.remove();
                document.removeEventListener("click", closer);
            }
        };
        document.addEventListener("click", closer);
    }, 50);
}