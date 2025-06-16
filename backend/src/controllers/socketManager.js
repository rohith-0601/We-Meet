import { Server } from "socket.io";

let connections = {};
let timeonline = {};
let messages = {};

const connecttoSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("something connected");
    
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeonline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      // 🔹 Find the room this socket belongs to
      let matchingRoom = "";
      let found = false;

      for (const [room, sockets] of Object.entries(connections)) {
        if (sockets.includes(socket.id)) {
          matchingRoom = room;
          found = true;
          break; // stop looking once found
        }
      }

      // 🔹 If found, process the message
      if (found) {
        // If no messages yet for this room, create array
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        // Save the message to chat history
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        // Send the message to everyone in the room
        connections[matchingRoom].forEach((socketInRoom) => {
          io.to(socketInRoom).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      var key;

      for (const [k, v] of Object.entries(connections)) {
        if (v.includes(socket.id)) {
          key = k;

          // Notify everyone user left
          connections[key].forEach((sock) => {
            io.to(sock).emit("user-left", socket.id);
          });

          // Remove user
          connections[key] = v.filter((id) => id !== socket.id);

          // If room empty, delete it
          if (connections[key].length === 0) {
            delete connections[key];
          }

          break; // Done, no need to keep checking rooms
        }
      }
    });
  });

  return io;
};

export default connecttoSocket;
