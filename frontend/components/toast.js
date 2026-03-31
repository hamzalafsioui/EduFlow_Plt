let container = null;

function getContainer() {
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}



export function showToast(message, type = 'info', duration = 4000) {
    const icons = { success: '-)', error: '(-_-)', info: '(--)', warning: '(-' };
    const c = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <span class="toast__icon">${icons[type]}</span>
        <span class="toast__msg">${message}</span>
        <button class="toast__close" aria-label="Dismiss">✕</button>
    `;

    toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));
    c.appendChild(toast);

    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;
}

function dismiss(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    // fallback remove
    setTimeout(() => toast.remove(), 400);
}

export const toast = {
    success: (msg, d) => showToast(msg, 'success', d),
    error:   (msg, d) => showToast(msg, 'error',   d),
    info:    (msg, d) => showToast(msg, 'info',     d),
    warning: (msg, d) => showToast(msg, 'warning',  d),
};
