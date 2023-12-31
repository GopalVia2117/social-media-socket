const io = require("socket.io")(process.env.PORT, {
  cors: { origin: process.env.CLIENT_URL },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((u) => u.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  console.log("Connected Users");

  //take userId, socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log("Connected Users: ", users);
  });

  //send and get message
  socket.on(
    "sendMessage",
    ({ senderId, receiverId, text, notificationMessage }) => {
      const user = getUser(receiverId);
      user !== undefined &&
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
          notificationMessage,
        });
    }
  );

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected..");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
