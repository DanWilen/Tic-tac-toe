"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// serve client/public/*
const publicPath = path_1.default.resolve(__dirname, '../../client/public');
app.use(express_1.default.static(publicPath));
// also serve client/src under /src
const clientSrc = path_1.default.resolve(__dirname, '../../client/src');
app.use('/src', express_1.default.static(clientSrc));
// Health‑check endpoint
app.get("/health", (_req, res) => {
    res.status(200).send({ status: "ok" });
});
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // adjust for your client’s URL in production
        methods: ["GET", "POST"],
    },
});
// Register our game socket handlers
(0, socket_1.registerGameHandlers)(io);
httpServer.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
