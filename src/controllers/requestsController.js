import * as RequestModel from "../models/requestsModel.js";
import * as WalletModel from "../models/walletModel.js";

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
        const request_id = req.params.id;

        if (!request_status) {
            return res.status(400).json({ success: false, error: "status required" });
        }

<<<<<<< Updated upstream
=======
        // ดึงข้อมูล request ปัจจุบัน
>>>>>>> Stashed changes
        const current = await RequestModel.getRequestById(request_id);
        if (!current) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }

        if (request_status === "ACCEPTED") {
<<<<<<< Updated upstream
=======
            // ต้องการ seller_id จาก body
>>>>>>> Stashed changes
            if (!seller_id) {
                return res.status(400).json({ success: false, error: "seller_id required for ACCEPTED" });
            }
            const amount = parseFloat(current.budget) || 0;
            if (amount <= 0) {
                return res.status(400).json({ success: false, error: "budget must be > 0 to lock funds" });
            }
<<<<<<< Updated upstream
            await WalletModel.lockFunds(current.customer_id, amount);
=======
            // ล็อกเงินจาก wallet ลูกค้า
            await WalletModel.lockFunds(current.customer_id, amount);
            // อัปเดต request พร้อม seller_id และ locked_amount
>>>>>>> Stashed changes
            const updated = await RequestModel.acceptRequest(request_id, seller_id, amount);
            return res.json({ success: true, data: updated, message: "Booking accepted, funds locked" });
        }

        if (request_status === "COMPLETED") {
            const locked = parseFloat(current.locked_amount) || 0;
<<<<<<< Updated upstream
=======
            // โอนเงินที่ล็อกไว้ให้ผู้ขาย (seller_user_id มาจาก JOIN ใน getRequestById)
>>>>>>> Stashed changes
            if (locked > 0) {
                if (!current.seller_user_id) {
                    return res.status(400).json({ success: false, error: "No seller assigned to this request" });
                }
                await WalletModel.releaseFundsToSeller(current.seller_user_id, locked);
            }
            const updated = await RequestModel.updateStatusRequest(request_id, "COMPLETED");
            return res.json({ success: true, data: updated, message: "Service completed, funds released to seller" });
        }

        if (request_status === "REJECTED") {
            const locked = parseFloat(current.locked_amount) || 0;
<<<<<<< Updated upstream
            if (locked > 0) {
                await WalletModel.refundFunds(current.customer_id, locked);
=======
            // คืนเงินให้ลูกค้าถ้ามีการล็อกไว้แล้ว
            if (locked > 0) {
                await WalletModel.refundFunds(current.customer_id, locked);
                // รีเซ็ต locked_amount
>>>>>>> Stashed changes
                await RequestModel.acceptRequest(request_id, current.seller_id, 0);
            }
            const updated = await RequestModel.updateStatusRequest(request_id, "REJECTED");
            return res.json({ success: true, data: updated, message: locked > 0 ? "Booking rejected, funds refunded" : "Booking rejected" });
        }

<<<<<<< Updated upstream
=======
        // status อื่นๆ (WAITING, CANCELLED ฯลฯ) — แค่อัปเดตตรงๆ
>>>>>>> Stashed changes
        const requestData = await RequestModel.updateStatusRequest(request_id, request_status);
        res.json({ success: true, data: requestData });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
