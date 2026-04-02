import { renderPage } from "../router.js";
import { courseApi, wishlistApi } from "../api.js";
import { toast } from "../components/toast.js";
import {
  courseCardHTML,
  spinner,
  emptyState,
} from "../components/course-card.js";

export async function recommendedPage() {
  renderPage(`
        <div class="page">
            <div class="container">
                <div class="page-header">
                    <div class="page-header__eyebrow"><i data-lucide="star"></i> Personalized</div>
                    <h1 class="page-header__title">Recommended <span>For You</span></h1>
                    <p class="page-header__desc">Courses picked based on your interests and learning history.</p>
                </div>
                <div id="rec-content">${spinner()}</div>
            </div>
        </div>
    `);

  try {
    const [recRes, wishlistRes] = await Promise.all([
      courseApi.getRecommended(),
      wishlistApi.getAll(),
    ]);

    const courses = await recRes.json();
    const wishlistData = await wishlistRes.json();
    const wishlistIds = new Set((wishlistData || []).map((c) => c.id));

    const el = document.getElementById("rec-content");

    if (!courses || courses.length === 0) {
      el.innerHTML = emptyState(
        '<i data-lucide="target"></i>',
        "No recommendations yet",
        "Update your interests during registration or enroll in courses to get personalized recommendations.",
        `<button class="btn btn-primary mt-4" onclick="navigate('/courses')">Browse All Courses</button>`,
      );
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const cards = courses
      .map((c) =>
        courseCardHTML(c, {
          showWishlistBtn: true,
          isWishlisted: wishlistIds.has(c.id),
        }),
      )
      .join("");

    el.innerHTML = `
            <div class="section">
                <div class="section__title"><i data-lucide="sparkles"></i> Suggested for you <span style="font-size:var(--fs-sm);color:var(--clr-text-dim);font-weight:400;">${courses.length} course${courses.length !== 1 ? "s" : ""}</span></div>
                <div class="courses-grid">${cards}</div>
            </div>
        `;

    if (window.lucide) window.lucide.createIcons();

    // Wishlist toggle handlers
    el.querySelectorAll("[data-wishlist]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const courseId = btn.dataset.wishlist;
        try {
          const res = await wishlistApi.toggle(courseId);
          if (!res.ok) throw new Error();
          const nowWishlisted = !wishlistIds.has(parseInt(courseId));
          if (nowWishlisted) wishlistIds.add(parseInt(courseId));
          else wishlistIds.delete(parseInt(courseId));
          btn.classList.toggle("active", nowWishlisted);
          btn.innerHTML = `<i data-lucide="heart" ${nowWishlisted ? 'fill="currentColor"' : ""}></i>`;
          window.lucide?.createIcons(); // Re-render icon
          toast.success(
            nowWishlisted ? "Added to wishlist" : "Removed from wishlist",
          );
        } catch {
          toast.error("Could not update wishlist.");
        }
      });
    });
  } catch (err) {
    document.getElementById("rec-content").innerHTML = emptyState(
      '<i data-lucide="alert-triangle"></i>',
      "Failed to load recommendations",
      err.message,
      `<button class="btn btn-secondary" onclick="location.reload()">Retry</button>`,
    );
  }
}
