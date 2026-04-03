import { renderPage, navigate } from "../router.js";

export function notFoundPage() {
  renderPage(`
        <div class="page" style="display:flex;align-items:center;justify-content:center;min-height:80vh;">
            <div style="text-align:center;animation:slideUp 0.4s ease;">
                <div style="font-size:8rem;line-height:1;margin-bottom:1rem;"><i data-lucide="search" style="width: 5rem; height: 5rem;"></i></div>
                <h1 style="font-size:6rem;font-weight:800;background:var(--grad-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:1rem;">
                    404
                </h1>
                <h2 style="font-size:var(--fs-2xl);font-weight:700;margin-bottom:var(--sp-3);">Page Not Found</h2>
                <p style="color:var(--clr-text-muted);max-width:400px;margin:0 auto var(--sp-8);">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <div style="display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;">
                    <button class="btn btn-primary btn-lg" onclick="navigate('/courses')">
                        <i data-lucide="home"></i> Go to Courses
                    </button>
                    <button class="btn btn-ghost btn-lg" onclick="history.back()">
                        <i data-lucide="arrow-left"></i> Go Back
                    </button>
                </div>
            </div>
        </div>
    `);
}
