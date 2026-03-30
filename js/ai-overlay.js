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
        {
            xPct: 0.02,
            yPct: 0.02,
            wPct: 0.96,
            hPct: 0.96,
            label: "brand_identity",
            conf: "0.99",
        },
        {
            xPct: 0.05,
            yPct: 0.1,
            wPct: 0.9,
            hPct: 0.8,
            label: "logo_mark",
            conf: "0.97",
        },
        {
            xPct: 0.1,
            yPct: 0.2,
            wPct: 0.8,
            hPct: 0.6,
            label: "logotype",
            conf: "0.94",
        },
        {
            xPct: 0.0,
            yPct: 0.0,
            wPct: 0.48,
            hPct: 1.0,
            label: "icon_L",
            conf: "0.88",
        },
        {
            xPct: 0.52,
            yPct: 0.0,
            wPct: 0.48,
            hPct: 1.0,
            label: "icon_R",
            conf: "0.86",
        },
        {
            xPct: 0.15,
            yPct: 0.25,
            wPct: 0.7,
            hPct: 0.5,
            label: "text_region",
            conf: "0.92",
        },
        {
            xPct: 0.3,
            yPct: 0.35,
            wPct: 0.4,
            hPct: 0.3,
            label: "glyph_cluster",
            conf: "0.90",
        },
        {
            xPct: 0.0,
            yPct: 0.25,
            wPct: 0.28,
            hPct: 0.5,
            label: "symbol_L",
            conf: "0.83",
        },
        {
            xPct: 0.72,
            yPct: 0.25,
            wPct: 0.28,
            hPct: 0.5,
            label: "symbol_R",
            conf: "0.81",
        },
        {
            xPct: 0.38,
            yPct: 0.0,
            wPct: 0.24,
            hPct: 0.35,
            label: "apex",
            conf: "0.79",
        },
        {
            xPct: 0.42,
            yPct: 0.65,
            wPct: 0.16,
            hPct: 0.3,
            label: "base_mark",
            conf: "0.77",
        },
        {
            xPct: 0.2,
            yPct: 0.1,
            wPct: 0.18,
            hPct: 0.25,
            label: "glyph_0xA1",
            conf: "0.85",
        },
        {
            xPct: 0.62,
            yPct: 0.1,
            wPct: 0.18,
            hPct: 0.25,
            label: "glyph_0xA2",
            conf: "0.83",
        },
        {
            xPct: 0.44,
            yPct: 0.4,
            wPct: 0.12,
            hPct: 0.2,
            label: "center_glyph",
            conf: "0.91",
        },
        {
            xPct: 0.25,
            yPct: 0.6,
            wPct: 0.5,
            hPct: 0.35,
            label: "lower_mark",
            conf: "0.78",
        },
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
            return {
                left: 0,
                top: 0,
                width: heroRect.width,
                height: heroRect.height,
            };
        }

        var naturalW = imgEl.naturalWidth || imgEl.width;
        var naturalH = imgEl.naturalHeight || imgEl.height;

        if (!naturalW || !naturalH) {
            return {
                left: 0,
                top: 0,
                width: heroRect.width,
                height: heroRect.height,
            };
        }

        // Replicate object-fit: contain — scale to fill while preserving aspect ratio
        var scale = Math.min(
            heroRect.width / naturalW,
            heroRect.height / naturalH,
        );
        var renderW = naturalW * scale;
        var renderH = naturalH * scale;

        return {
            left: (heroRect.width - renderW) / 2,
            top: (heroRect.height - renderH) / 2,
            width: renderW,
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
        el.style.left = bounds.left + bounds.width * b.xPct + "px";
        el.style.top = bounds.top + bounds.height * b.yPct + "px";
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
        // Flip label below the box when it's too close to the top edge
        var boxTop = bounds.top + bounds.height * b.yPct;
        if (boxTop < 25) {
            lbl.style.top = h + "px";
        }
        el.appendChild(lbl);

        return el;
    }

    // Bounds of the ERROR box while it is alive (null when inactive)
    var errorBounds = null;

    // Registry of all currently alive random boxes: { el, b }
    var activeBoxes = [];

    /* -----------------------------------------------------------------
       repositionAll(heroEl)
       Recalculates every active box position relative to the current
       rendered area of the calco image. Called on resize.
       ----------------------------------------------------------------- */
    function repositionAll(heroEl) {
        var bounds = getImageBounds(heroEl);
        activeBoxes.forEach(function (entry) {
            var b = entry.b;
            var w = Math.round(bounds.width  * b.wPct);
            var h = Math.round(bounds.height * b.hPct);
            entry.el.style.left   = (bounds.left + bounds.width  * b.xPct) + "px";
            entry.el.style.top    = (bounds.top  + bounds.height * b.yPct) + "px";
            entry.el.style.width  = w + "px";
            entry.el.style.height = h + "px";
            var svg  = entry.el.querySelector("svg");
            var rect = svg && svg.querySelector("rect");
            if (svg)  { svg.setAttribute("width", w); svg.setAttribute("height", h); }
            if (rect) { rect.setAttribute("width", w - 2); rect.setAttribute("height", h - 2); }
        });
    }

    /* -----------------------------------------------------------------
       spawn(overlay, heroEl)
       Picks a random box from the pool, appends it to the overlay,
       and removes it after a random lifetime (3 – 5.5 s).
       Skips spawning when the hero is outside the viewport.
       While the ERROR box is alive, skips any box whose top-left corner
       falls inside the ERROR box area (max 10 retries, then give up).
       ----------------------------------------------------------------- */
    // Subset of POOL used for random spawning — excludes very small boxes
    var SPAWN_POOL = POOL.filter(function (b) { return b.wPct >= 0.2 && b.hPct >= 0.12; });

    function spawn(overlay, heroEl) {
        var heroRect = heroEl.getBoundingClientRect();

        // Hero not visible — skip
        if (heroRect.bottom <= 0 || heroRect.top >= window.innerHeight) return;

        // Never show more than 2 boxes at the same time
        if (activeBoxes.length >= 2) return;

        var bounds = getImageBounds(heroEl);

        var b,
            attempts = 0;
        do {
            b = SPAWN_POOL[Math.floor(Math.random() * SPAWN_POOL.length)];
            attempts++;
        } while (
            errorBounds &&
            attempts < 10 &&
            // origin inside ERROR
            ((b.xPct >= errorBounds.x1 &&
                b.xPct <= errorBounds.x2 &&
                b.yPct >= errorBounds.y1 &&
                b.yPct <= errorBounds.y2) ||
                // box wraps/contains the ERROR entirely
                (b.xPct <= errorBounds.x1 &&
                    b.xPct + b.wPct >= errorBounds.x2 &&
                    b.yPct <= errorBounds.y1 &&
                    b.yPct + b.hPct >= errorBounds.y2))
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
    function init(startLogoLoop) {
        var hero = document.getElementById("hero");
        var overlay = document.getElementById("ai-overlays");
        if (!hero || !overlay) return;

        // Reposition all active boxes on resize
        var reposTimer;
        window.addEventListener("resize", function () {
            clearTimeout(reposTimer);
            reposTimer = setTimeout(function () { repositionAll(hero); }, 50);
        });

        // One-time ERROR box covering the full upper arch — fires once at 5 s
        setTimeout(function () {
            // ERROR box element — positioned later once grillz canvas is placed
            var el = document.createElement("div");
            el.className = "ai-bbox";
            el.style.left   = "-9999px"; // hidden until canvas is ready
            el.style.top    = "-9999px";
            el.style.width  = "0px";
            el.style.height = "0px";

            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.cssText = "position:absolute;top:0;left:0;overflow:visible";
            var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            r.setAttribute("fill", "none");
            r.setAttribute("stroke", "#FF0000");
            r.setAttribute("stroke-width", "1.5");
            svg.appendChild(r);
            el.appendChild(svg);

            var lbl = document.createElement("div");
            lbl.className = "ai-label";
            lbl.textContent = "ERROR";
            lbl.style.animationDelay = "190ms";
            el.appendChild(lbl);

            var errorCaptionStarted = false;
            var cleanupExtras = null;

            function startErrorCaptionCycle() {
                if (errorCaptionStarted) return;
                errorCaptionStarted = true;
                setTimeout(function () {
                    // Change ERROR caption
                    lbl.style.animation = "none";
                    lbl.textContent = "something is missing";
                    void lbl.offsetWidth;
                    lbl.style.animation = "";

                    // 0.5s later: header box + PROCESSING + lines
                    setTimeout(function () {
                        var logoContainer = document.getElementById("logo-container");
                        var logoOverlay   = document.getElementById("logo-overlays");
                        if (!logoContainer || !logoOverlay) return;

                        // New header box (no caption)
                        var lr = logoContainer.getBoundingClientRect();
                        var hbox = document.createElement("div");
                        hbox.className = "ai-bbox";
                        var hw = Math.round(lr.width);
                        var hh = Math.round(lr.height);
                        hbox.style.left   = lr.left + "px";
                        hbox.style.top    = lr.top  + "px";
                        hbox.style.width  = hw + "px";
                        hbox.style.height = hh + "px";
                        var hsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        hsvg.setAttribute("width", hw);
                        hsvg.setAttribute("height", hh);
                        hsvg.style.cssText = "position:absolute;top:0;left:0;overflow:visible";
                        var hrect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        hrect.setAttribute("x", "1"); hrect.setAttribute("y", "1");
                        hrect.setAttribute("width", hw - 2); hrect.setAttribute("height", hh - 2);
                        hrect.setAttribute("fill", "none");
                        hrect.setAttribute("stroke", "#FF0000");
                        hrect.setAttribute("stroke-width", "1.5");
                        hsvg.appendChild(hrect);
                        hbox.appendChild(hsvg);
                        logoOverlay.appendChild(hbox);

                        // PROCESSING label — same approach as all other boxes:
                        // position:absolute inside #ai-overlays with explicit left/top
                        // pixels computed from hero dimensions. opacity:0 on insert
                        // (element is laid out but invisible) so no flash at (0,0).
                        var procEl = document.createElement("div");
                        procEl.style.cssText = "opacity:0;position:absolute;z-index:1001;pointer-events:none;font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1;color:#fff;background:#ff0000;padding:2px 5px;white-space:nowrap;letter-spacing:0.04em;";
                        procEl.textContent = "PROCESSING.";
                        overlay.appendChild(procEl);

                        function positionProc() {
                            var heroW = hero.offsetWidth;
                            var heroH = hero.offsetHeight;
                            var procW = procEl.offsetWidth;
                            var procH = procEl.offsetHeight;
                            var mobileOffset = heroW < 768 ? 200 : 0;
                            procEl.style.textAlign = heroW < 768 ? "right" : "";
                            procEl.style.left = (heroW - 120 - procW) + "px";
                            procEl.style.top  = (heroH / 2 - procH / 2 - mobileOffset) + "px";
                        }
                        positionProc();

                        var dotsInterval;
                        setTimeout(function () {
                            requestAnimationFrame(function () {
                                requestAnimationFrame(function () {
                                    procEl.style.opacity = "";
                                    void procEl.offsetWidth; // flush style before animation
                                    procEl.style.animation = "ai-label-in 0.11s ease-out forwards";
                                    updateLines();
                                });
                            });

                            // Animated dots
                            var dotCount = 1;
                            dotsInterval = setInterval(function () {
                                dotCount = (dotCount % 3) + 1;
                                procEl.textContent = "PROCESSING" + Array(dotCount + 1).join(".");
                            }, 200);
                        }, 300);

                        // Connecting lines — live inside logoOverlay (position:fixed;inset:0)
                        // so they are never clipped by hero's overflow:hidden, and use
                        // getBoundingClientRect() (viewport coords) for all endpoints.
                        // updateLines is called on both resize and scroll so lines track
                        // procEl and el as they scroll with the hero.
                        var lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        lineSvg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:999;overflow:visible;";
                        var line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        var line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        [line1, line2].forEach(function (l) {
                            l.setAttribute("stroke", "#FF0000");
                            l.setAttribute("stroke-width", "1");
                            lineSvg.appendChild(l);
                        });
                        logoOverlay.appendChild(lineSvg);

                        function updateLines() {
                            var errR  = el.getBoundingClientRect();
                            var hboxR = hbox.getBoundingClientRect();
                            var procR = procEl.getBoundingClientRect();
                            var px = window.innerWidth < 768 ? procR.right : procR.left;
                            var py = procR.top + procR.height / 2;
                            line1.setAttribute("x1", errR.right);
                            line1.setAttribute("y1", errR.top + errR.height / 2);
                            line1.setAttribute("x2", px);
                            line1.setAttribute("y2", py);
                            line2.setAttribute("x1", hboxR.right);
                            line2.setAttribute("y1", hboxR.top + hboxR.height / 2);
                            line2.setAttribute("x2", px);
                            line2.setAttribute("y2", py);
                        }

                        updateLines();
                        var lineResizeTimer;
                        window.addEventListener("resize", function () {
                            clearTimeout(lineResizeTimer);
                            lineResizeTimer = setTimeout(function () {
                                positionProc();
                                updateLines();
                            }, 50);
                        });
                        window.addEventListener("scroll", updateLines);

                        cleanupExtras = function () {
                            // hbox + its connecting line disappear immediately at errorLifetime
                            hbox.remove();
                            line2.remove();
                            // Switch caption to DONE and stop dots
                            clearInterval(dotsInterval);
                            procEl.textContent = "DONE";
                            positionProc();
                            updateLines();
                            // ERROR box + PROCESSING caption + remaining line linger 0.5s longer
                            setTimeout(function () {
                                procEl.remove();
                                lineSvg.remove();
                                window.removeEventListener("scroll", updateLines);
                            }, 1000);
                        };
                    }, 500);
                }, 1250);
            }

            overlay.appendChild(el);
            // Timed to disappear 500ms after grillz2 blink ends:
            // applyOverlay at +1500ms, reveal at +3500ms, blink 5×250ms = +1250ms → end at +6250ms
            // ERROR+DONE linger 1000ms after cleanupExtras → errorLifetime = 6750 - 1000 = 5750ms
            var errorLifetime = 5750;

            // Overlay the second image on top of the hero during ERROR,
            // with the same b&w threshold effect applied via canvas
            var heroImgContainer = hero.querySelector(".absolute");
            var overImg = new Image();
            overImg.src = "grillz2.png";

            function applyOverlay() {
                var c = document.createElement("canvas");
                var ctx = c.getContext("2d");
                c.width = overImg.naturalWidth;
                c.height = overImg.naturalHeight;
                ctx.drawImage(overImg, 0, 0);

                var imageData = ctx.getImageData(0, 0, c.width, c.height);
                var src = imageData.data;

                // Build two pixel arrays from the original image data
                var redArr   = new Uint8ClampedArray(src.length);
                var blackArr = new Uint8ClampedArray(src.length);
                for (var i = 0; i < src.length; i += 4) {
                    if (src[i + 3] === 0) { redArr[i+3] = blackArr[i+3] = 0; continue; }
                    redArr[i+3] = blackArr[i+3] = 255;
                    var lum = 0.299 * src[i] + 0.587 * src[i+1] + 0.114 * src[i+2];
                    if (lum < 190) {
                        // dark pixel: red in one version, black in the other
                        redArr[i]   = 255; redArr[i+1]   = 0;   redArr[i+2]   = 0;
                        blackArr[i] = 0;   blackArr[i+1] = 0;   blackArr[i+2] = 0;
                    } else {
                        // light pixel: white in both
                        redArr[i]   = blackArr[i]   = 255;
                        redArr[i+1] = blackArr[i+1] = 255;
                        redArr[i+2] = blackArr[i+2] = 255;
                    }
                }
                var imgDataRed   = new ImageData(redArr,   c.width, c.height);
                var imgDataBlack = new ImageData(blackArr, c.width, c.height);

                // Start invisible with red frame ready
                ctx.putImageData(imgDataRed, 0, 0);
                c.style.position = "absolute";
                c.style.zIndex   = "1";
                c.style.opacity  = "0";
                heroImgContainer.appendChild(c);

                // Reveal then blink red→black 3 times, settle on black
                setTimeout(function () {
                    c.style.opacity = "1";
                    var blink = 0;
                    var iv = setInterval(function () {
                        blink++;
                        ctx.putImageData(blink % 2 === 0 ? imgDataRed : imgDataBlack, 0, 0);
                        if (blink >= 5) {
                            clearInterval(iv);
                            ctx.putImageData(imgDataBlack, 0, 0);
                        }
                    }, 250);
                }, 3500);

                // Syncs both canvas and ERROR box to current layout
                function positionOverlay() {
                    var imgBounds = getImageBounds(hero);
                    var boxW = imgBounds.width;
                    var boxH = imgBounds.height;
                    var imgW = overImg.naturalWidth;
                    var imgH = overImg.naturalHeight;

                    var scale = Math.min(boxW / imgW, boxH / imgH) * 0.66;
                    var drawW = imgW * scale;
                    var drawH = imgH * scale;

                    var left = imgBounds.left + (boxW - drawW) / 2;
                    var top  = imgBounds.top  + (boxH - drawH) / 2 - boxH * 0.06;

                    c.style.left   = left + "px";
                    c.style.top    = top  + "px";
                    c.style.width  = drawW + "px";
                    c.style.height = drawH + "px";

                    // Align ERROR box exactly to canvas bounds
                    var w = Math.round(drawW);
                    var h = Math.round(drawH);
                    el.style.left   = left + "px";
                    el.style.top    = top  + "px";
                    el.style.width  = w + "px";
                    el.style.height = h + "px";

                    svg.setAttribute("width",  w);
                    svg.setAttribute("height", h);
                    r.setAttribute("x", "1");
                    r.setAttribute("y", "1");
                    r.setAttribute("width",  w - 2);
                    r.setAttribute("height", h - 2);

                    // Update errorBounds as fractions of hero for spawn avoidance
                    var heroW = hero.offsetWidth;
                    var heroH = hero.offsetHeight;
                    errorBounds = {
                        x1: left / heroW,
                        y1: top  / heroH,
                        x2: (left + drawW) / heroW,
                        y2: (top  + drawH) / heroH,
                    };

                    // Kill any existing box overlapping ERROR
                    activeBoxes.slice().forEach(function (entry) {
                        var b = entry.b;
                        var inside  = b.xPct >= errorBounds.x1 && b.xPct <= errorBounds.x2 && b.yPct >= errorBounds.y1 && b.yPct <= errorBounds.y2;
                        var wraps   = b.xPct <= errorBounds.x1 && b.xPct + b.wPct >= errorBounds.x2 && b.yPct <= errorBounds.y1 && b.yPct + b.hPct >= errorBounds.y2;
                        if (inside || wraps) {
                            entry.el.remove();
                            activeBoxes.splice(activeBoxes.indexOf(entry), 1);
                        }
                    });
                }

                positionOverlay();
                // Restart label animation now that the box is visible
                lbl.style.animation = "none";
                void lbl.offsetWidth;
                lbl.style.animation = "";
                startErrorCaptionCycle();

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
            }, 1500);

            setTimeout(function () {
                // hbox removed now; el + procEl linger 0.5s more (inside cleanupExtras)
                if (cleanupExtras) cleanupExtras();

                setTimeout(function () {
                    el.remove();
                    errorBounds = null;

                    // Start random spawn loops only after ERROR disappears
                    (function loop() {
                        var next = 500 + Math.random() * 1000;
                        setTimeout(function () {
                            spawn(overlay, hero);
                            loop();
                        }, next);
                    })();
                    if (startLogoLoop) startLogoLoop();
                }, 1000);
            }, errorLifetime);
        }, 1250);
    }

    /* -----------------------------------------------------------------
       initLogo()
       Spawns bounding boxes on the header logo container.
       ----------------------------------------------------------------- */
    function initLogo() {
        var container = document.getElementById("logo-container");
        var overlay = document.getElementById("logo-overlays");
        if (!container || !overlay) return;

        function spawnLogo() {
            var b = LOGO_POOL[Math.floor(Math.random() * LOGO_POOL.length)];
            var rect = container.getBoundingClientRect();
            var bounds = {
                left: rect.left,
                top:  rect.top,
                width:  rect.width,
                height: rect.height,
            };
            var el = makeBox(b, bounds);
            overlay.appendChild(el);
            setTimeout(
                function () {
                    el.remove();
                },
                2000 + Math.random() * 1000,
            );
        }

        // Scripted intro sequence — fires once at page load
        setTimeout(function () {
            var introB = { xPct: 0, yPct: 0, wPct: 1, hPct: 1 };
            var rect   = container.getBoundingClientRect();
            var bounds = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
            var el     = makeBox(introB, bounds);
            var lbl    = el.querySelector(".ai-label");
            overlay.appendChild(el);

            // Keep box aligned to logo on resize
            var resizeTimer;
            function reposition() {
                var r = container.getBoundingClientRect();
                el.style.left   = r.left + "px";
                el.style.top    = r.top  + "px";
                el.style.width  = r.width  + "px";
                el.style.height = r.height + "px";
                var svg  = el.querySelector("svg");
                var rect = svg && svg.querySelector("rect");
                if (svg)  { svg.setAttribute("width", r.width); svg.setAttribute("height", r.height); }
                if (rect) { rect.setAttribute("width", r.width - 2); rect.setAttribute("height", r.height - 2); }
            }
            window.addEventListener("resize", function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(reposition, 50);
            });

            var captions = ["what is that?", "LACENSE", "that's fucking cool"];
            var idx = 0;

            function nextCaption() {
                lbl.style.animation = "none";
                lbl.textContent = captions[idx];
                void lbl.offsetWidth;
                lbl.style.animation = "";
                idx++;
                if (idx < captions.length) {
                    setTimeout(nextCaption, 2000);
                } else {
                    // Remove box after last caption
                    setTimeout(function () { el.remove(); }, 2000);
                }
            }

            nextCaption();
        }, 1000);

        return function startLogoLoop() {
            (function loop() {
                setTimeout(function () {
                    spawnLogo();
                    loop();
                }, 10000 + Math.random() * 8000);
            })();
        };
    }

    // Wait for DOM if needed
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            var startLogoLoop = initLogo();
            init(startLogoLoop);
        });
    } else {
        setTimeout(function () {
            var startLogoLoop = initLogo();
            init(startLogoLoop);
        }, 0);
    }
})();
