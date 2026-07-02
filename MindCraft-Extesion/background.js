const API_BASE = 'https://localhost/api'; // adjust if needed

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_FOCUS_DATA') {
        (async () => {
            try {
                // 1) Check auth
                const userRes = await fetch(`${API_BASE}/auth/user`, {
                    credentials: 'include',
                });

                if (!userRes.ok) {
                    console.warn('[Mindcraft] /auth/user not ok');
                    sendResponse({ ok: false });
                    return;
                }

                const user = await userRes.json();

                if (!user?.user?.hasYouTubeScope) {
                    console.warn('[Mindcraft] /auth/user not ok. Missing YouTube scope');
                    sendResponse({ ok: false });
                    return;
                }

                // 2) Fetch all paths with YouTube-only resources
                const pathsRes = await fetch(`${API_BASE}/paths/youtube-resources`, {
                    credentials: 'include',
                });

                if (!pathsRes.ok) {
                    console.warn('[Mindcraft] /paths/youtube-resources not ok');
                    sendResponse({ ok: false });
                    return;
                }

                const pathsJson = await pathsRes.json();
                const paths = pathsJson.data || [];

                sendResponse({ ok: true, user, paths });
            } catch (err) {
                console.error('[Mindcraft] GET_FOCUS_DATA error', err);
                sendResponse({ ok: false });
            }
        })();

        // keep the message channel open for async
        return true;
    }
});
