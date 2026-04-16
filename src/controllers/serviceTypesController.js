import * as serviceModel from "../models/serviceTypesModel.js";

export async function getAll(req, res) {
    try {
        const servicesData = await serviceModel.getAllService();
        res.json({ success: true, data: servicesData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getById(req, res) {
    try {
        const serviceData = await serviceModel.getServiceById(req.params.id);
        if (!serviceData) {
            return res.status(404).json({ success: false, error: "serviceData not found" });
        }
        res.json({ success: true, data: serviceData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function create(req, res) {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: "All fields required"
            });
        }


        const servicesData = await serviceModel.createService(name);

        res.status(201).json({ success: true, data: servicesData });

    } catch (err) {
        // if (err.code === "23505") {
        //     return res.status(409).json({
        //         success: false,
        //         error: "request already exists"
        //     });
        // }
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function update(req, res) {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: "All fields required"
            });
        }

        const serviceData = await serviceModel.updateService(req.params.id,name);

        if (!serviceData) {
            return res.status(404).json({
                success: false,
                error: "service type not found"
            });
        }

        res.json({ success: true, data: serviceData });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function remove(req, res) {
    try {
        const serviceData = await serviceModel.deleteService(req.params.id);

        if (!serviceData) {
            return res.status(404).json({
                success: false,
                error: "service type not found"
            });
        }

        res.json({
            success: true,
            data: serviceData,
            message: "service type deleted"
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}




