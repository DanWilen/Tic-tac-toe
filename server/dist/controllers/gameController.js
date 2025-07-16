"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateGame = handleCreateGame;
exports.handleJoinGame = handleJoinGame;
exports.handleMakeMove = handleMakeMove;
const gameService_1 = __importDefault(require("../services/gameService"));
function handleCreateGame(socket, callback) {
    const game = gameService_1.default.createGame(socket.id);
    socket.join(game.id);
    callback({ gameId: game.id, symbol: game.nextTurn });
}
function handleJoinGame(socket, io, data, callback) {
    const result = gameService_1.default.joinGame(data.gameId, socket.id);
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
function handleMakeMove(socket, io, data, callback) {
    const result = gameService_1.default.makeMove(data.gameId, socket.id, data.row, data.col);
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
