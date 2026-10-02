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
    // (mapping matches the Aug 26 "Update moon phase emojis" build)
    if (phaseAngle < 22.5)  return "🌕";
    if (phaseAngle < 67.5)  return "🌔";
    if (phaseAngle < 112.5) return "🌓";
    if (phaseAngle < 157.5) return "🌒";
    if (phaseAngle < 202.5) return "🌑";
    if (phaseAngle < 247.5) return "🌘";
    if (phaseAngle < 292.5) return "🌗";
    if (phaseAngle < 337.5) return "🌖";
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

    // Keep the user's zoom/pan across re-renders, and wire gestures once.
    enableVaultZoom(svg);
    applyViewBox(svg);
}

/*──────────────────────────────────────────────────────────
  Pinch-zoom / pan (sky map only)

  - Two-finger pinch zooms the sky map, not the page.
  - One-finger drag pans once zoomed in (at 1× the page scrolls
    normally over the map).
  - Ctrl+wheel / trackpad pinch zooms on desktop.
  - Double-tap or the ⟲ button resets to the full sky.
  - Body name labels fade in past LABEL_ZOOM_THRESHOLD only.
──────────────────────────────────────────────────────────*/

const MIN_ZOOM = 1;
const MAX_ZOOM = 3.5;
export const LABEL_ZOOM_THRESHOLD = 1.6;

function getView(svg) {
    if (!svg._vaultView) svg._vaultView = { x: 0, y: 0, z: 1 };
    return svg._vaultView;
}

function clampView(view) {
    view.z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.z));
    const w = WIDTH / view.z;
    const h = HEIGHT / view.z;
    view.x = Math.min(WIDTH - w, Math.max(0, view.x));
    view.y = Math.min(HEIGHT - h, Math.max(0, view.y));
    return view;
}

function applyViewBox(svg) {
    const view = clampView(getView(svg));
    const w = WIDTH / view.z;
    const h = HEIGHT / view.z;
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${w} ${h}`);

    const zoomed = view.z > 1.01;
    svg.classList.toggle("isZoomed", zoomed);
    svg.classList.toggle("showLabels", view.z >= LABEL_ZOOM_THRESHOLD);
    // At 1× let vertical page scroll pass through; when zoomed, own all gestures.
    svg.style.touchAction = zoomed ? "none" : "pan-y";

    // Keep body labels a steady ~12px on screen at any zoom
    const rectWidth = svg.getBoundingClientRect().width || WIDTH;
    const labelSize = (12 * w) / rectWidth;
    for (const label of svg.querySelectorAll(".bodyLabel")) {
        label.setAttribute("font-size", labelSize.toFixed(2));
    }

    const frame = svg.closest(".vaultFrame");
    frame?.classList.toggle("isZoomed", zoomed);
}

export function resetVaultZoom(svg) {
    svg._vaultView = { x: 0, y: 0, z: 1 };
    applyViewBox(svg);
}

function clientToSvg(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const view = getView(svg);
    const w = WIDTH / view.z;
    const h = HEIGHT / view.z;
    return {
        x: view.x + ((clientX - rect.left) / rect.width) * w,
        y: view.y + ((clientY - rect.top) / rect.height) * h
    };
}

// Zoom to `z` keeping svg point `anchor` under client point (cx, cy)
function zoomAround(svg, z, anchor, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const view = getView(svg);
    view.z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    const w = WIDTH / view.z;
    const h = HEIGHT / view.z;
    view.x = anchor.x - ((clientX - rect.left) / rect.width) * w;
    view.y = anchor.y - ((clientY - rect.top) / rect.height) * h;
    applyViewBox(svg);
}

function enableVaultZoom(svg) {
    if (svg._vaultZoomWired) return;
    svg._vaultZoomWired = true;

    const pointers = new Map();
    let pinch = null;   // { d0, z0, anchor }
    let pan = null;     // { x, y, vx, vy }
    let moved = 0;
    let lastTap = 0;

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    function startPinch() {
        const [a, b] = [...pointers.values()];
        const m = mid(a, b);
        pinch = {
            d0: Math.max(dist(a, b), 1),
            z0: getView(svg).z,
            anchor: clientToSvg(svg, m.x, m.y)
        };
        pan = null;
    }

    function startPan(p) {
        const view = getView(svg);
        pan = { x: p.x, y: p.y, vx: view.x, vy: view.y };
    }

    svg.addEventListener("pointerdown", e => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 1) {
            moved = 0;
            if (getView(svg).z > 1.01) startPan({ x: e.clientX, y: e.clientY });
        } else if (pointers.size === 2) {
            startPinch();
        }
    });

    svg.addEventListener("pointermove", e => {
        if (!pointers.has(e.pointerId)) return;
        const prev = pointers.get(e.pointerId);
        moved += Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pinch && pointers.size >= 2) {
            const [a, b] = [...pointers.values()];
            const m = mid(a, b);
            zoomAround(svg, pinch.z0 * (dist(a, b) / pinch.d0), pinch.anchor, m.x, m.y);
            e.preventDefault();
        } else if (pan && pointers.size === 1) {
            const rect = svg.getBoundingClientRect();
            const view = getView(svg);
            view.x = pan.vx - ((e.clientX - pan.x) / rect.width) * (WIDTH / view.z);
            view.y = pan.vy - ((e.clientY - pan.y) / rect.height) * (HEIGHT / view.z);
            applyViewBox(svg);
            e.preventDefault();
        }
    });

    function endPointer(e) {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);

        if (pointers.size < 2) pinch = null;
        if (pointers.size === 1 && getView(svg).z > 1.01) {
            startPan([...pointers.values()][0]);
        }
        if (pointers.size === 0) {
            pan = null;
            if (e.type === "pointerup" && moved < 10) {
                const now = Date.now();
                if (now - lastTap < 300) {
                    resetVaultZoom(svg);
                    lastTap = 0;
                } else {
                    lastTap = now;
                }
            }
        }
    }

    svg.addEventListener("pointerup", endPointer);
    svg.addEventListener("pointercancel", endPointer);

    // A drag/pinch shouldn't also open a body panel.
    svg.addEventListener("click", e => {
        if (moved >= 10) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);

    // Desktop: ctrl+wheel (and trackpad pinch, which sends ctrl+wheel)
    svg.addEventListener("wheel", e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const anchor = clientToSvg(svg, e.clientX, e.clientY);
        const z = getView(svg).z * Math.exp(-e.deltaY * 0.01);
        zoomAround(svg, z, anchor, e.clientX, e.clientY);
    }, { passive: false });

    svg.addEventListener("dblclick", e => {
        e.preventDefault();
        resetVaultZoom(svg);
    });

    svg.closest(".vaultFrame")
        ?.querySelector(".vaultReset")
        ?.addEventListener("click", e => {
            e.stopPropagation();
            resetVaultZoom(svg);
        });
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
    const positions = {};

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

        // Name label under the symbol — hidden at default zoom,
        // fades in once zoomed past LABEL_ZOOM_THRESHOLD (see CSS).
        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("class", "bodyLabel");
        label.setAttribute("x", p.x);
        label.setAttribute("y", y + size * 0.62 + 4);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "hanging");
        label.setAttribute("font-size", "13");
        label.textContent = body.name;
        group.appendChild(label);

        // Click / tap
        group.addEventListener("click", (e) => {
            e.stopPropagation();
            showBodyDetail(body, e.clientX, e.clientY);
        });

        positions[body.name] = { x: p.x, y };

        svg.appendChild(group);

        placed.push({ x: p.x, y });
    }

    svg._bodyPositions = positions;
}

function drawConjunctions(svg, conjunctions) {
    const wide = window.innerWidth >= 768;
    const positions = svg._bodyPositions || {};

    for (const conj of conjunctions) {
        const [a, b] = conj.bodies;
        const pa = positions[a.name];
        const pb = positions[b.name];

        // Centre the ring between the drawn symbols when we have them
        let cx, cy;
        if (pa && pb) {
            cx = (pa.x + pb.x) / 2;
            cy = (pa.y + pb.y) / 2;
        } else {
            const p = projectToVault(conj.altitude, conj.azimuth, WIDTH, HEIGHT);
            if (!p) continue;
            cx = p.x;
            cy = p.y;
        }

        const group = document.createElementNS(SVG_NS, "g");
        group.style.cursor = "pointer";

        // Faint outer ring
        const outer = document.createElementNS(SVG_NS, "circle");
        outer.setAttribute("cx", cx);
        outer.setAttribute("cy", cy);
        outer.setAttribute("r", 85);
        outer.setAttribute("fill", "none");
        outer.setAttribute("stroke", "#ffd978");
        outer.setAttribute("stroke-width", "1.5");
        outer.setAttribute("opacity", "0.22");
        group.appendChild(outer);

        // Soft golden glow ring
        const ring = document.createElementNS(SVG_NS, "circle");
        ring.setAttribute("cx", cx);
        ring.setAttribute("cy", cy);
        ring.setAttribute("r", 70);
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#ffd978");
        ring.setAttribute("stroke-width", "2");
        ring.setAttribute("opacity", "0.7");
        ring.style.filter = "drop-shadow(0 0 8px rgba(255, 217, 120, 0.5))";
        group.appendChild(ring);

        if (wide) {
            const label = document.createElementNS(SVG_NS, "text");
            label.setAttribute("x", cx);
            label.setAttribute("y", cy + 95);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("font-size", "11");
            label.setAttribute("fill", "#ffd978");
            label.setAttribute("opacity", "0.8");
            label.textContent = "Conjunction";
            group.appendChild(label);
        }

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