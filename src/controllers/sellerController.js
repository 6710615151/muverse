import * as sellerModel from "../models/sellerModel.js";

export async function verifySeller(req, res) {
    try {
        const { seller_status } = req.body;
        const validStatuses = ["verified", "unverified", "suspended"];
        if (!seller_status || !validStatuses.includes(seller_status)) {
            return res.status(400).json({ success: false, error: `seller_status must be one of: ${validStatuses.join(", ")}` });
        }
        const seller = await sellerModel.verifySeller(req.params.id, seller_status);
        if (!seller) return res.status(404).json({ success: false, error: "Seller not found" });
        res.json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getAllSellers(req, res) {
    try {
        const data = await sellerModel.getAllSellers();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getSellerById(req, res) {
    try {
        const seller = await sellerModel.getSellerById(req.params.id);
        if (!seller) return res.status(404).json({ success: false, error: "Seller not found" });
        res.json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

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
        let seller = await sellerModel.getSellerByUserId(req.params.id);

        if (!seller || seller.length === 0) {
            const created = await sellerModel.createSellerIfNotExists(req.params.id);
            if (!created) {
                return res.status(404).json({ success: false, error: "Seller not found" });
            }
            return res.json({ success: true, data: created });
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

export async function checkSellerExists(req, res) {
    try {
        const { userId } = req.params;

        const exists = await sellerModel.checkSellerExists(userId);

        return res.json({
            success: true,
            data: exists
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}



export async function createSeller(req, res) {
    try {
         const { user_id, shop_name } = req.body;

        if (!shop_name) {
            return res.status(400).json({
                success: false,
                error: "shop_name is required"
            });
        }

        const exists = await sellerModel.checkSellerExists(user_id);
        if (exists) {
            return res.status(400).json({
                success: false,
                error: "Seller already exists"
            });
        }

        const seller = await sellerModel.createSeller(user_id, shop_name);

        res.status(201).json({
            success: true,
            data: seller
        });

    } catch (err) {
        console.error("CREATE SELLER ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}