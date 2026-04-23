import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const fileName = `uploads/${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from("stock")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicUrlData } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);

        return res.json({
            success: true,
            url: publicUrlData.publicUrl,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;