import { navigate } from '../router.js';
import { toast } from './toast.js';
import { authApi } from '../api.js';

export function renderNavbar(user) {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const hash = window.location.hash;

    if (!user) {
        // Guest navbar
        navbar.innerHTML = `
            <nav class="navbar">
                <div class="navbar__inner">
                    <a href="#/" class="navbar__logo">
                        <span class="navbar__logo-icon">(-_-)</span> EduFlow
                    </a>
                    <div class="navbar__actions">
                        <button class="btn btn-ghost btn-sm" onclick="navigate('/login')">Log In</button>
                        <button class="btn btn-primary btn-sm" onclick="navigate('/register')">Get Started</button>
                    </div>
                </div>
            </nav>
        `;
        return;
    }

    const isTeacher = user.role === 'teacher';

    const studentLinks = `
        <li><a href="#/courses" class="${hash.includes('/courses') ? 'active' : ''}">Courses</a></li>
        <li><a href="#/recommended" class="${hash === '#/recommended' ? 'active' : ''}">Recommended</a></li>
        <li><a href="#/wishlist" class="${hash === '#/wishlist' ? 'active' : ''}">Wishlist</a></li>
        <li><a href="#/my-enrollments" class="${hash === '#/my-enrollments' ? 'active' : ''}">My Courses</a></li>
    `;

    const teacherLinks = `
        <li><a href="#/courses" class="${hash.includes('/courses') ? 'active' : ''}">Courses</a></li>
        <li><a href="#/dashboard" class="${hash === '#/dashboard' ? 'active' : ''}">Dashboard</a></li>
        <li><a href="#/course/new" class="${hash === '#/course/new' ? 'active' : ''}">(+) New Course</a></li>
    `;

    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    navbar.innerHTML = `
        <nav class="navbar">
            <div class="navbar__inner">
                <a href="${isTeacher ? '#/dashboard' : '#/courses'}" class="navbar__logo">
                    <span class="navbar__logo-icon">(-_-)</span> EduFlow
                </a>

                <button class="navbar__mobile-btn" id="mobile-menu-btn" aria-label="Toggle menu">☰</button>

                <ul class="navbar__nav" id="main-nav">
                    ${isTeacher ? teacherLinks : studentLinks}
                </ul>

                <div class="navbar__actions">
                    <div class="dropdown">
                        <button class="navbar__user" id="user-menu-btn">
                            <div class="avatar">${initials}</div>
                            <span>${user.name?.split(' ')[0] || 'User'}</span>
                            <span class="role-badge role-badge--${user.role}">${user.role}</span>
                            <span>▾</span>
                        </button>
                        <div class="dropdown__menu hidden" id="user-dropdown">
                            <div style="padding: 0.5rem 0.75rem; font-size: 0.75rem; color: var(--clr-text-dim);">${user.email}</div>
                            <div class="dropdown__divider"></div>
                            <button class="dropdown__item dropdown__item--danger" id="logout-btn">
                                🚪 Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('main-nav')?.classList.toggle('open');
    });

    // User dropdown toggle
    document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('user-dropdown')?.classList.toggle('hidden');
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
        document.getElementById('user-dropdown')?.classList.add('hidden');
    }, { once: true, capture: false });

    // Logout handler
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        try {
            await authApi.logout();
        } catch (_) {}
        localStorage.removeItem('eduflow_token');
        localStorage.removeItem('eduflow_user');
        toast.info('You have been logged out.');
        navigate('/login');
    });
}

// Expose navigate globally for inline onclick
window.navigate = navigate;
