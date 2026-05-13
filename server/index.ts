import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { getBranding, saveBranding, uploadAsset, listAssets, upload } from "./routes/admin";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded assets
  app.use("/uploads", express.static(path.resolve("public/uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Admin branding routes
  app.get("/api/admin/branding", getBranding);
  app.post("/api/admin/branding", saveBranding);
  app.post("/api/admin/upload", upload.single("file"), uploadAsset);
  app.get("/api/admin/assets", listAssets);

  return app;
}
