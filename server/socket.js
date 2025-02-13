import { createServer } from "http";
import { Server } from "socket.io";
import app from "./main.js";

const server = createServer(app); // http server
const io = new Server(server); // socket server

io.on("connection", (socket) => {
  console.log("New Client Connected.");

  socket.on("disconnect", () => {
    console.log("Client Disconnected.");
  });
});

export const _io = io;
export default server;
