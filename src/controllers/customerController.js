import * as customerModel from "../models/customerModel.js";

export async function getAllUserCustomers(req, res) {
    try {
        const data = await customerModel.getUserCustomers();

        res.json({
            success: true,
            data: data,
            message: "User customers fetched successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export async function getCustomerByUserId(req, res) {
    try {
        const customer = await customerModel.getCustomerByUserId(req.params.id);

        if (!customer || customer.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Customer not found"
            });
        }

        res.json({
            success: true,
            data: customer[0], 
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}