import dotenv from "dotenv";

import express from "express";

import { createServer } from "http";
import corsSetup from "./core/corsSetup";
import sequelize from "./core/orm";
import { setupWebSocketServer } from "./core/websocket";
import { configureMiddleware } from "./middlewares";
import { configAppRoutes } from "./routes";

dotenv.config();

const app = express();
const server = createServer(app);

// json
app.use(express.json());

// cors
corsSetup(app);

// Middlewares
configureMiddleware(app);

// websocket
setupWebSocketServer(server);

// Routes
configAppRoutes(app, express);

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    await sequelize.sync({
      alter: true,
      force: process.env.NODE_ENV === "development",
    });
    console.log("✅ All models synchronized.");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
})();
