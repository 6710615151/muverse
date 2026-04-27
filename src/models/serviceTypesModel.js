import sql from "../config/db.js"

export async function createService(name) {
    const result = await sql`
        INSERT INTO service_types
        (name)
        VALUES
        (${name})
        RETURNING *`;
    return result[0] || null;
}


export async function getAllService() {
    return await sql`
        SELECT * FROM service_types
        ORDER BY service_type_id ASC;`;
}

export async function getServiceById(service_type_id) {
    const result = await sql`
        SELECT * FROM service_types
        WHERE service_type_id = ${service_type_id}
        `;
    return result[0] || null;
}

export async function updateService(service_type_id,name) {
    const result = await sql`
        UPDATE service_types
        SET name = ${name}
        WHERE service_type_id = ${service_type_id}
        RETURNING *`;
    return result[0] || null;
}

export async function deleteService(service_type_id) {
    const result = await sql`
        DELETE FROM service_types
        WHERE service_type_id = ${service_type_id}
        RETURNING *
        `;
    return result[0] || null;
}

