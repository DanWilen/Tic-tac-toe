import { Server, Socket } from "socket.io";
import {
	handleCreateGame,
	handleJoinGame,
	handleMakeMove,
} from "./controllers/gameController";

export function registerGameHandlers(io: Server) {
	io.on("connection", (socket: Socket) => {
		console.log(`Client connected: ${socket.id}`);

		socket.on("createGame", (_: any, cb) => handleCreateGame(socket, cb));

		socket.on("joinGame", (data, cb) => handleJoinGame(socket, io, data, cb));

		socket.on("makeMove", (data, cb) => handleMakeMove(socket, io, data, cb));

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
			// Future - Addd cleanup
		});
	});
}
