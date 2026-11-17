/*
 * Twinter Labs — shared post helpers.
 * Used by index.html (latest posts), posts.html (all posts + single post) and admin.html (preview).
 * Posts live in content/posts.json and are written by admin.html.
 */
(function (global) {
    'use strict';

    var DATA_URL = 'content/posts.json';

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Only http(s), mailto and same-site relative links are allowed in post text.
    function safeHref(url) {
        if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
        if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
        return url;
    }

    // Inline formatting: **bold**, [text](link) and bare links. Input is escaped first.
    function inline(text) {
        var pattern = /\[([^\]\n]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<]+)|\*\*([^*\n]+)\*\*/g;
        return esc(text).replace(pattern, function (match, label, href, bare, bold) {
            if (bold !== undefined) return '<strong>' + bold + '</strong>';
            var tail = '';
            if (bare !== undefined) {
                var trimmed = bare.replace(/(?:[.,;:!?)\]。，、；：！？）」』]|&quot;|&#39;)+$/, '');
                tail = bare.slice(trimmed.length);
                href = trimmed;
                label = trimmed;
            }
            var safe = safeHref(href);
            if (!safe) return match;
            var external = /^https?:/i.test(safe);
            return '<a href="' + safe + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>' + tail;
        });
    }

    /*
     * Turns post text into HTML. Supported:
     *   blank line      -> new paragraph        ## Heading  -> heading
     *   - item / 1. item -> lists               **bold**, [text](link), bare links
     */
    function renderBody(text) {
        var lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
        var html = [];
        var para = [];
        var list = null;

        function flushPara() {
            if (para.length) html.push('<p>' + para.map(inline).join('<br>') + '</p>');
            para = [];
        }
        function flushList() {
            if (list) {
                html.push('<' + list.tag + '>' + list.items.map(function (item) {
                    return '<li>' + inline(item) + '</li>';
                }).join('') + '</' + list.tag + '>');
            }
            list = null;
        }

        lines.forEach(function (raw) {
            var line = raw.trim();
            var match;
            if (!line) { flushPara(); flushList(); return; }
            if ((match = /^#{1,3}\s+(.+)$/.exec(line))) {
                flushPara(); flushList();
                html.push('<h3>' + inline(match[1]) + '</h3>');
                return;
            }
            if ((match = /^[-*•]\s+(.+)$/.exec(line)) || (match = /^\d+[.)]\s+(.+)$/.exec(line))) {
                var tag = /^\d/.test(line) ? 'ol' : 'ul';
                flushPara();
                if (list && list.tag !== tag) flushList();
                if (!list) list = { tag: tag, items: [] };
                list.items.push(match[1]);
                return;
            }
            flushList();
            para.push(line);
        });
        flushPara();
        flushList();
        return html.join('\n');
    }

    // Plain-text preview of a post body for cards.
    function excerpt(text, max) {
        var plain = String(text || '')
            .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')
            .replace(/\*\*([^*\n]+)\*\*/g, '$1')
            .replace(/^\s*(#{1,3}|[-*•]|\d+[.)])\s+/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
        max = max || 90;
        return plain.length > max ? plain.slice(0, max).trim() + '…' : plain;
    }

    // Picks the text for the current language, falling back to the other one.
    function pick(field, lang) {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field.zh || field.en || '';
    }

    function formatDate(date) {
        return String(date || '').replace(/-/g, '.');
    }

    function youtubeId(input) {
        var value = String(input || '').trim();
        var match = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/.exec(value);
        if (match) return match[1];
        return /^[\w-]{11}$/.test(value) ? value : null;
    }

    function coverOf(post) {
        var item = (post.media || [])[0];
        if (!item) return null;
        if (item.type === 'image') return { kind: 'image', src: item.src };
        if (item.type === 'youtube') return { kind: 'video', src: 'https://i.ytimg.com/vi/' + item.id + '/hqdefault.jpg' };
        if (item.type === 'video') return item.poster ? { kind: 'video', src: item.poster } : { kind: 'video', video: item.src };
        return null;
    }

    function sortPosts(posts) {
        return posts.map(function (post, index) { return { post: post, index: index }; })
            .sort(function (a, b) {
                if (a.post.date === b.post.date) return a.index - b.index;
                return a.post.date < b.post.date ? 1 : -1;
            })
            .map(function (entry) { return entry.post; });
    }

    // Loads published posts, newest first.
    function load() {
        return fetch(DATA_URL, { cache: 'no-cache' })
            .then(function (res) { return res.ok ? res.json() : { posts: [] }; })
            .then(function (data) {
                var posts = (data && data.posts) || [];
                return sortPosts(posts.filter(function (post) { return post.published !== false; }));
            })
            .catch(function () { return []; });
    }

    function postUrl(post, lang) {
        return 'posts.html?id=' + encodeURIComponent(post.id) + (lang === 'en' ? '&lang=en' : '');
    }

    // Card used on the home page and on posts.html (Tailwind classes, same look as the rest of the site).
    function cardHTML(post, lang) {
        var title = pick(post.title, lang);
        var summary = excerpt(pick(post.body, lang), 96);
        var cover = coverOf(post);
        var count = (post.media || []).length;
        var coverHtml = '';
        if (cover) {
            var visual = cover.video
                ? '<video src="' + esc(cover.video) + '#t=0.1" muted playsinline preload="metadata" class="w-full h-full object-cover"></video>'
                : '<img src="' + esc(cover.src) + '" alt="" loading="lazy" class="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500">';
            var play = cover.kind === 'video'
                ? '<span class="absolute inset-0 flex items-center justify-center"><span class="w-12 h-12 rounded-full bg-card/90 shadow-soft flex items-center justify-center text-ink"><i class="fa-solid fa-play text-sm ml-0.5"></i></span></span>'
                : '';
            var badge = count > 1
                ? '<span class="absolute top-3 right-3 px-2 py-1 rounded-lg bg-card/90 text-ink font-sans text-[10px]"><i class="fa-regular fa-images mr-1"></i>' + count + '</span>'
                : '';
            coverHtml = '<div class="relative aspect-[16/10] bg-mint-soft overflow-hidden">' + visual + play + badge + '</div>';
        }
        return '<a href="' + esc(postUrl(post, lang)) + '" class="group flex flex-col bg-card rounded-2xl shadow-soft border border-line hover:border-sea hover:shadow-lift overflow-hidden transition">' +
            coverHtml +
            '<div class="p-5 sm:p-6 flex flex-col gap-3 flex-1">' +
                '<span class="text-xs font-semibold uppercase tracking-wider text-mint-deep">' + esc(formatDate(post.date)) + '</span>' +
                '<h3 class="font-display text-lg font-bold text-ink leading-snug group-hover:text-mint-deep transition">' + esc(title) + '</h3>' +
                (summary ? '<p class="text-muted text-sm leading-relaxed">' + esc(summary) + '</p>' : '') +
                '<span class="mt-auto pt-2 text-sm text-mint-deep font-semibold hover:underline">' + (lang === 'en' ? 'Read more' : '閱讀全文') + ' →</span>' +
            '</div>' +
        '</a>';
    }

    global.TLPosts = {
        DATA_URL: DATA_URL,
        esc: esc,
        renderBody: renderBody,
        excerpt: excerpt,
        pick: pick,
        formatDate: formatDate,
        youtubeId: youtubeId,
        coverOf: coverOf,
        sortPosts: sortPosts,
        load: load,
        postUrl: postUrl,
        cardHTML: cardHTML
    };
})(window);
