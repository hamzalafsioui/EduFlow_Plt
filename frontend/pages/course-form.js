import { renderPage, navigate } from "../router.js";
import { courseApi } from "../api.js";
import { toast } from "../components/toast.js";
import { spinner } from "../components/course-card.js";

export async function courseFormPage(courseId = null) {
  const isEdit = Boolean(courseId);
  let course = null;

  renderPage(
    `<div class="page"><div class="container">${spinner()}</div></div>`,
  );

  if (isEdit) {
    try {
      const res = await courseApi.getById(courseId);
      if (!res.ok) throw new Error("Course not found.");
      course = await res.json();
    } catch (err) {
      toast.error(err.message);
      navigate("/courses");
      return;
    }
  }

  renderPage(`
        <div class="page">
            <div class="container container-md" style="padding-top: var(--sp-10);">
                <button class="btn btn-ghost btn-sm mb-6" onclick="navigate('/courses')"><i data-lucide="arrow-left"></i> Back to Courses</button>

                <div class="card">
                    <div class="card__header" style="padding-bottom: var(--sp-6);">
                        <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--clr-primary-l);margin-bottom:var(--sp-2);">
                            ${isEdit ? '<i data-lucide="edit"></i> Edit Course' : '<i data-lucide="plus"></i> New Course'}
                        </div>
                        <h1 style="font-size:var(--fs-3xl);font-weight:800;">
                            ${isEdit ? "Update Course Details" : "Create a New Course"}
                        </h1>
                        <p style="color:var(--clr-text-muted);margin-top:var(--sp-2);">
                            ${isEdit ? "Update the fields below to modify your course." : "Fill in the details below to publish your course."}
                        </p>
                    </div>

                    <div class="card__body">
                        <form class="auth-form" id="course-form" novalidate>
                            <div class="form-group">
                                <label for="cf-title">Course Title <span style="color:var(--clr-danger)">*</span></label>
                                <input class="input" type="text" id="cf-title"
                                    placeholder="e.g. Introduction to Web Development"
                                    value="${escapeVal(course?.title)}" required>
                            </div>

                            <div class="form-group">
                                <label for="cf-desc">Description <span style="color:var(--clr-danger)">*</span></label>
                                <textarea class="input" id="cf-desc" rows="5"
                                    placeholder="Describe what students will learn..."
                                    required>${escapeVal(course?.description)}</textarea>
                            </div>

                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);">
                                <div class="form-group">
                                    <label for="cf-price">Price (USD) <span style="color:var(--clr-danger)">*</span></label>
                                    <input class="input" type="number" id="cf-price"
                                        placeholder="0.00" min="0" step="0.01"
                                        value="${course?.price ?? ""}" required>
                                </div>

                                <div class="form-group">
                                    <label for="cf-category">Category ID <span style="color:var(--clr-text-dim);font-weight:400;">(optional)</span></label>
                                    <input class="input" type="number" id="cf-category"
                                        placeholder="e.g. 1"
                                        value="${course?.category_id ?? ""}">
                                </div>
                            </div>

                            <div id="cf-error" class="form-error hidden"></div>

                            <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-2);">
                                <button type="submit" class="btn btn-primary btn-lg" id="cf-submit">
                                    ${isEdit ? '<i data-lucide="save"></i> Save Changes' : '<i data-lucide="send"></i> Publish Course'}
                                </button>
                                <button type="button" class="btn btn-ghost" onclick="navigate('/courses')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `);

  document
    .getElementById("course-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = document.getElementById("cf-submit");
      const errEl = document.getElementById("cf-error");
      const title = document.getElementById("cf-title").value.trim();
      const desc = document.getElementById("cf-desc").value.trim();
      const price = document.getElementById("cf-price").value;
      const catId = document.getElementById("cf-category").value;

      errEl.classList.add("hidden");

      if (!title || !desc || price === "") {
        errEl.innerHTML =
          '<i data-lucide="alert-circle"></i> Please fill in all required fields.';
        errEl.classList.remove("hidden");
        if (window.lucide) window.lucide.createIcons({ node: errEl });
        return;
      }

      btn.disabled = true;
      btn.textContent = isEdit ? "Saving..." : "Publishing...";

      const payload = {
        title,
        description: desc,
        price: parseFloat(price),
        ...(catId ? { category_id: parseInt(catId) } : { category_id: null }),
      };

      try {
        const res = isEdit
          ? await courseApi.update(courseId, payload)
          : await courseApi.create(payload);

        const data = await res.json();

        if (!res.ok) {
          const msgs = data.errors
            ? Object.values(data.errors).flat().join(" ")
            : data.message || "Request failed.";
          errEl.innerHTML = `<i data-lucide="alert-circle"></i> ${msgs}`;
          errEl.classList.remove("hidden");
          if (window.lucide) window.lucide.createIcons({ node: errEl });
          return;
        }

        toast.success(
          isEdit ? "Course updated successfully!" : "Course published!",
        );
        navigate(`/course/${data.id || courseId}`);
      } catch (err) {
        errEl.innerHTML = `<i data-lucide="alert-circle"></i> ${err.message}`;
        errEl.classList.remove("hidden");
        if (window.lucide) window.lucide.createIcons({ node: errEl });
      } finally {
        btn.disabled = false;
        btn.innerHTML = isEdit
          ? '<i data-lucide="save"></i> Save Changes'
          : '<i data-lucide="send"></i> Publish Course';
        if (window.lucide) window.lucide.createIcons({ node: btn });
      }
    });
}

function escapeVal(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
