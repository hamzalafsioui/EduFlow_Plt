import { renderPage, navigate } from "../router.js";
import { authApi } from "../api.js";
import { toast } from "../components/toast.js";

export async function forgotPasswordPage() {
  renderPage(`
        <div class="auth-page">
            <div class="auth-card">
                <div class="auth-card__logo">
                    <div class="auth-card__logo-text"><i data-lucide="graduation-cap"></i> EduFlow</div>
                </div>

                <!-- Step 1: Enter Email -->
                <div id="step-1">
                    <h2 class="auth-card__title">Forgot Password</h2>
                    <p class="auth-card__desc">Enter your email and we'll send you a reset link.</p>

                    <form class="auth-form" id="forgot-form" novalidate>
                        <div class="form-group">
                            <label for="fp-email">Email Address</label>
                            <input class="input" type="email" id="fp-email" placeholder="you@example.com" required>
                        </div>

                        <button type="submit" class="btn btn-primary btn--full btn-lg" id="fp-btn">
                            Send Reset Link
                        </button>

                        <p class="auth-link"><a href="#/login"><i data-lucide="arrow-left"></i> Back to login</a></p>
                    </form>
                </div>

                <!-- Step 2: Enter Token + New Password -->
                <div id="step-2" class="hidden">
                    <h2 class="auth-card__title">Reset Password</h2>
                    <p class="auth-card__desc">Enter the token from your email and your new password.</p>

                    <form class="auth-form" id="reset-form" novalidate>
                        <div class="form-group">
                            <label for="rp-email">Email Address</label>
                            <input class="input" type="email" id="rp-email" placeholder="you@example.com" required>
                        </div>

                        <div class="form-group">
                            <label for="rp-token">Reset Token</label>
                            <input class="input" type="text" id="rp-token" placeholder="Paste token from email" required>
                        </div>

                        <div class="form-group">
                            <label for="rp-password">New Password</label>
                            <input class="input" type="password" id="rp-password" placeholder="Min. 6 characters" required minlength="6">
                        </div>

                        <button type="submit" class="btn btn-primary btn--full btn-lg" id="rp-btn">
                            Reset Password
                        </button>

                        <p class="auth-link"><a href="#/login"><i data-lucide="arrow-left"></i> Back to login</a></p>
                    </form>
                </div>
            </div>
        </div>
    `);

  // Step 1  => Send email
  document
    .getElementById("forgot-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("fp-btn");
      const email = document.getElementById("fp-email").value.trim();

      if (!email) {
        toast.error("Please enter your email.");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Sending...";

      try {
        const res = await authApi.sendResetEmail({ email });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Could not send reset email.");
        } else {
          toast.success("Reset email sent! Check your inbox.");
          // Pre-fill email in step 2
          document.getElementById("step-1").classList.add("hidden");
          document.getElementById("step-2").classList.remove("hidden");
          document.getElementById("rp-email").value = email;
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "Send Reset Link";
      }
    });

  // Step 2 => Reset password
  document
    .getElementById("reset-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("rp-btn");
      const email = document.getElementById("rp-email").value.trim();
      const token = document.getElementById("rp-token").value.trim();
      const password = document.getElementById("rp-password").value;

      if (!email || !token || !password) {
        toast.error("Please fill in all fields.");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Resetting...";

      try {
        const res = await authApi.resetPassword({
          email,
          token,
          password,
          password_confirmation: password,
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Reset failed. Check your token.");
        } else {
          toast.success("Password reset successfully! Please log in.");
          navigate("/login");
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "Reset Password";
      }
    });
}
