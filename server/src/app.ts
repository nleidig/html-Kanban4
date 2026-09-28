import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth";
import boardsRoutes from "./routes/boards";
import columnsRoutes from "./routes/columns";
import cardsRoutes from "./routes/cards";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/boards", boardsRoutes);
  app.use("/api", columnsRoutes);
  app.use("/api", cardsRoutes);

  app.use(errorHandler);

  return app;
}
