export const API_BASE = 'http://localhost:8000/api';


export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('eduflow_token');

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const config = {
        ...options,
        headers,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // Auto-logout on token expiry
    if (res.status === 401) {
        localStorage.removeItem('eduflow_token');
        localStorage.removeItem('eduflow_user');
        window.location.hash = '#/login';
        throw new Error('Session expired. Please log in again.');
    }

    return res;
}

/* ===== Auth ===== */
export const authApi = {
    login: (data)    => apiFetch('/auth/login',    { method: 'POST', body: data }),
    register: (data) => apiFetch('/auth/register', { method: 'POST', body: data }),
    logout: ()       => apiFetch('/auth/logout',   { method: 'POST' }),
    me: ()           => apiFetch('/auth/me'),
    sendResetEmail: (data) => apiFetch('/auth/password/email',  { method: 'POST', body: data }),
    resetPassword:  (data) => apiFetch('/auth/password/reset',  { method: 'POST', body: data }),
};

/* ===== Courses ===== */
export const courseApi = {
    getAll: ()           => apiFetch('/courses'),
    getRecommended: ()   => apiFetch('/courses/recommended'),
    getById: (id)        => apiFetch(`/courses/${id}`),
    create: (data)       => apiFetch('/courses',     { method: 'POST',   body: data }),
    update: (id, data)   => apiFetch(`/courses/${id}`, { method: 'PUT',  body: data }),
    delete: (id)         => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
};

/* ===== Wishlist ===== */
export const wishlistApi = {
    getAll: ()    => apiFetch('/wishlist'),
    toggle: (id)  => apiFetch(`/wishlist/courses/${id}`, { method: 'POST' }),
};

/* ===== Enrollment ===== */
export const enrollmentApi = {
    checkout: (id)   => apiFetch(`/courses/${id}/checkout`,        { method: 'POST' }),
    success:  (id)   => apiFetch(`/courses/${id}/enroll/success`),
    withdraw: (id)   => apiFetch(`/courses/${id}/enroll`,          { method: 'DELETE' }),
};

/* ====== Teacher ===== */
export const teacherApi = {
    getStatistics:   ()              => apiFetch('/teacher/statistics'),
    getCourseStudents:(courseId)     => apiFetch(`/teacher/courses/${courseId}/students`),
    getCourseGroups:  (courseId)     => apiFetch(`/teacher/courses/${courseId}/groups`),
    getGroupStudents: (courseId, gId)=> apiFetch(`/teacher/courses/${courseId}/groups/${gId}/students`),
};

/* ====== Categories ====== */
export const categoryApi = {
    getAll: () => apiFetch('/categories'),
};
