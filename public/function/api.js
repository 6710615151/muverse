import { withdraw } from "../../src/controllers/walletController";

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

    login: (email, password) => apiFetch("/api/user/auth", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),
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

    create: (body) => apiFetch("/api/stock",{
        method: "POST",
        body: JSON.stringify(body),
    }),

    update: (id, body) => apiFetch(`/api/stock/${id}`,{
        method: "PUT",
        body: JSON.stringify(body),
    }),

    delete: (id) => apiFetch(`/api/stock/${id}`,{
        method: "DELETE",
    })
}

export const Order = {
    create: (body) => apiFetch("/api/order/buy",{
        method: "POST",
        body: JSON.stringify(body),
    }),

    getByCustomer: (customer_id) => apiFetch(`/api/order/customer/${customer_id}`),
    getBySeller: (seller_id) => apiFetch(`/api/order/seller/${seller_id}`),
    getById: (id) => apiFetch(`/api/order/${id}`),

    updateOrderStatus: (id, body) => apiFetch(`/api/order/${id}/status`,{
        method: "PATCH",
        body: JSON.stringify(body),
    }),

    updateOrderPayment: (id, body) => apiFetch(`/api/order/${id}/payment`,{
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

    transfer: (body) => apiFetch("api/wallet/transfer",{
        method: "POST",
        body: JSON.stringify(body),
    }),

    getRecords: (user_id) => apiFetch(`/api/wallet/records/${user_id}`)
};

export const Requests = {
    getRequests: () => apiFetch("/api/request"),

    getByIdCustomer: (customer_id) => apiFetch(`/api/request/customerReq?customer_id=${customer_id}`),

    updateRequestStatus: (id, body) => apiFetch(`/api/updateStatus/${id}`, {
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