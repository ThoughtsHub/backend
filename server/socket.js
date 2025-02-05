import { createServer } from "http";
import { Server } from "socket.io";
import { _app } from "./main.js";

const server = createServer(_app); // http server
const io = new Server(server); // socket server

export const _io = io;
export default server;