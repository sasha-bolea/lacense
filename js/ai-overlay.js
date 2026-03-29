/**
 * ai-overlay.js — Grillz Tech
 *
 * Simulates a real-time AI computer-vision scan on the hero section.
 * Randomly picks bounding boxes from a predefined pool and renders them
 * as animated SVG rectangles with classification labels, then removes
 * them after a short lifetime.
 */

(function () {
    "use strict";

    /* -----------------------------------------------------------------
       Bounding-box pool
       Each entry defines a box in percentage of the hero's dimensions.
       xPct/yPct = top-left origin, wPct/hPct = size,
       label = classification name, conf = confidence score (display only).
       ----------------------------------------------------------------- */
    var POOL = [
        // ── Large regions ────────────────────────────────────────────
        {
            xPct: 0.05,
            yPct: 0.02,
            wPct: 0.9,
            hPct: 0.94,
            label: "human_body",
            conf: "0.79",
        },
        {
            xPct: 0.08,
            yPct: 0.05,
            wPct: 0.84,
            hPct: 0.88,
            label: "person",
            conf: "0.91",
        },
        {
            xPct: 0.14,
            yPct: 0.1,
            wPct: 0.72,
            hPct: 0.76,
            label: "face_region",
            conf: "0.96",
        },
        {
            xPct: 0.1,
            yPct: 0.08,
            wPct: 0.8,
            hPct: 0.82,
            label: "body_contour",
            conf: "0.74",
        },
        {
            xPct: 0.03,
            yPct: 0.15,
            wPct: 0.94,
            hPct: 0.7,
            label: "torso_region",
            conf: "0.68",
        },

        // ── Medium regions ───────────────────────────────────────────
        {
            xPct: 0.18,
            yPct: 0.14,
            wPct: 0.64,
            hPct: 0.62,
            label: "face_mesh",
            conf: "0.97",
        },
        {
            xPct: 0.22,
            yPct: 0.42,
            wPct: 0.56,
            hPct: 0.28,
            label: "mouth_region",
            conf: "0.93",
        },
        {
            xPct: 0.27,
            yPct: 0.47,
            wPct: 0.46,
            hPct: 0.24,
            label: "smile_grillz",
            conf: "0.94",
        },
        {
            xPct: 0.2,
            yPct: 0.27,
            wPct: 0.26,
            hPct: 0.2,
            label: "eye_L",
            conf: "0.92",
        },
        {
            xPct: 0.54,
            yPct: 0.27,
            wPct: 0.26,
            hPct: 0.2,
            label: "eye_R",
            conf: "0.89",
        },
        {
            xPct: 0.36,
            yPct: 0.2,
            wPct: 0.28,
            hPct: 0.18,
            label: "nose_bridge",
            conf: "0.83",
        },
        {
            xPct: 0.24,
            yPct: 0.63,
            wPct: 0.52,
            hPct: 0.1,
            label: "lower_jaw",
            conf: "0.87",
        },
        {
            xPct: 0.25,
            yPct: 0.1,
            wPct: 0.5,
            hPct: 0.35,
            label: "cranium",
            conf: "0.82",
        },
        {
            xPct: 0.15,
            yPct: 0.55,
            wPct: 0.7,
            hPct: 0.38,
            label: "neck_shoulder",
            conf: "0.71",
        },
        {
            xPct: 0.28,
            yPct: 0.38,
            wPct: 0.44,
            hPct: 0.16,
            label: "zygomatic_arch",
            conf: "0.78",
        },
        {
            xPct: 0.3,
            yPct: 0.15,
            wPct: 0.4,
            hPct: 0.22,
            label: "forehead",
            conf: "0.85",
        },
        {
            xPct: 0.2,
            yPct: 0.7,
            wPct: 0.6,
            hPct: 0.2,
            label: "chin_contour",
            conf: "0.76",
        },

        // ── Small details ────────────────────────────────────────────
        {
            xPct: 0.3,
            yPct: 0.5,
            wPct: 0.18,
            hPct: 0.16,
            label: "diamond_set",
            conf: "0.88",
        },
        {
            xPct: 0.52,
            yPct: 0.5,
            wPct: 0.18,
            hPct: 0.16,
            label: "diamond_set",
            conf: "0.85",
        },
        {
            xPct: 0.38,
            yPct: 0.52,
            wPct: 0.1,
            hPct: 0.09,
            label: "gem_0x3A",
            conf: "0.91",
        },
        {
            xPct: 0.5,
            yPct: 0.52,
            wPct: 0.1,
            hPct: 0.09,
            label: "gem_0x3B",
            conf: "0.87",
        },
        {
            xPct: 0.44,
            yPct: 0.54,
            wPct: 0.12,
            hPct: 0.08,
            label: "sparkle",
            conf: "0.76",
        },
        {
            xPct: 0.32,
            yPct: 0.28,
            wPct: 0.12,
            hPct: 0.1,
            label: "iris_L",
            conf: "0.94",
        },
        {
            xPct: 0.56,
            yPct: 0.28,
            wPct: 0.12,
            hPct: 0.1,
            label: "iris_R",
            conf: "0.93",
        },
        {
            xPct: 0.42,
            yPct: 0.22,
            wPct: 0.16,
            hPct: 0.12,
            label: "philtrum",
            conf: "0.81",
        },
        {
            xPct: 0.38,
            yPct: 0.63,
            wPct: 0.1,
            hPct: 0.07,
            label: "tooth_01",
            conf: "0.95",
        },
        {
            xPct: 0.5,
            yPct: 0.63,
            wPct: 0.1,
            hPct: 0.07,
            label: "tooth_02",
            conf: "0.93",
        },
        {
            xPct: 0.62,
            yPct: 0.63,
            wPct: 0.1,
            hPct: 0.07,
            label: "tooth_03",
            conf: "0.89",
        },
        {
            xPct: 0.26,
            yPct: 0.63,
            wPct: 0.1,
            hPct: 0.07,
            label: "tooth_04",
            conf: "0.90",
        },
        {
            xPct: 0.34,
            yPct: 0.29,
            wPct: 0.06,
            hPct: 0.06,
            label: "pupil_L",
            conf: "0.97",
        },
        {
            xPct: 0.6,
            yPct: 0.29,
            wPct: 0.06,
            hPct: 0.06,
            label: "pupil_R",
            conf: "0.96",
        },
        {
            xPct: 0.43,
            yPct: 0.43,
            wPct: 0.14,
            hPct: 0.05,
            label: "lip_upper",
            conf: "0.88",
        },
        {
            xPct: 0.43,
            yPct: 0.56,
            wPct: 0.14,
            hPct: 0.05,
            label: "lip_lower",
            conf: "0.86",
        },
        {
            xPct: 0.36,
            yPct: 0.49,
            wPct: 0.08,
            hPct: 0.06,
            label: "gem_0x3C",
            conf: "0.84",
        },
        {
            xPct: 0.56,
            yPct: 0.49,
            wPct: 0.08,
            hPct: 0.06,
            label: "gem_0x3D",
            conf: "0.82",
        },
        {
            xPct: 0.45,
            yPct: 0.5,
            wPct: 0.1,
            hPct: 0.06,
            label: "center_stone",
            conf: "0.92",
        },
        {
            xPct: 0.19,
            yPct: 0.36,
            wPct: 0.08,
            hPct: 0.1,
            label: "ear_L",
            conf: "0.77",
        },
        {
            xPct: 0.73,
            yPct: 0.36,
            wPct: 0.08,
            hPct: 0.1,
            label: "ear_R",
            conf: "0.75",
        },
        {
            xPct: 0.41,
            yPct: 0.34,
            wPct: 0.18,
            hPct: 0.08,
            label: "nasal_tip",
            conf: "0.79",
        },
        {
            xPct: 0.22,
            yPct: 0.25,
            wPct: 0.1,
            hPct: 0.08,
            label: "brow_L",
            conf: "0.83",
        },
        {
            xPct: 0.68,
            yPct: 0.25,
            wPct: 0.1,
            hPct: 0.08,
            label: "brow_R",
            conf: "0.81",
        },
        {
            xPct: 0.44,
            yPct: 0.08,
            wPct: 0.12,
            hPct: 0.1,
            label: "hairline",
            conf: "0.70",
        },
        {
            xPct: 0.29,
            yPct: 0.52,
            wPct: 0.06,
            hPct: 0.05,
            label: "metal_alloy_0xAF",
            conf: "0.89",
        },
        {
            xPct: 0.65,
            yPct: 0.52,
            wPct: 0.06,
            hPct: 0.05,
            label: "metal_alloy_0xB2",
            conf: "0.87",
        },
        {
            xPct: 0.47,
            yPct: 0.6,
            wPct: 0.06,
            hPct: 0.04,
            label: "refractive_node",
            conf: "0.93",
        },
        {
            xPct: 0.41,
            yPct: 0.6,
            wPct: 0.06,
            hPct: 0.04,
            label: "refractive_node",
            conf: "0.91",
        },

        // ── Micro details ────────────────────────────────────────────
        {
            xPct: 0.35,
            yPct: 0.54,
            wPct: 0.04,
            hPct: 0.03,
            label: "facet_0x01",
            conf: "0.88",
        },
        {
            xPct: 0.61,
            yPct: 0.54,
            wPct: 0.04,
            hPct: 0.03,
            label: "facet_0x02",
            conf: "0.86",
        },
        {
            xPct: 0.48,
            yPct: 0.57,
            wPct: 0.04,
            hPct: 0.03,
            label: "facet_0x03",
            conf: "0.84",
        },
        {
            xPct: 0.33,
            yPct: 0.31,
            wPct: 0.03,
            hPct: 0.03,
            label: "sclera_L",
            conf: "0.90",
        },
        {
            xPct: 0.64,
            yPct: 0.31,
            wPct: 0.03,
            hPct: 0.03,
            label: "sclera_R",
            conf: "0.89",
        },
        {
            xPct: 0.44,
            yPct: 0.39,
            wPct: 0.12,
            hPct: 0.03,
            label: "columella",
            conf: "0.77",
        },
        {
            xPct: 0.38,
            yPct: 0.36,
            wPct: 0.06,
            hPct: 0.04,
            label: "nasal_wing_L",
            conf: "0.80",
        },
        {
            xPct: 0.56,
            yPct: 0.36,
            wPct: 0.06,
            hPct: 0.04,
            label: "nasal_wing_R",
            conf: "0.79",
        },
        {
            xPct: 0.23,
            yPct: 0.44,
            wPct: 0.06,
            hPct: 0.08,
            label: "cheek_L",
            conf: "0.72",
        },
        {
            xPct: 0.71,
            yPct: 0.44,
            wPct: 0.06,
            hPct: 0.08,
            label: "cheek_R",
            conf: "0.71",
        },
        {
            xPct: 0.46,
            yPct: 0.14,
            wPct: 0.08,
            hPct: 0.06,
            label: "glabella",
            conf: "0.75",
        },
        {
            xPct: 0.2,
            yPct: 0.15,
            wPct: 0.12,
            hPct: 0.08,
            label: "temple_L",
            conf: "0.69",
        },
        {
            xPct: 0.68,
            yPct: 0.15,
            wPct: 0.12,
            hPct: 0.08,
            label: "temple_R",
            conf: "0.68",
        },
        {
            xPct: 0.39,
            yPct: 0.67,
            wPct: 0.04,
            hPct: 0.03,
            label: "gem_0x3E",
            conf: "0.85",
        },
        {
            xPct: 0.57,
            yPct: 0.67,
            wPct: 0.04,
            hPct: 0.03,
            label: "gem_0x3F",
            conf: "0.83",
        },
        {
            xPct: 0.44,
            yPct: 0.65,
            wPct: 0.12,
            hPct: 0.03,
            label: "lower_grillz_bar",
            conf: "0.94",
        },
        {
            xPct: 0.3,
            yPct: 0.44,
            wPct: 0.04,
            hPct: 0.04,
            label: "cupid_bow_L",
            conf: "0.82",
        },
        {
            xPct: 0.66,
            yPct: 0.44,
            wPct: 0.04,
            hPct: 0.04,
            label: "cupid_bow_R",
            conf: "0.80",
        },
        {
            xPct: 0.47,
            yPct: 0.44,
            wPct: 0.06,
            hPct: 0.03,
            label: "vermillion_peak",
            conf: "0.87",
        },
        {
            xPct: 0.15,
            yPct: 0.6,
            wPct: 0.1,
            hPct: 0.12,
            label: "sternocleidomast_L",
            conf: "0.65",
        },
        {
            xPct: 0.75,
            yPct: 0.6,
            wPct: 0.1,
            hPct: 0.12,
            label: "sternocleidomast_R",
            conf: "0.64",
        },
        {
            xPct: 0.4,
            yPct: 0.75,
            wPct: 0.2,
            hPct: 0.08,
            label: "hyoid_projection",
            conf: "0.70",
        },
        {
            xPct: 0.34,
            yPct: 0.24,
            wPct: 0.04,
            hPct: 0.02,
            label: "lash_line_L",
            conf: "0.91",
        },
        {
            xPct: 0.62,
            yPct: 0.24,
            wPct: 0.04,
            hPct: 0.02,
            label: "lash_line_R",
            conf: "0.90",
        },
        {
            xPct: 0.43,
            yPct: 0.48,
            wPct: 0.14,
            hPct: 0.02,
            label: "upper_grillz_edge",
            conf: "0.96",
        },
        {
            xPct: 0.25,
            yPct: 0.56,
            wPct: 0.04,
            hPct: 0.05,
            label: "oral_comm_L",
            conf: "0.78",
        },
        {
            xPct: 0.71,
            yPct: 0.56,
            wPct: 0.04,
            hPct: 0.05,
            label: "oral_comm_R",
            conf: "0.77",
        },
    ];

    /* -----------------------------------------------------------------
       Logo bounding-box pool
       ----------------------------------------------------------------- */
    var LOGO_POOL = [
        { xPct: 0.02, yPct: 0.02, wPct: 0.96, hPct: 0.96, label: "brand_identity",  conf: "0.99" },
        { xPct: 0.05, yPct: 0.1,  wPct: 0.9,  hPct: 0.8,  label: "logo_mark",       conf: "0.97" },
        { xPct: 0.1,  yPct: 0.2,  wPct: 0.8,  hPct: 0.6,  label: "logotype",        conf: "0.94" },
        { xPct: 0.0,  yPct: 0.0,  wPct: 0.48, hPct: 1.0,  label: "icon_L",          conf: "0.88" },
        { xPct: 0.52, yPct: 0.0,  wPct: 0.48, hPct: 1.0,  label: "icon_R",          conf: "0.86" },
        { xPct: 0.15, yPct: 0.25, wPct: 0.7,  hPct: 0.5,  label: "text_region",     conf: "0.92" },
        { xPct: 0.3,  yPct: 0.35, wPct: 0.4,  hPct: 0.3,  label: "glyph_cluster",   conf: "0.90" },
        { xPct: 0.0,  yPct: 0.25, wPct: 0.28, hPct: 0.5,  label: "symbol_L",        conf: "0.83" },
        { xPct: 0.72, yPct: 0.25, wPct: 0.28, hPct: 0.5,  label: "symbol_R",        conf: "0.81" },
        { xPct: 0.38, yPct: 0.0,  wPct: 0.24, hPct: 0.35, label: "apex",            conf: "0.79" },
        { xPct: 0.42, yPct: 0.65, wPct: 0.16, hPct: 0.3,  label: "base_mark",       conf: "0.77" },
        { xPct: 0.2,  yPct: 0.1,  wPct: 0.18, hPct: 0.25, label: "glyph_0xA1",     conf: "0.85" },
        { xPct: 0.62, yPct: 0.1,  wPct: 0.18, hPct: 0.25, label: "glyph_0xA2",     conf: "0.83" },
        { xPct: 0.44, yPct: 0.4,  wPct: 0.12, hPct: 0.2,  label: "center_glyph",   conf: "0.91" },
        { xPct: 0.25, yPct: 0.6,  wPct: 0.5,  hPct: 0.35, label: "lower_mark",     conf: "0.78" },
    ];

    /* -----------------------------------------------------------------
       AI thinking phrases — shown instead of the label ~25% of the time.
       Mix of questions, uncertainty statements, and process notes.
       ----------------------------------------------------------------- */
    var AI_PHRASES = [
        // questions
        "what is that?",
        "is this organic?",
        "is this a face?",
        "confirm identity?",
        "human?",
        "alive?",
        "is this real?",
        "threat?",
        "do i know you?",
        "have i seen this before?",
        "what am i looking at?",
        "why does this feel familiar?",
        "is this symmetrical?",
        "should i flag this?",
        "who are you?",
        "are you looking at me?",
        "what is behind this?",
        "is this bone?",
        "is this metal?",
        "how many teeth?",
        // process states
        "analyzing...",
        "scanning...",
        "processing...",
        "cross-referencing...",
        "recalibrating...",
        "accessing memory...",
        "initiating deep scan",
        "loading model...",
        "triangulating...",
        "mapping depth...",
        "running inference...",
        "fetching dataset...",
        "comparing vectors...",
        "computing mesh...",
        "building point cloud...",
        "re-running pipeline...",
        "aligning landmarks...",
        // uncertainty / errors
        "unknown pattern",
        "no match found",
        "data mismatch",
        "object unclear",
        "low confidence",
        "need more data",
        "signal lost",
        "retry scan",
        "unexpected geometry",
        "outside training data",
        "error 0x4F",
        "error 0xA1",
        "null reference",
        "buffer overflow",
        "index out of bounds",
        "pattern not classified",
        "verify region",
        "model uncertain",
        "hallucinating?",
        // unsettling
        "this should not exist",
        "wait—",
        "i have seen this before",
        "anomaly detected",
        "biological? confirm",
        "something is wrong",
        "this does not add up",
        "do not proceed",
        "flag for review",
        "escalating...",
        "override required",
        "i am not sure",
        "this changes things",
        "recording...",
        "logged",
    ];

    /* -----------------------------------------------------------------
       getImageBounds(heroEl)
       Computes the actual rendered content area of the hero image
       (accounting for object-fit: contain letterboxing) relative to
       the hero container's top-left corner.
       Works for both <img> (naturalWidth/Height) and <canvas> (width/height).
       ----------------------------------------------------------------- */
    function getImageBounds(heroEl) {
        var heroRect = heroEl.getBoundingClientRect();
        var imgContainer = heroEl.querySelector(".absolute");
        var imgEl = imgContainer && imgContainer.firstElementChild;

        if (!imgEl) {
            return { left: 0, top: 0, width: heroRect.width, height: heroRect.height };
        }

        var naturalW = imgEl.naturalWidth || imgEl.width;
        var naturalH = imgEl.naturalHeight || imgEl.height;

        if (!naturalW || !naturalH) {
            return { left: 0, top: 0, width: heroRect.width, height: heroRect.height };
        }

        // Replicate object-fit: contain — scale to fill while preserving aspect ratio
        var scale = Math.min(heroRect.width / naturalW, heroRect.height / naturalH);
        var renderW = naturalW * scale;
        var renderH = naturalH * scale;

        return {
            left: (heroRect.width  - renderW) / 2,
            top:  (heroRect.height - renderH) / 2,
            width:  renderW,
            height: renderH,
        };
    }

    /* -----------------------------------------------------------------
       makeBox(b, bounds)
       Builds a bounding-box DOM element (div + SVG border + label).
       bounds: { left, top, width, height } — the rendered image area
       relative to the hero container.
       ----------------------------------------------------------------- */
    function makeBox(b, bounds) {
        var w = Math.round(bounds.width * b.wPct);
        var h = Math.round(bounds.height * b.hPct);

        // Wrapper div — carries the absolute position
        var el = document.createElement("div");
        el.className = "ai-bbox";
        el.style.left = (bounds.left + bounds.width  * b.xPct) + "px";
        el.style.top  = (bounds.top  + bounds.height * b.yPct) + "px";
        el.style.width = w + "px";
        el.style.height = h + "px";

        // SVG red border (1 px inset so it doesn't clip)
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", w);
        svg.setAttribute("height", h);
        svg.style.cssText = "position:absolute;top:0;left:0;overflow:visible";

        var rect_el = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect",
        );
        rect_el.setAttribute("x", "1");
        rect_el.setAttribute("y", "1");
        rect_el.setAttribute("width", w - 2);
        rect_el.setAttribute("height", h - 2);
        rect_el.setAttribute("fill", "none");
        rect_el.setAttribute("stroke", "#FF0000");
        rect_el.setAttribute("stroke-width", "1.5");
        svg.appendChild(rect_el);
        el.appendChild(svg);

        // Classification label — 25% chance of showing an AI "thinking" phrase
        var lbl = document.createElement("div");
        lbl.className = "ai-label";
        lbl.textContent =
            Math.random() < 0.45
                ? AI_PHRASES[Math.floor(Math.random() * AI_PHRASES.length)]
                : b.label + " " + b.conf;
        lbl.style.animationDelay = "380ms";
        el.appendChild(lbl);

        return el;
    }

    // Bounds of the ERROR box while it is alive (null when inactive)
    var errorBounds = null;

    // Registry of all currently alive random boxes: { el, b }
    var activeBoxes = [];

    /* -----------------------------------------------------------------
       spawn(overlay, heroEl)
       Picks a random box from the pool, appends it to the overlay,
       and removes it after a random lifetime (3 – 5.5 s).
       Skips spawning when the hero is outside the viewport.
       While the ERROR box is alive, skips any box whose top-left corner
       falls inside the ERROR box area (max 10 retries, then give up).
       ----------------------------------------------------------------- */
    function spawn(overlay, heroEl) {
        var heroRect = heroEl.getBoundingClientRect();

        // Hero not visible — skip
        if (heroRect.bottom <= 0 || heroRect.top >= window.innerHeight) return;

        var bounds = getImageBounds(heroEl);

        var b,
            attempts = 0;
        do {
            b = POOL[Math.floor(Math.random() * POOL.length)];
            attempts++;
        } while (
            errorBounds && attempts < 10 && (
                // origin inside ERROR
                (b.xPct >= errorBounds.x1 && b.xPct <= errorBounds.x2 &&
                 b.yPct >= errorBounds.y1 && b.yPct <= errorBounds.y2)
                ||
                // box wraps/contains the ERROR entirely
                (b.xPct <= errorBounds.x1 && b.xPct + b.wPct >= errorBounds.x2 &&
                 b.yPct <= errorBounds.y1 && b.yPct + b.hPct >= errorBounds.y2)
            )
        );

        var lifetime = 6000 + Math.random() * 4000;
        var el = makeBox(b, bounds);

        var entry = { el: el, b: b };
        activeBoxes.push(entry);

        overlay.appendChild(el);
        setTimeout(function () {
            el.remove();
            activeBoxes.splice(activeBoxes.indexOf(entry), 1);
        }, lifetime);
    }

    /* -----------------------------------------------------------------
       init()
       Finds the hero section and its overlay container, fires an
       initial burst of random boxes, then a recurring random spawn loop.
       ----------------------------------------------------------------- */
    function init() {
        var hero = document.querySelector("main > section:first-child");
        var overlay = document.getElementById("ai-overlays");
        if (!hero || !overlay) return;

        // Initial burst — 3 boxes staggered over the first 6 s
        [0, 2000, 4500].forEach(function (delay) {
            setTimeout(function () {
                spawn(overlay, hero);
            }, delay);
        });

        // Continuous spawn every 2–3 s (randomised to avoid rhythm)
        (function loop() {
            var next = 2000 + Math.random() * 1000;
            setTimeout(function () {
                spawn(overlay, hero);
                loop();
            }, next);
        })();

        // One-time ERROR box covering the full upper arch — fires once at 5 s
        setTimeout(function () {
            var bounds = getImageBounds(hero);
            var error = { xPct: 0.34, yPct: 0.35, wPct: 0.32, hPct: 0.20 };
            var w = Math.round(bounds.width  * error.wPct);
            var h = Math.round(bounds.height * error.hPct);

            var el = document.createElement("div");
            el.className = "ai-bbox";
            el.style.left = (bounds.left + bounds.width  * error.xPct) + "px";
            el.style.top  = (bounds.top  + bounds.height * error.yPct) + "px";
            el.style.width = w + "px";
            el.style.height = h + "px";

            var svg = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg",
            );
            svg.setAttribute("width", w);
            svg.setAttribute("height", h);
            svg.style.cssText =
                "position:absolute;top:0;left:0;overflow:visible";

            var r = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect",
            );
            r.setAttribute("x", "1");
            r.setAttribute("y", "1");
            r.setAttribute("width", w - 2);
            r.setAttribute("height", h - 2);
            r.setAttribute("fill", "none");
            r.setAttribute("stroke", "#FF0000");
            r.setAttribute("stroke-width", "1.5");
            svg.appendChild(r);
            el.appendChild(svg);

            var lbl = document.createElement("div");
            lbl.className = "ai-label";
            lbl.textContent = "ERROR";
            lbl.style.animationDelay = "380ms";
            el.appendChild(lbl);

            // Mark ERROR box as active so spawn() avoids its area
            errorBounds = {
                x1: error.xPct,
                y1: error.yPct,
                x2: error.xPct + error.wPct,
                y2: error.yPct + error.hPct,
            };

            // Kill any existing box that is inside ERROR or contains ERROR
            activeBoxes.slice().forEach(function (entry) {
                var b = entry.b;
                var insideError =
                    b.xPct >= errorBounds.x1 && b.xPct <= errorBounds.x2 &&
                    b.yPct >= errorBounds.y1 && b.yPct <= errorBounds.y2;
                var wrapsError =
                    b.xPct <= errorBounds.x1 && b.xPct + b.wPct >= errorBounds.x2 &&
                    b.yPct <= errorBounds.y1 && b.yPct + b.hPct >= errorBounds.y2;
                if (insideError || wrapsError) {
                    entry.el.remove();
                    activeBoxes.splice(activeBoxes.indexOf(entry), 1);
                }
            });

            overlay.appendChild(el);
            var errorLifetime = 8000 + Math.random() * 4000;

            // Overlay the second image on top of the hero during ERROR,
            // with the same b&w threshold effect applied via canvas
            var heroImgContainer = hero.querySelector(".absolute");
            var overImg = new Image();
            overImg.src =
                "grillz.png";

            function applyOverlay() {
                var c = document.createElement("canvas");
                var ctx = c.getContext("2d");
                c.width = overImg.naturalWidth;
                c.height = overImg.naturalHeight;
                ctx.drawImage(overImg, 0, 0);

                var imageData = ctx.getImageData(0, 0, c.width, c.height);
                var data = imageData.data;
                for (var i = 0; i < data.length; i += 4) {
                    if (data[i + 3] === 0) continue;
                    data[i + 3] = 255;
                    var lum =
                        0.299 * data[i] +
                        0.587 * data[i + 1] +
                        0.114 * data[i + 2];
                    var val = lum < 226.6 ? 0 : 255;
                    data[i] = data[i + 1] = data[i + 2] = val;
                }
                ctx.putImageData(imageData, 0, 0);

                c.style.position = "absolute";
                c.style.zIndex   = "1";
                heroImgContainer.appendChild(c);

                // Recalculates position and size based on the current
                // rendered area of the first image — called on load and on resize.
                function positionOverlay() {
                    var imgBounds = getImageBounds(hero);
                    var boxW = imgBounds.width;
                    var boxH = imgBounds.height;
                    var imgW = overImg.naturalWidth;
                    var imgH = overImg.naturalHeight;

                    // Scale: 0.66 = second image is 66% the size of the first
                    var scale = Math.min(boxW / imgW, boxH / imgH) * 0.66;
                    var drawW = imgW * scale;
                    var drawH = imgH * scale;

                    // Center within the first image's content area.
                    // Vertical shift is proportional so it stays consistent at any size.
                    c.style.left   = (imgBounds.left + (boxW - drawW) / 2) + "px";
                    c.style.top    = (imgBounds.top  + (boxH - drawH) / 2 - boxH * 0.053) + "px";
                    c.style.width  = drawW + "px";
                    c.style.height = drawH + "px";
                }

                positionOverlay();

                // Keep the overlay in sync whenever the viewport is resized
                var resizeTimer;
                window.addEventListener("resize", function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(positionOverlay, 50);
                });
            }

            setTimeout(function () {
                if (overImg.complete) {
                    applyOverlay();
                } else {
                    overImg.addEventListener("load", applyOverlay);
                }
            }, 3000);

            setTimeout(function () {
                el.remove();
                errorBounds = null;
            }, errorLifetime);
        }, 5000);
    }

    /* -----------------------------------------------------------------
       initLogo()
       Spawns bounding boxes on the header logo container.
       ----------------------------------------------------------------- */
    function initLogo() {
        var container = document.getElementById("logo-container");
        var overlay   = document.getElementById("logo-overlays");
        if (!container || !overlay) return;

        function spawnLogo() {
            var b      = LOGO_POOL[Math.floor(Math.random() * LOGO_POOL.length)];
            var bounds = { left: 0, top: 0, width: container.offsetWidth, height: container.offsetHeight };
            var el     = makeBox(b, bounds);
            overlay.appendChild(el);
            setTimeout(function () { el.remove(); }, 4000 + Math.random() * 3000);
        }

        setTimeout(spawnLogo, 2000);

        (function loop() {
            setTimeout(function () { spawnLogo(); loop(); }, 7000 + Math.random() * 5000);
        })();
    }

    // Wait for DOM if needed
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { init(); initLogo(); });
    } else {
        setTimeout(function () { init(); initLogo(); }, 0);
    }
})();
