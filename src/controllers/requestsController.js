import * as RequestModel from "../models/requestsModel.js";

export async function getAll(req, res) {
    try {
        const requestsData = await RequestModel.getAllRequests();
        res.json({ success: true, data: requestsData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getById(req, res) {
    try {
        const requestData = await RequestModel.getRequestById(req.params.id);
        if (!requestData) {
            return res.status(404).json({ success: false, error: "requestData not found" });
        }
        res.json({ success: true, data: requestData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function create(req, res) {
    try {
        const { request_title, request_detail, budget, request_status, customer_id, service_type_id } = req.body;

        if (!request_title || !customer_id) {
            return res.status(400).json({
                success: false,
                error: "All fields required"
            });
        }

        const requestsData = await RequestModel.createRequest(request_title, request_detail, budget, request_status, customer_id, service_type_id);

        res.status(201).json({ success: true, data: requestsData });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function update(req, res) {
    try {
        const { request_title, request_detail, budget, request_status, customer_id, service_type_id } = req.body;

        if (!request_title || !customer_id) {
            return res.status(400).json({
                success: false,
                error: "All fields required"
            });
        }

        const requestData = await RequestModel.updateRequest(req.params.id, request_title, request_detail, budget, request_status, customer_id, service_type_id);

        if (!requestData) {
            return res.status(404).json({
                success: false,
                error: "Request not found"
            });
        }

        res.json({ success: true, data: requestData });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function remove(req, res) {
    try {
        const requestData = await RequestModel.deleteRequest(req.params.id);

        if (!requestData) {
            return res.status(404).json({
                success: false,
                error: "Request not found"
            });
        }

        res.json({
            success: true,
            data: requestData,
            message: "Request deleted"
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getByCustomerId(req, res) {
    try {
        const { customer_id } = req.query;

        const requestData = await RequestModel.getRequestByCustomerId(customer_id);
        if (!requestData) {
            return res.status(404).json({ success: false, error: "requestData not found" });
        }
        res.json({ success: true, data: requestData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateStatus(req, res) {
    try {
        const { request_status, seller_id } = req.body;

        if (!request_status) {
            return res.status(400).json({ success: false, error: "status required" });
        }

        const requestData = await RequestModel.updateStatusRequest(req.params.id, request_status, seller_id ?? null);

        if (!requestData) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }

        res.json({ success: true, data: requestData });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
