import { renderNavbar } from './components/navbar.js';

const routes = {};
let currentHash = '';


export function route(path, handler, options = {}) {
    routes[path] = { handler, options };
}

export function navigate(path) {
    window.location.hash = `#${path}`;
}


export function startRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // run on initial load
}

async function handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '') || '/';

    
    const exactMatch = !!routes[path];
    if (exactMatch && path === currentHash) return;
    currentHash = path;

    // Match route (exact first, then wildcard fallback)
    const matched = routes[path] || routes['*'];

    if (!matched) {
        renderPage('<div class="empty-state"><div class="empty-state__icon">(-|-)</div><p class="empty-state__title">Page not found</p></div>');
        return;
    }

    const { handler, options } = matched;

    // Auth guard
    const token = localStorage.getItem('eduflow_token');
    const user   = getUser();

    if (options.auth && !token) {
        navigate('/login');
        return;
    }

    // Role guard
    if (options.role && user?.role !== options.role) {
        navigate(user?.role === 'teacher' ? '/dashboard' : '/courses');
        return;
    }

    // Redirect authenticated users away from auth pages
    if (options.guest && token) {
        navigate(user?.role === 'teacher' ? '/dashboard' : '/courses');
        return;
    }

    // Update navbar
    renderNavbar(user);

    // Show loading briefly
    const content = document.getElementById('page-content');
    if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(8px)';
    }

    try {
        await handler();
    } catch (err) {
        console.error('Route error:', err);
    }

    // Animate page in
    if (content) {
        requestAnimationFrame(() => {
            content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        });
    }
}

export function renderPage(html) {
    const el = document.getElementById('page-content');
    if (el) el.innerHTML = html;
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('eduflow_user'));
    } catch {
        return null;
    }
}

export function isTeacher() {
    return getUser()?.role === 'teacher';
}

export function isStudent() {
    return getUser()?.role === 'student';
}
