const API_BASE = 'https://localhost/api';
const APP_BASE = 'https://localhost';

const app = document.getElementById('app');

init();

async function init() {
    app.innerHTML = '<div class="app">Loading...</div>';

    const userJson = await fetchUser().catch(() => null);
    const user = userJson?.user || null;

    const focusEnabled = user?.hasYouTubeScope ? await getFocusMode() : false;

    render({ user, focusEnabled });
}

function render({ user, focusEnabled }) {
    app.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'app';

    // Header
    const header = document.createElement('div');
    header.className = 'header';

    const brand = document.createElement('div');
    brand.className = 'brand';
    brand.textContent = 'Mindcraft';

    header.appendChild(brand);

    if (user) {
        const userPill = createUserPill(user);
        header.appendChild(userPill);
    }

    root.appendChild(header);

    if (!user) {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'button button-primary';
        loginBtn.textContent = 'Sign in with Google';
        loginBtn.onclick = () => {
            chrome.tabs.create({ url: `${API_BASE}/auth/google` });
        };

        root.appendChild(loginBtn);
        app.appendChild(root);
        return;
    }

    // Logged-in UI

    // Actions row
    const actionsRow = document.createElement('div');
    actionsRow.style.display = 'flex';
    actionsRow.style.justifyContent = 'space-between';
    actionsRow.style.gap = '6px';

    const createBtn = document.createElement('button');
    createBtn.className = 'button button-primary';
    createBtn.textContent = 'Create new path';
    createBtn.onclick = () => {
        chrome.tabs.create({ url: `${APP_BASE}/app/create-path` });
    };

    const fullAppBtn = document.createElement('button');
    fullAppBtn.className = 'button button-ghost';
    fullAppBtn.textContent = 'Open dashboard';
    fullAppBtn.onclick = () => {
        chrome.tabs.create({ url: `${APP_BASE}/app` });
    };

    actionsRow.appendChild(createBtn);
    actionsRow.appendChild(fullAppBtn);
    root.appendChild(actionsRow);

    // Learning paths
    const pathsTitle = document.createElement('div');
    pathsTitle.style.fontSize = '11px';
    pathsTitle.style.color = '#9ca3af';
    pathsTitle.textContent = 'Your learning paths';
    root.appendChild(pathsTitle);

    const pathsList = document.createElement('div');
    pathsList.className = 'paths-list';
    pathsList.textContent = 'Loading paths...';
    root.appendChild(pathsList);

    loadPathsInto(pathsList);

    // Focus mode toggle
    if (user?.hasYouTubeScope) {

        const toggleRow = document.createElement('div');
        toggleRow.className = 'toggle-row';

        const label = document.createElement('div');
        label.innerHTML = `<strong>Focus mode</strong><br/><span style="color:#9ca3af;">Replace YouTube home with your learning path videos.</span>`;

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.className = 'toggle-input';
        toggle.checked = !!focusEnabled;

        toggle.addEventListener('change', async () => {
            const enabled = toggle.checked;
            await setFocusMode(enabled);

            // Notify open YouTube tabs
            chrome.tabs.query({ url: '*://www.youtube.com/*' }, (tabs) => {
                tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'FOCUS_MODE_UPDATED',
                        enabled,
                    });
                });
            });
        });

        toggleRow.appendChild(label);
        toggleRow.appendChild(toggle);

        root.appendChild(toggleRow);

    } else {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'yt-access-warning';

        const warningText = document.createElement('div');
        warningText.className = 'yt-warning-text';
        warningText.innerHTML = `
          <strong>YouTube access not granted</strong><br/>
          To enable video recommendations, re-login and check 
          <strong>"View your YouTube account"</strong> when prompted.
        `;

                const fixButton = document.createElement('button');
                fixButton.className = 'yt-fix-button';
                fixButton.textContent = 'Fix Access';
                fixButton.addEventListener('click', () => {
                    // re-trigger your OAuth flow
                    window.open(`${API_BASE}/auth/google`, '_blank');
                });

                warningDiv.appendChild(warningText);
                warningDiv.appendChild(fixButton);
                root.appendChild(warningDiv);
    }

    app.appendChild(root);
}

function createUserPill(user) {
    const wrapper = document.createElement('div');
    wrapper.className = 'user-pill';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';

    if (user.photo) {
        const img = document.createElement('img');
        img.src = user.photo;
        img.alt = user.name || 'User';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        avatar.appendChild(img);
    } else {
        // fallback to initial or '?'
        const initial =
            (user.name && user.name[0]) ||
            (user.email && user.email[0]) ||
            '?';
        avatar.textContent = initial.toUpperCase();
    }

    wrapper.appendChild(avatar);

    let menuOpen = false;
    let menuEl = null;

    wrapper.onclick = () => {
        if (menuOpen) {
            menuEl.remove();
            menuOpen = false;
            return;
        }
        menuEl = document.createElement('div');
        menuEl.className = 'user-menu';

        const name = document.createElement('div');
        name.className = 'user-menu-item';
        name.textContent = user.name || 'Unknown user';

        const email = document.createElement('div');
        email.className = 'user-menu-item';
        email.textContent = user.email || '';

        const logout = document.createElement('div');
        logout.className = 'user-menu-logout';
        logout.textContent = 'Logout';
        logout.onclick = async (e) => {
            e.stopPropagation();
            await logoutUser();
            window.location.reload();
        };

        menuEl.appendChild(name);
        menuEl.appendChild(email);
        menuEl.appendChild(logout);

        document.body.appendChild(menuEl);
        menuOpen = true;
    };

    return wrapper;
}

// Data helpers

async function fetchUser() {
    const res = await fetch(`${API_BASE}/auth/user`, {
        credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
}

async function loadPathsInto(container) {
    try {
        const res = await fetch(`${API_BASE}/paths`, {
            credentials: 'include',
        });
        if (!res.ok) {
            container.textContent = 'Failed to load paths.';
            return;
        }
        const json = await res.json();
        const paths = json.data || json || [];

        container.innerHTML = '';

        if (!paths.length) {
            container.textContent = 'No learning paths yet.';
            return;
        }

        paths.forEach((p) => {
            const item = document.createElement('div');
            item.className = 'path-item';

            const title = document.createElement('div');
            title.className = 'path-title';
            title.textContent = p.name || 'Untitled path';

            const meta = document.createElement('div');
            meta.className = 'path-meta';
            meta.textContent = `${p.pathType || p.type || ''} • ${p.roleOrSkill || ''} • ${p.minutesPerDay || 0} min/day`;

            item.appendChild(title);
            item.appendChild(meta);
            item.addEventListener('click', (e) => {
                e.preventDefault();
                chrome.tabs.create({ url: `${APP_BASE}/app/paths/${p.id}` });
            });
            container.appendChild(item);
        });
    } catch (e) {
        container.textContent = 'Failed to load paths.';
    }
}

async function logoutUser() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (e) {
        // ignore
    }
}

// Focus mode state

function getFocusMode() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['focusModeEnabled'], (res) => {
            resolve(!!res.focusModeEnabled);
        });
    });
}

function setFocusMode(enabled) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ focusModeEnabled: enabled }, () => resolve());
    });
}
