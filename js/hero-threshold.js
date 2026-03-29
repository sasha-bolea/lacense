/**
 * hero-threshold.js — Grillz Tech
 *
 * Applies a black-and-white threshold effect to the hero image using
 * the Canvas 2D API. Each pixel is converted to pure black or white
 * based on its perceived luminance vs. a configurable threshold value.
 *
 * The original <img> tag is replaced by the processed <canvas> so the
 * result is rendered in place with identical layout classes.
 */

(function () {
    "use strict";

    /* -----------------------------------------------------------------
       Configuration
       threshold: luminance cut-off (0–255).
         Lower  → more pixels become black (darker image).
         Higher → more pixels become white (lighter image).
       ----------------------------------------------------------------- */
    var THRESHOLD = 227.3;

    /* -----------------------------------------------------------------
       applyThreshold(img)
       Draws the image onto an offscreen canvas, iterates every pixel,
       converts to luminance, then snaps to 0 or 255 (b&w).
       Replaces the <img> with the resulting <canvas> in the DOM.
       ----------------------------------------------------------------- */
    function applyThreshold(img) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        // Match canvas size to the image's natural resolution
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Preserve any inline styles and Tailwind classes from the original img
        canvas.style.cssText = img.style.cssText;
        canvas.className = img.className;

        ctx.drawImage(img, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data; // flat RGBA array

        for (var i = 0; i < data.length; i += 4) {
            // Skip fully transparent pixels — leave them untouched
            if (data[i + 3] === 0) continue;
            // Make all visible pixels fully opaque to avoid semi-transparent grey
            data[i + 3] = 255;

            // Perceived luminance — ITU-R BT.601 coefficients
            var luminance =
                0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

            // Snap to black or white; alpha left unchanged
            var value = luminance < THRESHOLD ? 0 : 255;
            data[i] = value; // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
        }

        ctx.putImageData(imageData, 0, 0);

        // Swap <img> for <canvas> in the DOM
        img.replaceWith(canvas);
    }

    /* -----------------------------------------------------------------
       Boot — find the hero image and apply effect once it has loaded.
       ----------------------------------------------------------------- */
    var img = document.querySelector('section img[alt="Grillz"]');
    if (!img) return;

    if (img.complete) {
        applyThreshold(img);
    } else {
        img.addEventListener("load", function () {
            applyThreshold(img);
        });
    }
})();
