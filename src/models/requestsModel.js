// import sql from "../config/db.js"

// export async function createRequest(request_title,request_detail,budget,request_status,customer_id,category_id) {
//     return await sql`
//         INSERT INTO requests
//         (request_title, request_detail, budget, request_status, customer_id, category_id)
//         VALUES 
//         (${request_title},${request_detail},${budget},${request_status},${customer_id},${category_id})
//         RETURNING *`;
// }


// export async function getAllRequests() {
//     return await sql`
//         SELECT * FROM requests
//         ORDER BY request_id ASC;`;
// }

// export async function getRequestById(request_id) {
//     const result = await sql`
//         SELECT * FROM requests
//         WHERE request_id = ${request_id}
//         `;
//     return result[0] || null;
// }

// export async function updateRequest(request_id, request_title, request_detail, budget,request_status,customer_id,category_id) {
//     const result = await sql`
//         UPDATE requests
//         SET request_title = ${request_title},
//         request_detail = ${request_detail},
//         budget = ${budget},
//         request_status = ${request_status},
//         customer_id = ${customer_id},
//         category_id = ${category_id},
//         WHERE request_id = ${request_id};
//         RETURNING *`;
//     return result[0] || null;
// }

// export async function deleteRequest(request_id) {
//     const result = await sql`
//         DELETE FROM requests
//         WHERE request_id = ${request_id}
//         RETURNING *
//         `;
//     return result[0] || null;
// }

// // export async function countSeviceTypeOnRequest() {
// //     return await sql`
// //         SELECT 
// //         s.service_type_id,
// //         s.name,
// //         COUNT(r.request_id) AS total_requests
// //         FROM service_types s
// //         LEFT JOIN requests r 
// //         ON s.service_type_id = r.service_type_id
// //         GROUP BY s.service_type_id, s.name;
// //         `;
// // }

// export async function updateStatusRequest(request_id,request_status) {
//     const result = await sql`
//         UPDATE requests
//         SET request_status = ${request_status},
//         WHERE request_id = ${request_id};
//         RETURNING *`;
//     return result[0] || null;
// }

// export async function getRequestByCustomerId(customer_id) {
//     const result = await sql`
//         SELECT * FROM requests
//         WHERE customer_id = ${customer_id}
//         `;
//     return result;
// }


//test




import sql from "../config/db.js"

export async function createRequest(request_title,request_detail,budget,request_status,customer_id,service_type_id) {
    return await sql`
        INSERT INTO requests
        (request_title, request_detail, budget, request_status, customer_id, service_type_id)
        VALUES
        (${request_title},${request_detail},${budget},${request_status},${customer_id},${service_type_id})
        RETURNING *`;
}


export async function getAllRequests() {
    return await sql`
        SELECT * FROM requests
        ORDER BY request_id ASC;`;
}

export async function getRequestById(request_id) {
    const result = await sql`
        SELECT * FROM requests
        WHERE request_id = ${request_id}
        `;
    return result[0] || null;
}

export async function updateRequest(request_id, request_title, request_detail, budget,request_status,customer_id,service_type_id) {
    const result = await sql`
        UPDATE requests
        SET request_title = ${request_title},
        request_detail = ${request_detail},
        budget = ${budget},
        request_status = ${request_status},
        customer_id = ${customer_id},
        service_type_id = ${service_type_id}
        WHERE request_id = ${request_id}
        RETURNING *`;
    return result[0] || null;
}

export async function deleteRequest(request_id) {
    const result = await sql`
        DELETE FROM requests
        WHERE request_id = ${request_id}
        RETURNING *
        `;
    return result[0] || null;
}

// export async function countSeviceTypeOnRequest() {
//     return await sql`
//         SELECT 
//         s.service_type_id,
//         s.name,
//         COUNT(r.request_id) AS total_requests
//         FROM service_types s
//         LEFT JOIN requests r 
//         ON s.service_type_id = r.service_type_id
//         GROUP BY s.service_type_id, s.name;
//         `;
// }

export async function updateStatusRequest(request_id,request_status) {
    const result = await sql`
        UPDATE requests
        SET request_status = ${request_status}
        WHERE request_id = ${request_id}
        RETURNING *`;
    return result[0] || null;
}

export async function getRequestByCustomerId(customer_id) {
    const result = await sql`
        SELECT * FROM requests
        WHERE customer_id = ${customer_id}
        `;
    return result;
}