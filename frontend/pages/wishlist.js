import { renderPage, navigate } from "../router.js";
import { wishlistApi } from "../api.js";
import { toast } from "../components/toast.js";
import {
  courseCardHTML,
  spinner,
  emptyState,
} from "../components/course-card.js";

export async function wishlistPage() {
  renderPage(`
        <div class="page">
            <div class="container">
                <div class="page-header">
                    <div class="page-header__eyebrow"><i data-lucide="heart"></i> Saved</div>
                    <h1 class="page-header__title">My <span>Wishlist</span></h1>
                    <p class="page-header__desc">Courses you've saved for later.</p>
                </div>
                <div id="wishlist-content">${spinner()}</div>
            </div>
        </div>
    `);

  try {
    const res = await wishlistApi.getAll();
    const courses = await res.json();
    const wishlistIds = new Set((courses || []).map((c) => c.id));

    const el = document.getElementById("wishlist-content");

    if (!courses || courses.length === 0) {
      el.innerHTML = emptyState(
        '<i data-lucide="heart"></i>',
        "Your wishlist is empty",
        "Browse courses and click the heart icon to save them here.",
        `<button class="btn btn-primary mt-4" onclick="navigate('/courses')"><i data-lucide="search"></i> Browse Courses</button>`,
      );
      return;
    }

    const cards = courses
      .map((c) =>
        courseCardHTML(c, { showWishlistBtn: true, isWishlisted: true }),
      )
      .join("");

    el.innerHTML = `
            <div class="section">
                <div class="section__title"><i data-lucide="heart" fill="currentColor"></i> Saved Courses <span style="font-size:var(--fs-sm);color:var(--clr-text-dim);font-weight:400;">${courses.length} course${courses.length !== 1 ? "s" : ""}</span></div>
                <div class="courses-grid" id="wishlist-grid">${cards}</div>
            </div>
        `;

    if (window.lucide) window.lucide.createIcons();

    // Remove from wishlist
    el.querySelectorAll("[data-wishlist]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const courseId = parseInt(btn.dataset.wishlist);
        try {
          const res = await wishlistApi.toggle(courseId);
          if (!res.ok) throw new Error();
          // Remove card from DOM
          const card = btn.closest(".course-card");
          card?.remove();
          wishlistIds.delete(courseId);
          toast.success("Removed from wishlist");

          // Show empty state if none left
          if (wishlistIds.size === 0) {
            document.getElementById("wishlist-grid").innerHTML = "";
            el.innerHTML = emptyState(
              '<i data-lucide="heart"></i>',
              "Your wishlist is empty",
              "Browse courses and click the heart icon to save them here.",
              `<button class="btn btn-primary mt-4" onclick="navigate('/courses')"><i data-lucide="search"></i> Browse Courses</button>`,
            );
            if (window.lucide) window.lucide.createIcons();
          }
        } catch {
          toast.error("Could not update wishlist.");
        }
      });
    });
  } catch (err) {
    document.getElementById("wishlist-content").innerHTML = emptyState(
      '<i data-lucide="alert-triangle"></i>',
      "Failed to load wishlist",
      err.message,
      `<button class="btn btn-secondary" onclick="location.reload()">Retry</button>`,
    );
  }
}
