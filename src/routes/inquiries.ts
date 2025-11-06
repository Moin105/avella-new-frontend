import { Router } from "express";

const router = Router();

// keep it minimal; or add your real server routes if you use this backend
router.get("/health", (_req, res) => res.json({ ok: true }));

export default router;
