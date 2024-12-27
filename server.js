const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname)); // Serve static files like index.html

const rooms = {}; // Store active room IDs

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle room creation
  socket.on("create-room", (roomID) => {
    if (!rooms[roomID]) {
      rooms[roomID] = [];
    }
    socket.join(roomID);
    rooms[roomID].push(socket.id);
    console.log(`Room created: ${roomID}`);
  });

  // Handle joining a room
  socket.on("join-room", (roomID) => {
    if (rooms[roomID]) {
      socket.join(roomID);
      rooms[roomID].push(socket.id);
      console.log(`User joined room: ${roomID}`);
      io.to(roomID).emit("room-status", `A new user has joined Room: ${roomID}`);
    } else {
      socket.emit("room-status", "Room does not exist.");
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const roomID in rooms) {
      rooms[roomID] = rooms[roomID].filter((id) => id !== socket.id);
      if (rooms[roomID].length === 0) {
        delete rooms[roomID]; // Clean up empty rooms
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
