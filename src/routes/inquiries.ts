import { Router } from "express";
import { Inquiry } from "../models/Inquiry";

const router = Router();

// Core handler used by both paths
async function createInquiry(req: any, res: any) {
  try {
    const { name, email, phone, businessType, message, source = "website" } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: "name and email required" });
    const doc = await Inquiry.create({ name, email, phone, businessType, message, source });
    return res.status(201).json({ ok: true, id: String(doc._id) });
  } catch (e) {
    return res.status(500).json({ error: "failed to save inquiry" });
  }
}

// POST /v1/inquiries  -> create inquiry
router.post("/v1/inquiries", createInquiry);

// GET /v1/inquiries  -> list latest for admin
router.get("/v1/inquiries", async (_req, res) => {
  const rows = await Inquiry.find().sort({ createdAt: -1 }).limit(500).lean();
  return res.json({ ok: true, data: rows });
});

export default router;
