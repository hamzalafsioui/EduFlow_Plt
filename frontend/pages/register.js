import { renderPage, navigate } from '../router.js';
import { authApi, categoryApi } from '../api.js';
import { toast } from '../components/toast.js';

export async function registerPage() {
    // Initial skeleton or loading state
    renderPage(`
        <div class="auth-page">
            <div class="auth-card" style="max-width:520px;">
                <div class="auth-card__logo">
                    <div class="auth-card__logo-text">🎓 EduFlow</div>
                    <div class="auth-card__subtitle">Join thousands of learners</div>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab" onclick="navigate('/login')">Sign In</button>
                    <button class="auth-tab active">Sign Up</button>
                </div>

                <h2 class="auth-card__title">Create your account</h2>
                <p class="auth-card__desc">Start your learning journey today.</p>

                <form class="auth-form" id="register-form" novalidate>
                    <div class="form-group">
                        <label for="reg-name">Full Name</label>
                        <input class="input" type="text" id="reg-name" placeholder="John Doe" required autocomplete="name">
                    </div>

                    <div class="form-group">
                        <label for="reg-email">Email Address</label>
                        <input class="input" type="email" id="reg-email" placeholder="you@example.com" required autocomplete="email">
                    </div>

                    <div class="form-group">
                        <label for="reg-password">Password</label>
                        <input class="input" type="password" id="reg-password" placeholder="Min. 6 characters" required minlength="6">
                    </div>

                    <div class="form-group">
                        <label for="reg-role">I am a...</label>
                        <select class="input" id="reg-role" required>
                            <option value="">Select your role</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <!-- Student-only: Interests -->
                    <div id="interests-section" class="form-group hidden">
                        <label>Your Interests <span style="color:var(--clr-text-dim); font-weight:400;">(select all that apply)</span></label>
                        <div class="interest-grid" id="interest-grid">
                            <p style="color:var(--clr-text-dim); grid-column: 1/-1;">Loading categories...</p>
                        </div>
                    </div>

                    <div id="reg-error" class="form-error hidden"></div>

                    <button type="submit" class="btn btn-primary btn--full btn-lg" id="reg-btn">
                        Create Account
                    </button>

                    <p class="auth-link">Already have an account? <a href="#/login">Sign in</a></p>
                </form>
            </div>
        </div>
    `);

    // Fetch categories and render chips
    try {
        const res = await categoryApi.getAll();
        if (res.ok) {
            const categories = await res.json();
            const grid = document.getElementById('interest-grid');
            if (grid) {
                grid.innerHTML = categories.map(cat => `
                    <div class="interest-chip" data-id="${cat.id}">${cat.name}</div>
                `).join('');
            }
        } else {
            console.error('Failed to load categories');
            document.getElementById('interest-grid').innerHTML = '<p class="form-error">Failed to load interests.</p>';
        }
    } catch (err) {
        console.error('Error fetching categories:', err);
    }

    // Show interests only for students
    document.getElementById('reg-role').addEventListener('change', (e) => {
        const section = document.getElementById('interests-section');
        if (e.target.value === 'student') {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });

    // Interest chip selection
    document.getElementById('interest-grid').addEventListener('click', (e) => {
        const chip = e.target.closest('.interest-chip');
        if (chip) chip.classList.toggle('selected');
    });

    // Form submit
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-btn');
        const errEl = document.getElementById('reg-error');

        const name     = document.getElementById('reg-name').value.trim();
        const email    = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const role     = document.getElementById('reg-role').value;
        const interests = [...document.querySelectorAll('.interest-chip.selected')]
                            .map(c => parseInt(c.dataset.id));

        errEl.classList.add('hidden');
        errEl.textContent = '';

        if (!name || !email || !password || !role) {
            errEl.textContent = 'Please fill in all required fields.';
            errEl.classList.remove('hidden');
            return;
        }

        if (password.length < 6) {
            errEl.textContent = 'Password must be at least 6 characters.';
            errEl.classList.remove('hidden');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            const payload = { name, email, password,password_confirmation: password, role };
   
            if (role === 'student' && interests.length) {
                payload.interests = interests;
            }

            const res  = await authApi.register(payload);
            const data = await res.json();

            if (!res.ok) {
                // Handle validation errors
                const msgs = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : (data.message || 'Registration failed.');
                errEl.textContent = `${msgs}`;
                errEl.classList.remove('hidden');
                return;
            }

            toast.success('Account created! Please log in.');
            navigate('/login');
        } catch (err) {
            errEl.textContent = `${err.message || 'An error occurred.'}`;
            errEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}
