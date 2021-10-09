const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessages,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;
io.on("connection", (socket) => {
  socket.broadcast.emit("message", generateMessages("==New user has joined=="));
  console.log("New web Socket connection");
  socket.emit("message", generateMessages("welcome!!"));

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("profanity is not allowed");
    }
    io.emit("message", generateMessages(message));
    callback();
  });
  socket.on("disconnect", () => {
    io.emit("message", generateMessages("==A new user has left=="));
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "location",
      generateLocationMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
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
