import * as userModel from "../models/userModel.js";

export async function getAll(req, res) {
    try {
        const users = await userModel.getAllUsers();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getById(req, res) {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function create(req, res) {
    try {
        const { name, email, password_hash, phone } = req.body;
        if (!name || !email || !password_hash || !phone) {
            return res.status(400).json({ success: false, error: "All fields required: name , email , password_hash,phone" });
        }
        const user = await userModel.createUser(name, email, password_hash, phone);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        if (err.message.includes("duplicate key")) {
            return res.status(409).json({ success: false, error: "user ID already exists" });
        }
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function update(req, res) {
    try {
        const { name, email, password, phone } = req.body;
        const course = await usesrModel.updateUser(req.params.id, name, email, password, phone);
        if (!course) return res.status(404).json({ success: false, error: "Course not found" });
        res.json({ success: true, data: course });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function remove(req, res) {
    try {
        const course = await userModel.deleteUser(req.params.id);
        if (!course) return res.status(404).json({ success: false, error: "Course not found" });
        res.json({ success: true, data: course, message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

