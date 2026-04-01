export function courseCardHTML(
  course,
  { showWishlistBtn = true, isWishlisted = false } = {},
) {
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
  const id = parseInt(course.id) || 0;
  const iconName = icons[id % icons.length];

  const priceLabel =
    !course.price || course.price == 0
      ? '<span class="course-card__price course-card__price--free">Free</span>'
      : `<span class="course-card__price">$${parseFloat(course.price).toFixed(2)}</span>`;

  const teacherName =
    course.teacher?.name || course.teacher_name || "Instructor";
  const categoryName = course.category?.name || "";

  const heartBtn = showWishlistBtn
    ? `
        <button class="btn-heart ${isWishlisted ? "active" : ""}"
                data-wishlist="${course.id}"
                title="${isWishlisted ? "Remove from wishlist" : "Add to wishlist"}"
                onclick="event.stopPropagation()">
                <i data-lucide="heart" ${isWishlisted ? 'fill="currentColor"' : ""}></i>
        </button>
    `
    : "";

  return `
        <div class="course-card" data-course-id="${course.id}" onclick="navigate('/course/${course.id}')">
            <div class="course-card__thumb" style="position:relative;">
                <span><i data-lucide="${iconName}" class="lucide-lg" style="opacity: 0.5;"></i></span>
                <div class="course-card__badges">${heartBtn}</div>
            </div>
            <div class="course-card__body">
                ${categoryName ? `<div class="course-card__category">${categoryName}</div>` : ""}
                <div class="course-card__title">${escapeHtml(course.title)}</div>
                <div class="course-card__teacher">
                    <i data-lucide="user" style="width: 1rem; height: 1rem;"></i> ${escapeHtml(teacherName)}
                </div>
            </div>
            <div class="course-card__footer">
                ${priceLabel}
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); navigate('/course/${course.id}')">
                    View Details
                </button>
            </div>
        </div>
    `;
}

export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function spinner(size = "") {
  return `<div class="loading-overlay"><div class="spinner ${size ? `spinner--${size}` : ""}"></div><span>Loading...</span></div>`;
}

export function emptyState(icon, title, desc = "", actionHtml = "") {
  return `
        <div class="empty-state">
            <div class="empty-state__icon">${icon}</div>
            <div class="empty-state__title">${title}</div>
            ${desc ? `<div class="empty-state__desc">${desc}</div>` : ""}
            ${actionHtml}
        </div>
    `;
}
