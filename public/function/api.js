async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message || data.error || "Request failed");

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

    login: (email, password) => apiFetch("/api/user/auth", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),

    toggleRole: (id) => apiFetch(`/api/user/toggleRole/${id}`, {
        method: "PUT"
    }),

    updateStatus: (id, status) => apiFetch(`/api/user/status/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    })
};

export const Category = {
    getAll: () => apiFetch("/api/category"),
    getById: (id) => apiFetch(`/api/category/${id}`)
}

export const Stock = {

    getAll: () => apiFetch("/api/stock"),

    getByCategory: (Category_id) => apiFetch(`/api/stock/category/${Category_id}`),

    getBySeller: (seller_id) => apiFetch(`/api/stock/seller/${seller_id}`),

    getById: (id) => apiFetch(`/api/stock/${id}`),

    create: (body) => apiFetch("/api/stock", {
        method: "POST",
        body: JSON.stringify(body),
    }),

    update: (id, body) => apiFetch(`/api/stock/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    }),

    delete: (id) => apiFetch(`/api/stock/${id}`, {
        method: "DELETE",
    }),

    updateQuantity: (id, quantity) => apiFetch(`/api/stock/${id}/quantity`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
    })
}

export const Order = {
    create: (body) => apiFetch("/api/order/buy", {
        method: "POST",
        body: JSON.stringify(body),
    }),

    getByCustomer: (customer_id) => apiFetch(`/api/order/customer/${customer_id}`),

    getBySeller: (seller_id) => apiFetch(`/api/order/seller/${seller_id}`),

    getById: (id) => apiFetch(`/api/order/${id}`),

    updateOrderStatus: (id, body) => apiFetch(`/api/order/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
    }),

    updateOrderPayment: (id, body) => apiFetch(`/api/order/${id}/payment`, {
        method: "PATCH",
        body: JSON.stringify(body),
    })
}

export const Wallet = {
    getBalance: (user_id) => apiFetch(`/api/wallet/balance/${user_id}`),

    topup: (body) => apiFetch("/api/wallet/topup", {
        method: "POST",
        body: JSON.stringify(body),
    }),

    withdraw: (body) => apiFetch("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify(body),
    }),

    transfer: (body) => apiFetch("/api/wallet/transfer", {
        method: "POST",
        body: JSON.stringify(body),
    }),

    getRecords: (user_id) => apiFetch(`/api/wallet/records/${user_id}`),

    pay: (body) => apiFetch("/api/wallet/pay", {
        method: "POST",
        body: JSON.stringify(body),
    }),
};

export const Requests = {
    getRequests: () => apiFetch("/api/request"),

    getByIdCustomer: (customer_id) => apiFetch(`/api/request/customerReq?customer_id=${customer_id}`),

    updateRequestStatus: (id, body) => apiFetch(`/api/request/updateStatus/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    }),

    getByIdRequest: (id) => apiFetch(`/api/request/${id}`),

    createRequest: (body) => apiFetch("/api/request", {
        method: "POST", body: JSON.stringify(body),
    }),

    updateRequest: (id, body) => apiFetch(`/api/request/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    }),

    deleteRequest: (id) => apiFetch(`/api/request/${id}`, {
        method: "DELETE",
    }),

    updateStatus: (id, status) => apiFetch(`/api/request/updateStatus/${id}`, {
        method: "PUT",
        body: JSON.stringify({ request_status: status }),
    }),
};

export const serviceType = {
    getAllServiceType: () => apiFetch("/api/serviceTypes"),
    getByIdServiceType: (id) => apiFetch(`/api/serviceTypes/${id}`),

    createServiceType: (body) => apiFetch("/api/serviceTypes", {
        method: "POST", body: JSON.stringify(body),
    }),

    updateServiceType: (id, body) => apiFetch(`/api/serviceTypes/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    }),

    deleteServiceType: (id) => apiFetch(`/api/serviceTypes/${id}`, {
        method: "DELETE",
    }),

};
export const seller = {
    getAllSeller: () => apiFetch("/api/seller"),
    getByIdSeller: (id) => apiFetch(`/api/seller/${id}`),
    getByUserId: (userId) => apiFetch(`/api/seller/user/${userId}`),
    verifySeller: (id, seller_status) => apiFetch(`/api/seller/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ seller_status }),
    }),
};

export const Review = {
    create: (body) => apiFetch("/api/review", {
        method: "POST",
        body: JSON.stringify(body),
    }),
    getBySeller: (seller_id) => apiFetch(`/api/review/seller/${seller_id}`),
};

export const Customer = {
    getByUserId: (userId) => apiFetch(`/api/customer/user/${userId}`),
}