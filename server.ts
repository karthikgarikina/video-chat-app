import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

const rooms: Record<string, string[]> = {};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      rooms[roomId].push(socket.id);

      const otherUsers = rooms[roomId].filter(id => id !== socket.id);

      socket.emit("all-users", otherUsers);

      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("offer", ({ target, sdp }) => {
      io.to(target).emit("offer", {
        caller: socket.id,
        sdp
      });
    });

    socket.on("answer", ({ target, sdp }) => {
      io.to(target).emit("answer", {
        caller: socket.id,
        sdp
      });
    });

    socket.on("ice-candidate", ({ target, candidate }) => {
      io.to(target).emit("ice-candidate", {
        caller: socket.id,
        candidate
      });
    });

    socket.on("chat-message", ({ roomId, message }) => {
      io.to(roomId).emit("chat-message", {
        sender: socket.id,
        message
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

        socket.to(roomId).emit("user-left", socket.id);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});