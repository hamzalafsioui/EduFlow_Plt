// ========= Teacher Dashboard ===========

import { renderPage, navigate } from "../router.js";
import { teacherApi, courseApi } from "../api.js";
import { toast } from "../components/toast.js";
import { escapeHtml, spinner, emptyState } from "../components/course-card.js";

export async function dashboardPage() {
  renderPage(`
        <div class="page">
            <div class="container">
                <div class="page-header">
                    <div class="page-header__eyebrow"><i data-lucide="bar-chart-2"></i> Analytics</div>
                    <h1 class="page-header__title">Teacher <span>Dashboard</span></h1>
                    <p class="page-header__desc">Overview of your courses, students and groups.</p>
                    <div class="page-header__actions">
                        <button class="btn btn-primary" onclick="navigate('/course/new')"><i data-lucide="plus"></i> New Course</button>
                    </div>
                </div>
                <div id="dashboard-content">${spinner()}</div>
            </div>
        </div>
    `);

  try {
    const [statsRes, coursesRes] = await Promise.all([
      teacherApi.getStatistics(),
      courseApi.getAll(),
    ]);

    const stats = await statsRes.json();
    const courses = await coursesRes.json();

    const el = document.getElementById("dashboard-content");

    // Build stats display — handle various API response shapes
    const totalCourses =
      stats.total_courses ?? stats.courses ?? (courses?.length || 0);
    const totalStudents = stats.total_students ?? stats.students ?? 0;
    const totalGroups = stats.total_groups ?? stats.groups ?? 0;

    el.innerHTML = `
            <!-- Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card__icon"><i data-lucide="book-open"></i></div>
                    <div class="stat-card__value">${totalCourses}</div>
                    <div class="stat-card__label">Total Courses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__icon"><i data-lucide="graduation-cap"></i></div>
                    <div class="stat-card__value">${totalStudents}</div>
                    <div class="stat-card__label">Total Students</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__icon"><i data-lucide="users"></i></div>
                    <div class="stat-card__value">${totalGroups}</div>
                    <div class="stat-card__label">Total Groups</div>
                </div>
            </div>

            <!-- Course selector panels -->
            <div class="section">
                <div class="section__title"><i data-lucide="clipboard-list"></i> Course Management</div>
                ${
                  !courses || courses.length === 0
                    ? emptyState(
                        '<i data-lucide="inbox"></i>',
                        "No courses yet",
                        "Create your first course to get started.",
                        `<button class="btn btn-primary" onclick="navigate('/course/new')"><i data-lucide="plus"></i> Create Course</button>`,
                      )
                    : `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-8);">
                        <!-- Students panel -->
                        <div>
                            <h3 style="font-size:var(--fs-lg);font-weight:700;margin-bottom:var(--sp-4);"><i data-lucide="graduation-cap"></i> Students by Course</h3>
                            <div class="form-group" style="margin-bottom:var(--sp-4);">
                                <label for="students-course-sel">Select Course</label>
                                <select class="select-control" id="students-course-sel">
                                    <option value="">— Choose a course —</option>
                                    ${courses
                                      .map(
                                        (c) =>
                                          `<option value="${c.id}">${escapeHtml(c.title)}</option>`,
                                      )
                                      .join("")}
                                </select>
                            </div>
                            <div id="students-panel">
                                <div class="empty-state" style="padding:var(--sp-8);">
                                    <div class="empty-state__icon" style="font-size:2rem;"><i data-lucide="mouse-pointer-2"></i></div>
                                    <div class="empty-state__desc">Select a course to view students</div>
                                </div>
                            </div>
                        </div>

                        <!-- Groups panel -->
                        <div>
                            <h3 style="font-size:var(--fs-lg);font-weight:700;margin-bottom:var(--sp-4);"><i data-lucide="users"></i> Groups by Course</h3>
                            <div class="form-group" style="margin-bottom:var(--sp-4);">
                                <label for="groups-course-sel">Select Course</label>
                                <select class="select-control" id="groups-course-sel">
                                    <option value="">— Choose a course —</option>
                                    ${courses
                                      .map(
                                        (c) =>
                                          `<option value="${c.id}">${escapeHtml(c.title)}</option>`,
                                      )
                                      .join("")}
                                </select>
                            </div>
                            <div id="groups-panel">
                                <div class="empty-state" style="padding:var(--sp-8);">
                                    <div class="empty-state__icon" style="font-size:2rem;"><i data-lucide="mouse-pointer-2"></i></div>
                                    <div class="empty-state__desc">Select a course to view groups</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                }
            </div>

            <!-- My Courses table -->
            <div class="section">
                <div class="section__title"><i data-lucide="book-open"></i> My Courses</div>
                ${buildCoursesTable(courses)}
            </div>
        `;

    if (window.lucide) window.lucide.createIcons();

    /* ========= Students panel handler ============= */
    document
      .getElementById("students-course-sel")
      ?.addEventListener("change", async (e) => {
        const cId = e.target.value;
        const panel = document.getElementById("students-panel");
        if (!cId) {
          panel.innerHTML = "";
          return;
        }

        panel.innerHTML = spinner("sm");
        try {
          const res = await teacherApi.getCourseStudents(cId);
          const students = await res.json();
          panel.innerHTML = buildStudentsTable(students);
          if (window.lucide) window.lucide.createIcons({ node: panel });
        } catch (err) {
          panel.innerHTML = `<p class="text-muted text-sm"><i data-lucide="alert-triangle"></i> ${err.message}</p>`;
        }
      });

    /* ================ Groups panel handler ============= */
    document
      .getElementById("groups-course-sel")
      ?.addEventListener("change", async (e) => {
        const cId = e.target.value;
        const panel = document.getElementById("groups-panel");
        if (!cId) {
          panel.innerHTML = "";
          return;
        }

        panel.innerHTML = spinner("sm");
        try {
          const res = await teacherApi.getCourseGroups(cId);
          const groups = await res.json();
          panel.innerHTML = buildGroupsList(groups, cId);
          if (window.lucide) window.lucide.createIcons({ node: panel });

          // Group click => load students in that group
          panel.querySelectorAll(".group-item").forEach((item) => {
            item.addEventListener("click", async () => {
              const gId = item.dataset.groupId;
              const gPanel = document.getElementById(`group-students-${gId}`);
              if (gPanel.innerHTML.trim()) {
                gPanel.innerHTML = "";
                return;
              } // toggle
              gPanel.innerHTML = spinner("sm");
              try {
                const sRes = await teacherApi.getGroupStudents(cId, gId);
                const stus = await sRes.json();
                gPanel.innerHTML = buildStudentsTable(stus, true);
                if (window.lucide) window.lucide.createIcons({ node: gPanel });
              } catch (err) {
                gPanel.innerHTML = `<p class="text-muted text-sm"><i data-lucide="alert-triangle"></i> ${err.message}</p>`;
              }
            });
          });
        } catch (err) {
          panel.innerHTML = `<p class="text-muted text-sm"><i data-lucide="alert-triangle"></i> ${err.message}</p>`;
        }
      });
  } catch (err) {
    document.getElementById("dashboard-content").innerHTML = emptyState(
      '<i data-lucide="alert-triangle"></i>',
      "Failed to load dashboard",
      err.message,
      `<button class="btn btn-secondary" onclick="location.reload()">Retry</button>`,
    );
  }
}

function buildStudentsTable(students, compact = false) {
  if (!students || students.length === 0) {
    return `<p class="text-muted text-sm" style="padding:var(--sp-4);">No students found.</p>`;
  }
  const rows = students
    .map(
      (s) => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:var(--sp-2);">
                    <div class="avatar" style="width:28px;height:28px;font-size:0.65rem;">${(s.name || "U")[0].toUpperCase()}</div>
                    ${escapeHtml(s.name || "Unknown")}
                </div>
            </td>
            ${!compact ? `<td style="font-size:var(--fs-sm);color:var(--clr-text-muted);">${escapeHtml(s.email || "")}</td>` : ""}
        </tr>
    `,
    )
    .join("");
  return `
        <div class="table-wrapper" style="margin-top:var(--sp-3);">
            <table>
                <thead><tr>
                    <th>Student</th>
                    ${!compact ? "<th>Email</th>" : ""}
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function buildGroupsList(groups, courseId) {
  if (!groups || groups.length === 0) {
    return `<p class="text-muted text-sm" style="padding:var(--sp-4);">No groups found.</p>`;
  }
  return `
        <div class="groups-list">
            ${groups
              .map(
                (g) => `
                <div class="group-item" data-group-id="${g.id}" title="Click to view students">
                    <div style="display:flex;align-items:center;gap:var(--sp-3);">
                        <i data-lucide="users" style="width: 1.5rem; height: 1.5rem;"></i>
                        <div>
                            <div style="font-weight:600;">${escapeHtml(g.name || `Group ${g.id}`)}</div>
                            ${g.students_count !== undefined ? `<div style="font-size:var(--fs-xs);color:var(--clr-text-muted);">${g.students_count} student${g.students_count !== 1 ? "s" : ""}</div>` : ""}
                        </div>
                    </div>
                    <i data-lucide="chevron-right" style="color:var(--clr-text-dim);"></i>
                </div>
                <div id="group-students-${g.id}"></div>
            `,
              )
              .join("")}
        </div>
    `;
}

function buildCoursesTable(courses) {
  if (!courses || courses.length === 0) return "";
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
  const rows = courses
    .map(
      (c) => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:var(--sp-3);">
                    <i data-lucide="${icons[c.id % icons.length]}" style="width: 1.5rem; height: 1.5rem;"></i>
                    <span style="font-weight:600;">${escapeHtml(c.title)}</span>
                </div>
            </td>
            <td>${escapeHtml(c.category?.name || "—")}</td>
            <td>${!c.price || c.price == 0 ? '<span style="color:var(--clr-success)">Free</span>' : `$${parseFloat(c.price).toFixed(2)}`}</td>
            <td>
                <div style="display:flex;gap:var(--sp-2);">
                    <button class="btn btn-secondary btn-sm" onclick="navigate('/course/${c.id}')">View</button>
                    <button class="btn btn-ghost btn-sm" onclick="navigate('/course/${c.id}/edit')">Edit</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
  return `
        <div class="table-wrapper">
            <table>
                <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}
