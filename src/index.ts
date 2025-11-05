import express from "express";
import cors from "cors";
import inquiriesRouter from "./routes/inquiries";

const app = express();
app.use(express.json({ limit: "300kb" }));

// Allow your frontends (comma-separated origins in env). Fallback = open in dev.
const origins = (process.env.FRONTEND_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(origins.length ? cors({ origin: origins, methods: ["GET","POST","OPTIONS"] }) : cors());

app.use(inquiriesRouter);

export default app;

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
