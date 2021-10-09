const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;
io.on("connection", (socket) => {
  socket.broadcast.emit("message", "New user has joined");
  console.log("New web Socket connection");
  socket.emit("message", "welcome");

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("profanity is not allowed");
    }
    io.emit("message", message);
    callback();
  });
  socket.on("disconnect", () => {
    io.emit("message", "A new user has left");
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "location",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    callback();
  });
  // socket.emit("countUpdated", count);

  // socket.on("increment", () => {
  //   count++;
  //   io.emit("countUpdated", count);
  // });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
