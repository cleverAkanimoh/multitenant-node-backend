import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyJwtToken } from "../apps/authentication/services";
import { prisma } from "./prisma";

const clients = new Map<string, Socket>(); // Map userId to Socket connection

export const setupWebSocketServer = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ["http://localhost:3000", "https://nuifashion.vercel.app"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication failed"));

    try {
      const decoded = verifyJwtToken(token) as {
        id: string;
      };
      const userId = decoded.id;

      const user = prisma.user.findUnique({ where: { id: decoded.id } });
      const company = prisma.company.findUnique({
        where: { id: decoded.id },
      });

      const validUser = user || company;

      if (!validUser) return next(new Error("Invalid token"));

      (socket as any).userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    clients.set(userId, socket);

    console.log(`User ${userId} connected`);

    socket.on("send", (data) => {
      console.log(`Message from ${userId}:`, data);
      io.emit("newMessage", { userId, ...data }); // Broadcast to all clients
    });

    socket.on("disconnect", () => {
      clients.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

// Function to send a message to a specific user
export const sendToUser = (userId: string, message: object) => {
  const socket = clients.get(userId);
  if (socket) {
    socket.emit("notification", message);
  }
};
