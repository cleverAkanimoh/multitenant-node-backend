import dotenv from "dotenv";

import express from "express";

import { configAppRoutes } from "./routes";
import { configureMiddleware } from "./middlewares";
import corsSetup from "./core/corsSetup";
import { createServer } from "http";
import { setupWebSocketServer } from "./core/websocket";
import sequelize from "./core/orm";

dotenv.config();

const app = express();
const server = createServer(app);
app.use(express.json());

// cors
corsSetup(app);

// Middlewares
configureMiddleware(app);

// websocket
setupWebSocketServer(server);

// Routes
configAppRoutes(app);

const PORT = process.env.PORT || 8000;
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database connected and models synced.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database sync error:", err);
  });
