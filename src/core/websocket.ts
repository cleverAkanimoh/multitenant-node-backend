import { Server as HTTPServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { verifyJwtToken } from "../apps/authentication/services";
import User from "../apps/users/models/user";
import { debugLog } from "../utils/debugLog";

const clients = new Map<string, Socket>();

export const setupWebSocketServer = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://emetrics.netlify.app",
      ],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication failed"));

    try {
      const decoded = verifyJwtToken(token);
      const userId = decoded.userId;

      const user = await User.findByPk(userId);

      if (!user) return next(new Error("Invalid token"));

      (socket as any).userId = userId;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    clients.set(userId, socket);

    debugLog(`User ${userId} connected`);

    socket.on("send", (data) => {
      debugLog(`Message from ${userId}:`, data);
      io.emit("newMessage", { userId, ...data }); // Broadcast to all clients
    });

    socket.on("disconnect", () => {
      clients.delete(userId);
      debugLog(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const sendToUser = (userId: string, message: object) => {
  const socket = clients.get(userId);
  if (socket) {
    socket.emit("notification", message);
  }
};
