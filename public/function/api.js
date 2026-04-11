async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Request failed");

    return data.data;
}

export const Users = {
    getAll: () => apiFetch("/api/user"),
    getById: (id) => apiFetch(`/api/user/${id}`),

    create: (body) => apiFetch("/api/user", {
        method: "POST", body: JSON.stringify(body),
    }),

    update: (id, body) => apiFetch(`/api/user/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    }),

    delete: (id) => apiFetch(`/api/user/${id}`, {
        method: "DELETE",
    }),
};