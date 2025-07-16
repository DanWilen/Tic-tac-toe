// server/src/controllers/gameController.ts
import { Server, Socket } from "socket.io";
import GameService from "../services/gameService";
import {
	CreateGameCallback,
	JoinGameData,
	JoinGameCallback,
	MoveData,
	MoveCallback,
} from "../types/socketTypes";

export function handleCreateGame(socket: Socket, callback: (data: CreateGameCallback) => void) {
	const game = GameService.createGame(socket.id);
	socket.join(game.id);
	callback({ gameId: game.id, symbol: game.nextTurn });
}

export function handleJoinGame( socket: Socket, io: Server, data: JoinGameData, callback: (data: JoinGameCallback | { error: string }) => void) {
	const result = GameService.joinGame(data.gameId, socket.id);
	if ("error" in result) {
		return void callback({ error: result.error });
	}

	const { game, symbol } = result;
	socket.join(game.id);

	// notify both players
	io.to(game.id).emit("gameStarted", {
		gameId: game.id,
		players: game.players.map((p) => p.id),
		nextTurn: game.nextTurn,
	});

	callback({
		gameId: game.id,
		symbol,
		players: game.players.map((p) => p.id),
	});
}

export function handleMakeMove( socket: Socket, io: Server, data: MoveData, callback: (data: MoveCallback) => void) {
	const result = GameService.makeMove(data.gameId, socket.id, data.row, data.col
	);

	if ("error" in result) {
		return void callback({ success: false, error: result.error });
	}

	const { board, state, winner, nextTurn } = result;
	io.to(data.gameId).emit("moveMade", {
		board,
		state,
		winner,
		nextTurn: state === "playing" ? nextTurn : null,
	});
	callback({ success: true });
}
