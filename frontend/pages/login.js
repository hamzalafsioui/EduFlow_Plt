import { renderPage, navigate } from '../router.js';
import { authApi } from '../api.js';
import { toast } from '../components/toast.js';

export async function loginPage() {
    renderPage(`
        <div class="auth-page">
            <div class="auth-card">
                <div class="auth-card__logo">
                    <div class="auth-card__logo-text"><i data-lucide="graduation-cap"></i> EduFlow</div>
                    <div class="auth-card__subtitle">Learn. Grow. Succeed.</div>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab active" id="tab-login">Sign In</button>
                    <button class="auth-tab" id="tab-register" onclick="navigate('/register')">Sign Up</button>
                </div>

                <h2 class="auth-card__title">Welcome back</h2>
                <p class="auth-card__desc">Enter your credentials to access your account.</p>

                <form class="auth-form" id="login-form" novalidate>
                    <div class="form-group">
                        <label for="login-email">Email Address</label>
                        <input class="input" type="email" id="login-email" placeholder="you@example.com" required autocomplete="email">
                    </div>

                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input class="input" type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password">
                    </div>

                    <div style="text-align:right;">
                        <a href="#/forgot-password" style="font-size: var(--fs-xs); color: var(--clr-primary-l);">Forgot password?</a>
                    </div>

                    <button type="submit" class="btn btn-primary btn--full btn-lg" id="login-btn">
                        Sign In
                    </button>

                    <p class="auth-link">Don't have an account? <a href="#/register">Create one</a></p>
                </form>
            </div>
        </div>
    `);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            toast.error('Please fill in all fields.');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Signing in...';

        try {
            const res  = await authApi.login({ email, password });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || data.message || 'Invalid credentials.');
                return;
            }

            localStorage.setItem('eduflow_token', data.access_token);
            localStorage.setItem('eduflow_user',  JSON.stringify(data.user));
            toast.success(`Welcome back, ${data.user.name}!`);

            navigate(data.user.role === 'teacher' ? '/dashboard' : '/courses');
        } catch (err) {
            toast.error(err.message || 'Login failed. Check your connection.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}
