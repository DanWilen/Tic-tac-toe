"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameHandlers = registerGameHandlers;
const gameController_1 = require("./controllers/gameController");
function registerGameHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on("createGame", (_, cb) => (0, gameController_1.handleCreateGame)(socket, cb));
        socket.on("joinGame", (data, cb) => (0, gameController_1.handleJoinGame)(socket, io, data, cb));
        socket.on("makeMove", (data, cb) => (0, gameController_1.handleMakeMove)(socket, io, data, cb));
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
            // cleanup if needed
        });
    });
}
