import { renderPage, navigate } from "../router.js";
import { enrollmentApi, courseApi } from "../api.js";
import { toast } from "../components/toast.js";
import { escapeHtml, spinner, emptyState } from "../components/course-card.js";

export async function myEnrollmentsPage() {
  renderPage(`
        <div class="page">
            <div class="container">
                <div class="page-header">
                    <div class="page-header__eyebrow"><i data-lucide="graduation-cap"></i> Learning</div>
                    <h1 class="page-header__title">My <span>Courses</span></h1>
                    <p class="page-header__desc">Track your enrolled courses and enrollment status.</p>
                </div>
                <div id="enrollments-content">${spinner()}</div>
            </div>
        </div>
    `);

  try {
    if (sessionStorage.getItem("enrollment_success")) {
      sessionStorage.removeItem("enrollment_success");
      setTimeout(() => toast.success("Successfully enrolled in course!"), 300);
    }

    // We fetch all courses and filter those with an enrollment status
    const coursesRes = await courseApi.getAll();
    const courses = await coursesRes.json();

    // Filter enrolled courses (backend returns enrollment_status on each course)
    const enrolled = (courses || []).filter((c) => c.enrollment_status);

    const el = document.getElementById("enrollments-content");

    if (!enrolled.length) {
      el.innerHTML = emptyState(
        '<i data-lucide="inbox"></i>',
        "You haven't enrolled in any courses yet",
        "Browse courses and enroll to start learning!",
        `<button class="btn btn-primary mt-4" onclick="navigate('/courses')"><i data-lucide="search"></i> Browse Courses</button>`,
      );
      return;
    }

    const statusBadge = (status) => {
      const map = {
        pending:
          '<span class="badge badge--pending"><i data-lucide="clock"></i> Pending</span>',
        confirmed:
          '<span class="badge badge--confirmed"><i data-lucide="check-circle"></i> Confirmed</span>',
        cancelled:
          '<span class="badge badge--cancelled"><i data-lucide="x-circle"></i> Cancelled</span>',
      };
      return (
        map[status] || `<span class="badge badge--primary">${status}</span>`
      );
    };

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

    const rows = enrolled
      .map(
        (c) => `
            <tr data-id="${c.id}">
                <td>
                    <div style="display:flex;align-items:center;gap:var(--sp-3);">
                        <div style="width:40px;height:40px;border-radius:var(--radius-sm);background:var(--grad-card);display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;">
                            <i data-lucide="${icons[c.id % icons.length]}" style="width: 1.25rem; height: 1.25rem;"></i>
                        </div>
                        <div>
                            <div style="font-weight:600;">${escapeHtml(c.title)}</div>
                            <div style="font-size:var(--fs-xs);color:var(--clr-text-muted);">
                                <i data-lucide="user" style="width: 0.8rem; height: 0.8rem;"></i> ${escapeHtml(c.teacher?.name || "Instructor")}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${statusBadge(c.enrollment_status)}</td>
                <td>
                    ${
                      !c.price || c.price == 0
                        ? '<span style="color:var(--clr-success);font-weight:600;">Free</span>'
                        : `<span style="font-weight:600;">$${parseFloat(c.price).toFixed(2)}</span>`
                    }
                </td>
                <td>
                    <div style="display:flex;gap:var(--sp-2);">
                        <button class="btn btn-secondary btn-sm" onclick="navigate('/course/${c.id}')">View</button>
                        ${
                          c.enrollment_status !== "cancelled"
                            ? `
                            <button class="btn btn-ghost btn-sm withdraw-btn" data-course="${c.id}">Withdraw</button>
                        `
                            : ""
                        }
                    </div>
                </td>
            </tr>
        `,
      )
      .join("");

    el.innerHTML = `
            <div class="section">
                <div class="section__title"><i data-lucide="book"></i> Enrolled Courses <span style="font-size:var(--fs-sm);color:var(--clr-text-dim);font-weight:400;">${enrolled.length} course${enrolled.length !== 1 ? "s" : ""}</span></div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="enrollments-tbody">${rows}</tbody>
                    </table>
                </div>
            </div>
        `;

    if (window.lucide) window.lucide.createIcons();

    // Withdraw handlers
    el.querySelectorAll(".withdraw-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const courseId = btn.dataset.course;
        if (!confirm("Are you sure you want to withdraw from this course?"))
          return;
        try {
          const res = await enrollmentApi.withdraw(courseId);
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.message);
          }
          toast.success("Withdrawn from course.");
          // Update row status badge in-place
          const row = document.querySelector(`tr[data-id="${courseId}"]`);
          if (row) {
            row.cells[1].innerHTML =
              '<span class="badge badge--cancelled"><i data-lucide="x-circle"></i> Cancelled</span>';
            if (window.lucide)
              window.lucide.createIcons({ node: row.cells[1] });
            btn.remove();
          }
        } catch (err) {
          toast.error(err.message || "Withdrawal failed.");
        }
      });
    });
  } catch (err) {
    document.getElementById("enrollments-content").innerHTML = emptyState(
      '<i data-lucide="alert-triangle"></i>',
      "Failed to load enrollments",
      err.message,
      `<button class="btn btn-secondary" onclick="location.reload()">Retry</button>`,
    );
  }
}
