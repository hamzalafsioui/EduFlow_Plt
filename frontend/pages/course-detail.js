import {
  renderPage,
  getUser,
  isTeacher,
  isStudent,
  navigate,
} from "../router.js";
import { courseApi, wishlistApi, enrollmentApi } from "../api.js";
import { toast } from "../components/toast.js";
import { escapeHtml, spinner, emptyState } from "../components/course-card.js";

export async function courseDetailPage(courseId) {
  renderPage(
    `<div class="page"><div class="container">${spinner("lg")}</div></div>`,
  );

  try {
    const [courseRes, wishlistRes] = await Promise.all([
      courseApi.getById(courseId),
      isStudent() ? wishlistApi.getAll() : Promise.resolve(null),
    ]);

    if (!courseRes.ok) {
      renderPage(
        emptyStateWrapped(
          '<i data-lucide="inbox"></i>',
          "Course not found",
          "This course may have been removed.",
        ),
      );
      return;
    }

    const course = await courseRes.json();
    const wishlistData = wishlistRes ? await wishlistRes.json() : [];
    const isWishlisted = (wishlistData || []).some((c) => c.id === course.id);

    const user = getUser();
    const teacher = isTeacher();
    const student = isStudent();
    const isOwner = teacher && user?.id === course.teacher_id;

    const icons = [
      "book",
      "graduation-cap",
      "laptop",
      "code",
      "book-open",
      "palette",
      "microscope",
      "globe",
      "music",
      "ruler",
    ];
    const iconName = icons[course.id % icons.length];
    const price =
      !course.price || course.price == 0
        ? '<span style="color:var(--clr-success);font-size:var(--fs-3xl);font-weight:800;">Free</span>'
        : `<span class="course-detail__price">$${parseFloat(course.price).toFixed(2)}</span>`;

    const teacherName = course.teacher?.name || "Instructor";
    const categoryName = course.category?.name || "";
    const enrollStatus = course.enrollment_status; // pending|confirmed|cancelled|null

    /* ======== Actions ======== */
    let actionsHtml = "";

    if (student) {
      const heartBtn = `
                <button class="btn btn-ghost" id="wishlist-btn" title="${isWishlisted ? "Remove from wishlist" : "Add to wishlist"}">
                    <i data-lucide="heart" ${isWishlisted ? 'fill="currentColor"' : ""}></i>
                    ${isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>`;

      if (!enrollStatus) {
        actionsHtml = `
                    ${heartBtn}
                    <button class="btn btn-primary btn-lg" id="enroll-btn"><i data-lucide="graduation-cap"></i> Enroll Now</button>
                `;
      } else if (enrollStatus === "pending") {
        actionsHtml = `
                    ${heartBtn}
                    <span class="badge badge--pending"><i data-lucide="clock"></i> Enrollment Pending</span>
                    <button class="btn btn-danger btn-sm" id="withdraw-btn">Withdraw</button>
                `;
      } else if (enrollStatus === "confirmed") {
        actionsHtml = `
                    ${heartBtn}
                    <span class="badge badge--confirmed"><i data-lucide="check-circle"></i> Enrolled</span>
                    <button class="btn btn-ghost btn-sm" id="withdraw-btn">Withdraw from course</button>
                `;
      } else if (enrollStatus === "cancelled") {
        actionsHtml = `
                    ${heartBtn}
                    <span class="badge badge--cancelled"><i data-lucide="x-circle"></i> Enrolment Cancelled</span>
                    <button class="btn btn-primary btn-lg" id="enroll-btn">Re-enroll</button>
                `;
      }
    }

    if (isOwner) {
      actionsHtml = `
                <button class="btn btn-secondary" onclick="navigate('/course/${course.id}/edit')"><i data-lucide="edit"></i> Edit Course</button>
                <button class="btn btn-danger" id="delete-btn"><i data-lucide="trash-2"></i> Delete</button>
            `;
    }

    renderPage(`
            <div class="page">
                <div class="course-detail">
                    <button class="btn btn-ghost btn-sm mb-4" onclick="navigate('/courses')">
                        <i data-lucide="arrow-left"></i> Back to Courses
                    </button>
                    <div class="course-detail__hero"><i data-lucide="${iconName}" class="lucide-xl" style="opacity: 0.5;"></i></div>

                    <div class="course-detail__meta">
                        ${categoryName ? `<span class="badge badge--primary"><i data-lucide="tag"></i> ${escapeHtml(categoryName)}</span>` : ""}
                        ${price}
                        <span class="text-muted text-sm"><i data-lucide="user"></i> ${escapeHtml(teacherName)}</span>
                    </div>

                    <h1 style="font-size:var(--fs-3xl);font-weight:800;margin-bottom:var(--sp-4);line-height:1.2;">
                        ${escapeHtml(course.title)}
                    </h1>

                    <p style="color:var(--clr-text-muted);line-height:1.8;font-size:var(--fs-lg);margin-bottom:var(--sp-6);">
                        ${escapeHtml(course.description || "No description available.")}
                    </p>

                    <div class="course-detail__actions">${actionsHtml}</div>
                </div>
            </div>
        `);

    /* =========== Wishlist toggle ========== */
    document
      .getElementById("wishlist-btn")
      ?.addEventListener("click", async () => {
        const btn = document.getElementById("wishlist-btn");
        try {
          const res = await wishlistApi.toggle(course.id);
          if (!res.ok) throw new Error();
          const nowWishlisted = !btn.innerHTML.includes('fill="currentColor"');
          btn.innerHTML = `
                    <i data-lucide="heart" ${nowWishlisted ? 'fill="currentColor"' : ""}></i>
                    ${nowWishlisted ? "Wishlisted" : "Add to Wishlist"}
                `;
          if (window.lucide) window.lucide.createIcons({ node: btn });
          toast.success(
            nowWishlisted ? "Added to wishlist" : "Removed from wishlist",
          );
        } catch {
          toast.error("Could not update wishlist.");
        }
      });

    /* ========== Enroll (Stripe checkout) ========== */
    document
      .getElementById("enroll-btn")
      ?.addEventListener("click", async () => {
        const btn = document.getElementById("enroll-btn");
        btn.disabled = true;
        btn.textContent = "Processing...";
        try {
          const res = await enrollmentApi.checkout(course.id);
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Could not initiate checkout.");

          if (data.checkout_url) {
            // Redirect to Stripe
            window.location.href = data.checkout_url;
          } else if (data.message) {
            toast.success(data.message);
            navigate(`/course/${course.id}`);
          } else {
            toast.success(
              'Enrollment initiated! <i data-lucide="check-circle"></i>',
            );
            navigate("/my-enrollments");
          }
        } catch (err) {
          toast.error(err.message || "Enrollment failed.");
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="graduation-cap"></i> Enroll Now';
        }
      });

    /* ============= Withdraw =========== */
    document
      .getElementById("withdraw-btn")
      ?.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to withdraw from this course?"))
          return;
        try {
          const res = await enrollmentApi.withdraw(course.id);
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.message);
          }
          toast.success("Successfully withdrawn from course.");
          navigate("/my-enrollments");
        } catch (err) {
          toast.error(err.message || "Withdrawal failed.");
        }
      });

    /* ============= Delete course (teacher) ============== */
    document
      .getElementById("delete-btn")
      ?.addEventListener("click", async () => {
        if (!confirm(`Delete "${course.title}"? This cannot be undone.`))
          return;
        try {
          const res = await courseApi.delete(course.id);
          if (res.status === 204 || res.ok) {
            toast.success("Course deleted.");
            navigate("/courses");
          } else {
            const d = await res.json();
            throw new Error(d.message);
          }
        } catch (err) {
          toast.error(err.message || "Failed to delete course.");
        }
      });
  } catch (err) {
    renderPage(
      emptyStateWrapped(
        '<i data-lucide="alert-triangle"></i>',
        "Failed to load course",
        err.message,
      ),
    );
  }
}

function emptyStateWrapped(icon, title, desc) {
  return `<div class="page"><div class="container" style="padding-top:4rem;">
        <div class="empty-state">
            <div class="empty-state__icon">${icon}</div>
            <div class="empty-state__title">${title}</div>
            <div class="empty-state__desc">${desc}</div>
            <button class="btn btn-secondary mt-4" onclick="navigate('/courses')"><i data-lucide="arrow-left"></i> Back to Courses</button>
        </div>
    </div></div>`;
}
