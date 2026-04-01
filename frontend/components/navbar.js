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
                        <span class="navbar__logo-icon"><i data-lucide="graduation-cap"></i></span> EduFlow
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
        <li><a href="#/course/new" class="${hash === '#/course/new' ? 'active' : ''}"><i data-lucide="plus"></i> New Course</a></li>
    `;

    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    navbar.innerHTML = `
        <nav class="navbar">
            <div class="navbar__inner">
                <a href="${isTeacher ? '#/dashboard' : '#/courses'}" class="navbar__logo">
                    <span class="navbar__logo-icon"><i data-lucide="graduation-cap"></i></span> EduFlow
                </a>

                <button class="navbar__mobile-btn" id="mobile-menu-btn" aria-label="Toggle menu">
                    <i data-lucide="menu"></i>
                </button>

                <ul class="navbar__nav" id="main-nav">
                    ${isTeacher ? teacherLinks : studentLinks}
                </ul>

                <div class="navbar__actions">
                    <div class="dropdown">
                        <button class="navbar__user" id="user-menu-btn">
                            <div class="avatar">${initials}</div>
                            <span class="user-name">${user.name?.split(' ')[0] || 'User'}</span>
                            <span class="role-badge role-badge--${user.role}">${user.role}</span>
                            <i data-lucide="chevron-down" style="width: 1rem; height: 1rem;"></i>
                        </button>
                        <div class="dropdown__menu hidden" id="user-dropdown">
                            <div style="padding: 0.5rem 0.75rem; font-size: 0.75rem; color: var(--clr-text-dim);">${user.email}</div>
                            <div class="dropdown__divider"></div>
                             <a href="#/profile" class="dropdown__item"><i data-lucide="user"></i> Profile</a>
                             <div class="dropdown__divider"></div>
                            <button class="dropdown__item dropdown__item--danger" id="logout-btn-dropdown">
                                <i data-lucide="log-out"></i> Log Out
                            </button>
                        </div>
                    </div>
                    <!-- Logout button - visible on most screens -->
                    <button class="btn btn-ghost btn-sm btn-logout" id="logout-btn-nav">
                        Log Out
                    </button>
                </div>
            </div>
        </nav>
    `;

    // Logout logic
    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (_) {}
        localStorage.removeItem('eduflow_token');
        localStorage.removeItem('eduflow_user');
        toast.info('You have been logged out.');
        navigate('/login');
    };

    // Listeners
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('main-nav')?.classList.toggle('open');
    });

    document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('user-dropdown')?.classList.toggle('hidden');
    });

    document.getElementById('logout-btn-dropdown')?.addEventListener('click', handleLogout);
    document.getElementById('logout-btn-nav')?.addEventListener('click', handleLogout);

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        const btn = document.getElementById('user-menu-btn');
        if (dropdown && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Expose navigate globally for inline onclick
window.navigate = navigate;
