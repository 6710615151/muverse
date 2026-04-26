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
        SELECT 
            r.*, 
            st.service_type_name,     -- ดึงชื่อประเภทบริการมา
            u.username as customer_name -- ดึงชื่อลูกค้า (ถ้าต้องการ)
        FROM requests r
        LEFT JOIN service_types st ON r.service_type_id = st.service_type_id
        LEFT JOIN users u ON r.customer_id = u.user_id
        ORDER BY r.request_id ASC;`;
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
        SELECT 
            r.*, 
            st.service_type_name 
        FROM requests r
        LEFT JOIN service_types st ON r.service_type_id = st.service_type_id
        WHERE r.customer_id = ${customer_id}
        ORDER BY r.created_at DESC
        `;
    return result;
}