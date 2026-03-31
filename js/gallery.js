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

    grid.innerHTML = items.map(function (item) {
        return [
            '<div class="group bg-white border border-black relative">',
            '  <div class="aspect-square relative overflow-hidden bg-white border-b border-black">',
            '    <img',
            '      alt="' + item.title + '"',
            '      class="w-full h-full object-cover grayscale contrast-125"',
            '      src="assets/posts/' + item.filename + '"',
            '    />',
            '  </div>',
            '  <div class="p-6">',
            '    <h3 class="font-headline font-bold text-xl text-black mb-2 uppercase tracking-tight">',
            '      ' + item.title,
            '    </h3>',
            '    <div class="font-label text-[10px] text-black mb-4 space-y-1 uppercase">',
            '      <div>MATERIAL: ' + item.material + '</div>',
            '      <div>' + item.detailLabel + ': ' + item.detailValue + '</div>',
            '      <div>WEIGHT: ' + item.weight + '</div>',
            '    </div>',
            '  </div>',
            '</div>',
        ].join('\n');
    }).join('\n');
})();
