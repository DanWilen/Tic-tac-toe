import path from 'path';
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import { registerGameHandlers } from "./socket";

const app = express();
const port = process.env.PORT || 3000;

// serve client/public/ and client/src*
const publicPath = path.resolve(__dirname, '../../client/public');
app.use(express.static(publicPath));

const clientSrc = path.resolve(__dirname, '../../client/src');
app.use('/src', express.static(clientSrc));

// Health‑check endpoint
app.get("/health", (_req, res) => {
	res.status(200).send({ status: "ok" });
});

const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
	cors: {
		origin: "*", // adjust for your client’s URL in production
		methods: ["GET", "POST"],
	},
});

// Register our game socket handlers
registerGameHandlers(io);

httpServer.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});
