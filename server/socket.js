import { createServer } from "http";
import app from "./main.js";
import { Server } from "socket.io";

const server = createServer(app);
// const io = new Server(server);

// socket comms

export default server;
