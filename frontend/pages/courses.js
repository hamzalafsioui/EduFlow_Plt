import { renderPage, getUser, isTeacher, navigate } from "../router.js";
import { courseApi, wishlistApi } from "../api.js";
import { toast } from "../components/toast.js";
import {
  courseCardHTML,
  spinner,
  emptyState,
} from "../components/course-card.js";

export async function coursesPage() {
  const user = getUser();
  const teacher = isTeacher();

  renderPage(`
        <div class="page">
            <div class="container">
                <div class="page-header">
                    <div class="page-header__eyebrow"><i data-lucide="book-open"></i> Explore</div>
                    <h1 class="page-header__title">
                        ${teacher ? "Your <span>Courses</span>" : "All <span>Courses</span>"}
                    </h1>
                    <p class="page-header__desc">
                        ${
                          teacher
                            ? "Manage your courses and track student progress."
                            : "Discover courses taught by expert instructors."
                        }
                    </p>
                    <div class="page-header__actions">
                        <div class="search-bar">
                            <span class="search-bar__icon"><i data-lucide="search"></i></span>
                            <input class="input" type="search" id="search-input" placeholder="Search courses...">
                        </div>
                        ${
                          teacher
                            ? `
                            <button class="btn btn-primary" onclick="navigate('/course/new')">
                                <i data-lucide="plus"></i> New Course
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>

                <div id="courses-content">
                    ${spinner()}
                </div>
            </div>
        </div>
    `);

  // Show enrollment success toast after Stripe redirect
  if (sessionStorage.getItem("enrollment_success")) {
    sessionStorage.removeItem("enrollment_success");
    setTimeout(
      () => toast.success("Enrollment confirmed! Welcome to your new course."),
      300,
    );
  }

  try {
    // Fetch courses + wishlist in parallel
    const [coursesRes, wishlistRes] = await Promise.all([
      courseApi.getAll(),
      teacher ? Promise.resolve(null) : wishlistApi.getAll(),
    ]);

    const courses = await coursesRes.json();
    const wishlistData = wishlistRes ? await wishlistRes.json() : [];
    const wishlistIds = new Set((wishlistData || []).map((c) => c.id));

    renderCourses(courses, wishlistIds, teacher);

    // Live search
    document.getElementById("search-input").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.teacher?.name || "").toLowerCase().includes(q) ||
          (c.category?.name || "").toLowerCase().includes(q),
      );
      renderCourses(filtered, wishlistIds, teacher, true);
    });
  } catch (err) {
    document.getElementById("courses-content").innerHTML = emptyState(
      '<i data-lucide="alert-triangle"></i>',
      "Failed to load courses",
      err.message,
      `<button class="btn btn-secondary" onclick="location.reload()">Retry</button>`,
    );
  }
}

function renderCourses(courses, wishlistIds, isTeacher, isSearch = false) {
  const el = document.getElementById("courses-content");
  if (!el) return;

  if (!courses || courses.length === 0) {
    el.innerHTML = emptyState(
      '<i data-lucide="inbox"></i>',
      isSearch ? "No courses match your search" : "No courses yet",
      isTeacher ? "Create your first course!" : "Check back soon.",
      isTeacher
        ? `<button class="btn btn-primary" onclick="navigate('/course/new')"><i data-lucide="plus"></i> Create Course</button>`
        : "",
    );
    return;
  }

  const cards = courses
    .map((c) =>
      courseCardHTML(c, {
        showWishlistBtn: !isTeacher,
        isWishlisted: wishlistIds.has(c.id),
      }),
    )
    .join("");

  el.innerHTML = `
        <div class="section">
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
        if (window.lucide) window.lucide.createIcons({ node: btn });
        toast.success(
          nowWishlisted ? "Added to wishlist" : "Removed from wishlist",
        );
      } catch {
        toast.error("Could not update wishlist.");
      }
    });
  });
}
