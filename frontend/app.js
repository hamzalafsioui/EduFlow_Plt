import { route, startRouter, navigate, renderPage } from "./router.js";

// Pages
import { loginPage } from "./pages/login.js";
import { registerPage } from "./pages/register.js";
import { forgotPasswordPage } from "./pages/forgot-password.js";
import { coursesPage } from "./pages/courses.js";
import { courseDetailPage } from "./pages/course-detail.js";
import { courseFormPage } from "./pages/course-form.js";
import { recommendedPage } from "./pages/recommended.js";
import { wishlistPage } from "./pages/wishlist.js";
import { myEnrollmentsPage } from "./pages/my-enrollments.js";
import { dashboardPage } from "./pages/dashboard.js";
import { notFoundPage } from "./pages/not-found.js";

/* ==================== Helpers ===================== */

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("eduflow_user"));
  } catch {
    return null;
  }
};
const getToken = () => localStorage.getItem("eduflow_token");
const requireAuth = () => {
  if (!getToken()) {
    navigate("/login");
    return false;
  }
  return true;
};
const requireRole = (r) => {
  if (!requireAuth()) return false;
  const u = getStoredUser();
  if (u?.role !== r) {
    navigate(u?.role === "teacher" ? "/dashboard" : "/courses");
    return false;
  }
  return true;
};

/* ======== Static Routes ============ */

// Root => smart redirect
route("/", async () => {
  const u = getStoredUser();
  if (getToken() && u)
    navigate(u.role === "teacher" ? "/dashboard" : "/courses");
  else navigate("/login");
});

// Guest-only
route(
  "/login",
  (_, opts) => {
    if (getToken()) {
      navigate(getStoredUser()?.role === "teacher" ? "/dashboard" : "/courses");
      return;
    }
    loginPage();
  },
  { guest: true },
);
route(
  "/register",
  (_, opts) => {
    if (getToken()) {
      navigate(getStoredUser()?.role === "teacher" ? "/dashboard" : "/courses");
      return;
    }
    registerPage();
  },
  { guest: true },
);
route(
  "/forgot-password",
  (_, opts) => {
    if (getToken()) {
      navigate(getStoredUser()?.role === "teacher" ? "/dashboard" : "/courses");
      return;
    }
    forgotPasswordPage();
  },
  { guest: true },
);

// Authenticated => shared
route(
  "/courses",
  () => {
    if (!requireAuth()) return;
    coursesPage();
  },
  { auth: true },
);

// Student-only
route(
  "/recommended",
  () => {
    if (!requireRole("student")) return;
    recommendedPage();
  },
  { auth: true, role: "student" },
);
route(
  "/wishlist",
  () => {
    if (!requireRole("student")) return;
    wishlistPage();
  },
  { auth: true, role: "student" },
);
route(
  "/my-enrollments",
  () => {
    if (!requireRole("student")) return;
    myEnrollmentsPage();
  },
  { auth: true, role: "student" },
);

// Teacher-only
route(
  "/dashboard",
  () => {
    if (!requireRole("teacher")) return;
    dashboardPage();
  },
  { auth: true, role: "teacher" },
);

/* ==================================================
   Dynamic / Wildcard Routes
   Handles: /course/new, /course/:id, /course/:id/edit
  =================================================== 
  */

route("*", () => {
  const path = (window.location.hash || "#/").replace("#", "");

  // /course/new  => Teacher only
  if (path === "/course/new") {
    if (!requireRole("teacher")) return;
    courseFormPage(null);
    return;
  }

  // /course/:id/edit  — Teacher only
  const editMatch = path.match(/^\/course\/(\d+)\/edit$/);
  if (editMatch) {
    if (!requireRole("teacher")) return;
    courseFormPage(editMatch[1]);
    return;
  }

  // /course/:id  => Any authenticated user
  const detailMatch = path.match(/^\/course\/(\d+)$/);
  if (detailMatch) {
    if (!requireAuth()) return;
    courseDetailPage(detailMatch[1]);
    return;
  }

  // True 404
  notFoundPage();
});

/* ===========================================
   Boot
   =========================================== 
*/

// Expose navigate globally (used in inline onclick attributes)
window.navigate = navigate;

// Handle Stripe redirect: ?enrolled=success
// Stripe redirects the browser (no hash, no token in URL).
// Stash a flag so pages can show a success toast, then
// rewrite to the hash-based route the SPA understands.
(function handleStripeRedirect() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("enrolled") === "success") {
    sessionStorage.setItem("enrollment_success", "1");
    // Clean the URL and jump into the SPA my-enrollments page
    window.history.replaceState({}, "", window.location.pathname);
    window.location.hash = "#/my-enrollments";
  }
})();

startRouter();
