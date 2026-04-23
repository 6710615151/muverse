import * as sellerModel from "../models/sellerModel.js";

export async function getAllUserSeller(req, res) {
    try {
        const data = await sellerModel.getUserSeller();

        res.json({
            success: true,
            data: data,
            message: "User sellers fetched successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


export async function getSellerByUserId(req, res) {
    try {
        const seller = await sellerModel.getSellerByUserId(req.params.id);

        if (!seller || seller.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Seller not found"
            });
        }

        res.json({
            success: true,
            data: seller[0], 
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export async function getRole(req, res) {
    try {
        const user = await sellerModel.getRoleById(req.params.id);

        if (!user || user.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            data: user[0], 
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}