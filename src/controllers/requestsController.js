import * as RequestModel from "../models/requestsModel.js";
import * as WalletModel from "../models/walletModel.js";
import * as SellerModel from "../models/sellerModel.js";

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

// --- Step 3: Seller accepts → lock funds from customer ---

export async function acceptRequest(req, res) {
    try {
        const { seller_user_id } = req.body;
        if (!seller_user_id) {
            return res.status(400).json({ success: false, error: "seller_user_id required" });
        }

        const request = await RequestModel.getRequestById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }
        const st = (request.request_status || "").toUpperCase();
        if (st !== "WAITING" && st !== "PENDING") {
            return res.status(400).json({ success: false, error: "Request is not in WAITING status" });
        }

        const sellers = await SellerModel.getSellerByUserId(seller_user_id);
        if (!sellers.length) {
            return res.status(404).json({ success: false, error: "Seller not found" });
        }
        const seller_id = sellers[0].seller_id;

        await WalletModel.lockFunds(request.customer_id, request.budget);
        const updated = await RequestModel.acceptRequest(req.params.id, seller_id, request.budget);

        res.json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// --- Step 5: Customer confirms → release funds to seller ---

export async function completeRequest(req, res) {
    try {
        const request = await RequestModel.getRequestById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }
        if ((request.request_status || "").toUpperCase() !== "DONE") {
            return res.status(400).json({ success: false, error: "Request is not in DONE status" });
        }
        if (!request.seller_user_id) {
            return res.status(400).json({ success: false, error: "No seller assigned to this request" });
        }

        await WalletModel.releaseFundsToSeller(request.seller_user_id, request.locked_amount);
        const updated = await RequestModel.updateStatusRequest(req.params.id, "COMPLETE");

        res.json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
