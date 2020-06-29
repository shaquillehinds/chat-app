const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { GenerateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");
const { rooms } = require("./utils/rooms");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/rooms", (req, res) => {
  if (Object.keys(rooms).length > 0) {
    return res.send(rooms);
  }
  res.status(404).send("No Rooms In Use");
});

io.on("connection", (socket) => {
  const id = socket.id;

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(room);

    socket.emit(
      "message",
      new GenerateMessage(
        `Welcome ${user.username.replace(/^./, user.username[0].toUpperCase())}`,
        "Admin"
      )
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        new GenerateMessage(
          `${user.username.replace(/^./, user.username[0].toUpperCase())} has joined!`,
          "Admin"
        )
      );
    io.to(user.room).emit("usersInRoom", { room: user.room, users: getUsersInRoom(getUser(id).room) });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    if (!getUser(id)) {
      return socket.emit("login", "Please sign in");
    }
    const delivery = new GenerateMessage(message, getUser(id).username);
    io.to(getUser(id).room).emit("message", delivery);
    callback("Delivered");
  });
  socket.on("sendLocation", ({ longitude, latitude }, acknowledge) => {
    if (!getUser(id)) {
      return socket.emit("login", "Pleas sign in");
    }
    io.to(getUser(id).room).emit(
      "locationMessage",
      new GenerateMessage(`https://google.com/maps?q=${latitude},${longitude}`, getUser(id).username)
    );
    acknowledge();
  });
  socket.on("sendImage", (image, acknowledge) => {
    if (!getUser(id)) {
      return socket.emit("login", "Pleas sign in");
    }
    io.to(getUser(id).room).emit(
      "image",
      new GenerateMessage(image.toString("base64"), getUser(id).username)
    );
    acknowledge("Image Sent");
  });
  socket.on("disconnect", () => {
    const user = removeUser(id);
    if (!user) {
      return null;
    }
    io.to(user.room).emit(
      "message",
      new GenerateMessage(
        `${user.username.replace(/^./, user.username[0].toUpperCase())} has left the chat`,
        "Admin"
      )
    );
    io.to(user.room).emit("usersInRoom", { room: user.room, users: getUsersInRoom(user.room) });
  });
});

server.listen(PORT, () => console.log(`Server is up on port ${PORT}`));
