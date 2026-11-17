/*
 * Twinter Labs — site content saved from admin.html.
 * content/site.json can hold: text changes, link changes, picture changes and the app video.
 * index.html and posts.html call these helpers so the saved changes show up for visitors.
 * If site.json is empty or missing, the pages look exactly as written in the HTML.
 */
(function (global) {
    'use strict';

    var DATA_URL = 'content/site.json';
    var pending = null;

    function load() {
        if (!pending) {
            pending = fetch(DATA_URL, { cache: 'no-cache' })
                .then(function (res) { return res.ok ? res.json() : {}; })
                .catch(function () { return {}; })
                .then(function (data) { return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; });
        }
        return pending;
    }

    function safeLink(href) {
        return typeof href === 'string' && /^(https?:\/\/|mailto:|tel:)\S+$/i.test(href);
    }

    // How a link is written when the address itself is the visible text (email address, @handle, bare domain).
    function displayText(href) {
        var match;
        if (/^mailto:/i.test(href)) return href.replace(/^mailto:/i, '').split('?')[0];
        if ((match = /^https?:\/\/(?:www\.)?instagram\.com\/([^\/?#]+)/i.exec(href))) return '@' + match[1];
        if ((match = /^https?:\/\/([^\/?#]+)\/?$/i.exec(href))) return match[1];
        return null;
    }

    // Swaps every link whose original address has a replacement in site.links.
    function applyLinks(site, root) {
        var links = (site && site.links) || {};
        (root || document).querySelectorAll('a[href]').forEach(function (anchor) {
            var original = anchor.getAttribute('data-orig-href') || anchor.getAttribute('href');
            var next = links[original];
            if (!safeLink(next)) return;
            anchor.setAttribute('data-orig-href', original);
            anchor.setAttribute('href', next);
            var oldText = displayText(original);
            var newText = displayText(next);
            if (oldText && newText && !anchor.children.length && anchor.textContent.trim() === oldText) {
                anchor.textContent = newText;
            }
        });
    }

    // Swaps every picture whose original file has a replacement in site.images.
    function applyImages(site, root) {
        var images = (site && site.images) || {};
        var positions = { top: 'center top', center: 'center', bottom: 'center bottom' };
        (root || document).querySelectorAll('img[src]').forEach(function (img) {
            var original = img.getAttribute('data-orig-src') || img.getAttribute('src');
            var next = images[original];
            if (!next || typeof next.src !== 'string' || !next.src) return;
            img.setAttribute('data-orig-src', original);
            img.setAttribute('src', next.src);
            img.style.objectPosition = positions[next.pos] || positions.top;
            img.style.transform = 'none';   // drop the zoom/crop that was tuned for the original photo
        });
    }

    // Copies saved text changes into the page's translation dictionary. Returns the changed keys.
    function mergeText(site, translations) {
        var text = (site && site.text) || {};
        var keys = [];
        Object.keys(text).forEach(function (key) {
            var changed = false;
            ['zh', 'en'].forEach(function (lang) {
                var value = text[key] && text[key][lang];
                if (typeof value === 'string' && translations[lang]) {
                    translations[lang][key] = value;
                    changed = true;
                }
            });
            if (changed) keys.push(key);
        });
        return keys;
    }

    global.TLSite = {
        DATA_URL: DATA_URL,
        load: load,
        safeLink: safeLink,
        displayText: displayText,
        applyLinks: applyLinks,
        applyImages: applyImages,
        mergeText: mergeText
    };
})(window);
