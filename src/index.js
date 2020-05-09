const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  console.log("new websocket connection");

  socket.emit("message", "Welcome");
  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (message) => {
    io.emit("message", message);
  });
  socket.on("sendLocation", (location) => {
    socket.broadcast.emit(
      "message",
      `https://google.com/maps?q=${location.latitude},${location.longitude}`
    );
  });
  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});

server.listen(PORT, () => console.log(`Server is up on port ${PORT}`));
