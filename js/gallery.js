(async function () {
    'use strict';

    var grid  = document.getElementById('gallery-grid');
    var count = document.getElementById('gallery-count');
    if (!grid) return;

    var items = [];
    try {
        var res = await fetch('data/posts.json');
        if (!res.ok) throw new Error('posts.json non trovato');
        items = await res.json();
    } catch (e) {
        return;
    }

    if (count) {
        var n = String(items.length).padStart(3, '0');
        count.textContent = '[TOTAL_UNITS: ' + n + ']';
    }

    if (items.length === 0) {
        grid.innerHTML = '<p class="font-label text-[11px] uppercase tracking-widest text-black col-span-4">[NO_ITEMS_IN_GALLERY]</p>';
        return;
    }

    var GALLERY_PHRASES = [
        'analyzing...', 'scanning...', 'processing...', 'mapping depth...',
        'running inference...', 'computing mesh...', 'what is that?',
        'is this metal?', 'material detected', 'cross-referencing...',
        'gem_cluster', 'refractive_node', 'unknown pattern', 'low confidence',
        'verify region', 'object unclear', 'triangulating...', 'aligning...',
        'diamond_set', 'metal_alloy', 'surface_scan', 'anomaly detected',
        'high reflectivity', 'luxury_item', 'precious_material', 'hallucinating?',
    ];

    grid.innerHTML = items.map(function (item) {
        var details = '';
        if (item.material)                        details += '<div>MATERIALE: ' + item.material + '</div>';
        if (item.finitura)                        details += '<div>FINITURA: ' + item.finitura + '</div>';
        if (item.detailLabel && item.detailValue) details += '<div>' + item.detailLabel + ': ' + item.detailValue + '</div>';
        if (item.weight)                          details += '<div>PESO: ' + item.weight + '</div>';

        var hasInfo = item.title || details;
        var infoBlock = hasInfo ? [
            '  <div class="p-6">',
            item.title ? '    <h3 class="font-headline font-bold text-xl text-black mb-2 uppercase tracking-tight">' + item.title + '</h3>' : '',
            details    ? '    <div class="font-label text-[10px] text-black mb-4 space-y-1 uppercase">' + details + '</div>' : '',
            '  </div>',
        ].join('\n') : '';

        var borderBottom = hasInfo ? ' border-b border-black' : '';

        return [
            '<div class="group bg-white border border-black relative">',
            '  <div class="aspect-square relative overflow-hidden bg-white' + borderBottom + '">',
            '    <img',
            '      alt="' + (item.title || '') + '"',
            '      class="w-full h-full object-contain grayscale contrast-125"',
            '      src="assets/posts/' + item.filename + '"',
            '    />',
            '  </div>',
            infoBlock,
            '</div>',
        ].join('\n');
    }).join('\n');

    // ── Gallery AI overlay ────────────────────────────────────────────────────
    var galleryCount = 0;

    function spawnGalleryBox(exclude) {
        if (galleryCount >= 2) return null;

        var containers = grid.querySelectorAll('.aspect-square');
        if (!containers.length) return null;

        var visible = Array.prototype.filter.call(containers, function (c) {
            if (c === exclude) return false;
            var r = c.getBoundingClientRect();
            return r.bottom > 0 && r.top < window.innerHeight;
        });
        if (!visible.length) return null;

        var container = visible[Math.floor(Math.random() * visible.length)];

        var wPct = 0.20 + Math.random() * 0.35;
        var hPct = 0.20 + Math.random() * 0.35;
        var xPct = Math.random() * (1 - wPct);
        var yPct = Math.random() * (1 - hPct);

        var card = container.parentElement;
        var cw = container.offsetWidth;
        var ch = container.offsetHeight;
        var bx = Math.round(xPct * cw);
        var by = Math.round(yPct * ch);
        var bw = Math.round(wPct * cw);
        var bh = Math.round(hPct * ch);
        var offsetTop  = container.offsetTop;
        var offsetLeft = container.offsetLeft;

        var el = document.createElement('div');
        el.style.cssText = 'position:absolute;left:' + (offsetLeft + bx) + 'px;top:' + (offsetTop + by) + 'px;width:' + bw + 'px;height:' + bh + 'px;pointer-events:none;z-index:10;';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', bw); svg.setAttribute('height', bh);
        svg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;';
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '1'); rect.setAttribute('y', '1');
        rect.setAttribute('width', bw - 2); rect.setAttribute('height', bh - 2);
        rect.setAttribute('fill', 'none'); rect.setAttribute('stroke', '#FF0000'); rect.setAttribute('stroke-width', '1.5');
        svg.appendChild(rect); el.appendChild(svg);

        var lbl = document.createElement('div');
        lbl.textContent = GALLERY_PHRASES[Math.floor(Math.random() * GALLERY_PHRASES.length)];
        lbl.style.cssText = 'position:absolute;top:-16px;left:0;font-family:"Courier New",monospace;font-size:9px;color:#fff;background:#ff0000;padding:1px 4px;white-space:nowrap;letter-spacing:0.04em;';
        el.appendChild(lbl);

        galleryCount++;
        card.appendChild(el);

        setTimeout(function () {
            el.remove();
            galleryCount--;
        }, 4500 + Math.random() * 1000);

        return container;
    }

    // Initial delay then loop every 10–15 s
    // 40% delle volte spawna 2 box su card diverse
    setTimeout(function loop() {
        var first = spawnGalleryBox(null);
        if (first && Math.random() < 0.40) {
            spawnGalleryBox(first);
        }
        setTimeout(loop, 10000 + Math.random() * 5000);
    }, 3000);
})();
