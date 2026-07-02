console.log('[Mindcraft] content script loaded on', window.location.href);

// ---- Boot on load ----
bootFocusIfEnabled();

// Listen for toggle updates from popup
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'FOCUS_MODE_UPDATED') {
        if (msg.enabled) {
            console.log('[Mindcraft] Focus mode enabled from popup');
            bootFocusIfEnabled(true);
        } else {
            console.log('[Mindcraft] Focus mode disabled from popup, reloading YouTube');
            window.location.reload();
        }
    }
});

// ------------ Core logic ------------

function bootFocusIfEnabled(force = false) {
    if (!isHomePage()) {
        console.log('[Mindcraft] Not YouTube home, skipping focus mode');
        return;
    }

    chrome.storage.sync.get(['focusModeEnabled'], ({ focusModeEnabled }) => {
        console.log('[Mindcraft] focusModeEnabled:', focusModeEnabled, 'force:', force);

        if (!force && !focusModeEnabled) return;

        requestFocusDataAndRender();
    });
}

function requestFocusDataAndRender() {
    if (document.getElementById('mindcraft-focus-root')) {
        console.log('[Mindcraft] Focus view already rendered, skipping');
        return;
    }

    console.log('[Mindcraft] Requesting focus data from background...');

    chrome.runtime.sendMessage({ type: 'GET_FOCUS_DATA' }, (res) => {
        if (chrome.runtime.lastError) {
            console.error(
                '[Mindcraft] Error talking to background:',
                chrome.runtime.lastError.message
            );
            return;
        }

        if (!res || !res.ok) {
            console.log('[Mindcraft] No auth / failed to load data, skipping focus mode');
            return;
        }

        const { user, paths } = res;
        console.log('[Mindcraft] Received focus data from background:', { user, paths });

        if (!user) {
            console.log('[Mindcraft] No user from background, skipping focus mode');
            return;
        }

        const normalized = normalizePathsWithYouTubeResources(paths);

        console.log('[Mindcraft] Normalized paths:', normalized);

        if (!normalized.length) {
            console.log('[Mindcraft] No valid youtubeResources found, skipping focus mode');
            return;
        }

        injectStyles();
        renderFocusView(normalized);
    });
}

function isHomePage() {
    const url = new URL(window.location.href);
    return url.pathname === '/' || url.pathname === '/feed/subscriptions';
}

function normalizePathsWithYouTubeResources(paths) {
    if (!Array.isArray(paths)) return [];

    return paths
        .map((path) => {
            const rawGroups = Array.isArray(path.youtubeResources)
                ? path.youtubeResources
                : [];

            const groups = rawGroups
                .map((group) => {
                    const query = (group && group.query) || '';
                    const rawResources = Array.isArray(group.resources)
                        ? group.resources
                        : [];

                    const resources = rawResources
                        .map((res) => {
                            const videoId = res?.id?.videoId;
                            const snippet = res?.snippet;

                            if (!videoId || !snippet || !snippet.title) return null;

                            return {
                                videoId,
                                snippet,
                            };
                        })
                        .filter(Boolean);

                    if (!resources.length) return null;

                    return {
                        query: String(query),
                        resources,
                    };
                })
                .filter(Boolean);

            if (!groups.length) return null;

            return {
                id: path.id || path._id || '',
                name: path.name || 'Learning path',
                groups,
            };
        })
        .filter(Boolean);
}

// ------------ Styles ------------

function injectStyles() {
    if (document.getElementById('mindcraft-focus-style')) return;

    const link = document.createElement('link');
    link.id = 'mindcraft-focus-style';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('contentScript.css');
    document.head.appendChild(link);
}

// ------------ UI Rendering: Path -> Query -> Videos ------------

function renderFocusView(paths) {
    // Own the page
    document.body.innerHTML = '';
    document.body.style.margin = '0';

    const root = document.createElement('div');
    root.id = 'mindcraft-focus-root';
    root.className = 'mf-root';
    document.body.appendChild(root);

    const container = document.createElement('div');
    container.className = 'mf-container';
    root.appendChild(container);

    // Header (top)
    const header = document.createElement('div');
    header.className = 'mf-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'mf-header-left';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'mf-eyebrow';
    eyebrow.textContent = 'Mindcraft Focus Mode';

    const title = document.createElement('div');
    title.className = 'mf-title';
    title.textContent = 'Watch from your learning paths, not the algorithm.';

    const subtitle = document.createElement('div');
    subtitle.className = 'mf-subtitle';
    subtitle.textContent =
        'Curated from your Mindcraft paths using YouTube search. Organized by path and topic so every click pushes your skills forward.';

    headerLeft.appendChild(eyebrow);
    headerLeft.appendChild(title);
    headerLeft.appendChild(subtitle);

    const exitBtn = document.createElement('button');
    exitBtn.id = 'mf-exit';
    exitBtn.className = 'mf-exit-btn';

    const exitText = document.createElement('span');
    exitText.textContent = 'Exit focus';

    const exitIcon = document.createElement('span');
    exitIcon.className = 'mf-exit-icon';
    exitIcon.textContent = '✕';

    exitBtn.appendChild(exitText);
    exitBtn.appendChild(exitIcon);

    header.appendChild(headerLeft);
    header.appendChild(exitBtn);
    container.appendChild(header);

    // Paths
    paths.forEach((path) => {
        const pathSection = document.createElement('section');
        pathSection.className = 'mf-path';

        // Path header
        const pathHeader = document.createElement('div');
        pathHeader.className = 'mf-path-header';

        const pathTitleWrap = document.createElement('div');
        const pathTitle = document.createElement('h2');
        pathTitle.className = 'mf-path-title';
        pathTitle.textContent = path.name;

        const videosCount = countVideos(path.groups);
        const topicsCount = path.groups.length;

        const pathMeta = document.createElement('div');
        pathMeta.className = 'mf-path-meta';
        pathMeta.textContent = `${topicsCount} topic${
            topicsCount !== 1 ? 's' : ''
        } • ${videosCount} video${videosCount !== 1 ? 's' : ''}`;

        pathTitleWrap.appendChild(pathTitle);
        pathTitleWrap.appendChild(pathMeta);

        const pathTag = document.createElement('div');
        pathTag.className = 'mf-path-tag';
        pathTag.textContent = 'Guided path';

        pathHeader.appendChild(pathTitleWrap);
        pathHeader.appendChild(pathTag);

        pathSection.appendChild(pathHeader);

        // Query groups inside this path
        path.groups.forEach((group) => {
            const section = document.createElement('div');
            section.className = 'mf-section';

            const sectionTitle = document.createElement('h3');
            sectionTitle.className = 'mf-section-title';
            sectionTitle.textContent = group.query || 'Recommended videos';

            section.appendChild(sectionTitle);

            const grid = document.createElement('div');
            grid.className = 'mf-grid';

            group.resources.forEach((res) => {
                const videoUrl = `https://www.youtube.com/watch?v=${res.videoId}`;
                const thumb = getThumb(res.snippet);

                const link = document.createElement('a');
                link.className = 'mf-card-link';
                link.href = videoUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                const card = document.createElement('div');
                card.className = 'mf-card';

                // Thumbnail
                const thumbWrap = document.createElement('div');
                thumbWrap.className = 'mf-card-thumb-wrapper';

                if (thumb) {
                    const img = document.createElement('img');
                    img.className = 'mf-card-thumb';
                    img.src = thumb;
                    img.alt = res.snippet.title || '';
                    img.referrerPolicy = 'no-referrer';
                    thumbWrap.appendChild(img);
                } else {
                    const ph = document.createElement('div');
                    ph.className = 'mf-card-thumb-placeholder';
                    ph.textContent = 'No thumbnail';
                    thumbWrap.appendChild(ph);
                }

                // Body
                const body = document.createElement('div');
                body.className = 'mf-card-body';

                const titleEl = document.createElement('div');
                titleEl.className = 'mf-card-title';
                titleEl.textContent = res.snippet.title || '';

                const descEl = document.createElement('div');
                descEl.className = 'mf-card-desc';
                descEl.textContent = res.snippet.description || '';

                const metaEl = document.createElement('div');
                metaEl.className = 'mf-card-meta';

                const channel = res.snippet.channelTitle || 'YouTube';
                const date = formatDate(res.snippet.publishedAt);
                metaEl.textContent = date ? `${channel} • ${date}` : channel;

                body.appendChild(titleEl);
                body.appendChild(descEl);
                body.appendChild(metaEl);

                card.appendChild(thumbWrap);
                card.appendChild(body);
                link.appendChild(card);
                grid.appendChild(link);
            });

            section.appendChild(grid);
            pathSection.appendChild(section);
        });

        container.appendChild(pathSection);
    });

    // Exit: turn off focus mode + reload
    exitBtn.onclick = () => {
        chrome.storage.sync.set({ focusModeEnabled: false }, () => {
            window.location.reload();
        });
    };
}

// ------------ Utils ------------

function countVideos(groups) {
    return groups.reduce((sum, g) => sum + (g.resources?.length || 0), 0);
}

function getThumb(snippet) {
    if (!snippet || !snippet.thumbnails) return '';
    const t = snippet.thumbnails;
    return (
        (t.high && t.high.url) ||
        (t.medium && t.medium.url) ||
        (t.default && t.default.url) ||
        ''
    );
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
