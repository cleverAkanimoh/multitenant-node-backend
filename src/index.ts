import dotenv from "dotenv";

import express from "express";

import { createServer } from "http";
import corsSetup from "./core/corsSetup";
import { syncTenantSchemas } from "./core/multitenancy";
import sequelize from "./core/orm";
import { setupWebSocketServer } from "./core/websocket";
import { configureMiddleware } from "./middlewares";
import { configAppRoutes } from "./routes";
import { debugLog } from "./utils/debugLog";

dotenv.config();

const app = express();
const server = createServer(app);

// cors
corsSetup(app);

// json
app.use(express.json());

// Middlewares
configureMiddleware(app);

// websocket
setupWebSocketServer(server);

// Routes
configAppRoutes(app, express);

const PORT = process.env.PORT;

(async () => {
  try {
    await sequelize.authenticate();
    debugLog("✅ Database connected successfully.");

    await sequelize.sync({
      alter: true,
      // force: true, // process.env.NODE_ENV === "development"
    });
    debugLog("✅ Public schema synchronized.");

    // Sync tenant schemas
    await syncTenantSchemas();

    server.listen(PORT, () => {
      debugLog(`Server running on port ${PORT}`);
    });
  } catch (error) {
    debugLog("❌ Database connection error:", error);
  }
})();
