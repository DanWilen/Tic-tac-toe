"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = __importStar(require("../models/Game"));
class GameService {
    /* Create a new game with the creator as 'X' */
    static createGame(creatorId) {
        const game = new Game_1.default(creatorId);
        this.games.set(game.id, game);
        return game;
    }
    /* Join an existing game as 'O' */
    static joinGame(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return { error: "Game not found" };
        }
        if (game.state !== Game_1.GameState.Waiting) {
            return { error: "Game already started or full" };
        }
        // Add second player
        const player = { id: playerId, symbol: "O" };
        game.players.push(player);
        game.state = Game_1.GameState.Playing;
        return { game, symbol: player.symbol };
    }
    /* Apply a move for a player */
    static makeMove(gameId, playerId, row, col) {
        const game = this.games.get(gameId);
        if (!game) {
            return { error: "Game not found" };
        }
        if (game.state !== Game_1.GameState.Playing) {
            return { error: "Game is not in progress" };
        }
        const player = game.players.find((p) => p.id === playerId);
        if (!player) {
            return { error: "Player not part of this game" };
        }
        if (game.nextTurn !== player.symbol) {
            return { error: "Not your turn" };
        }
        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return { error: "Invalid board position" };
        }
        if (game.board[row][col] !== null) {
            return { error: "Cell already occupied" };
        }
        // Place symbol
        game.board[row][col] = player.symbol;
        // Check for win or draw
        const winner = GameService.checkWin(game.board);
        if (winner) {
            game.state = Game_1.GameState.Finished;
            game.winner = winner;
            return {
                board: game.board,
                state: game.state,
                winner,
                nextTurn: null,
            };
        }
        const isDraw = GameService.checkDraw(game.board);
        if (isDraw) {
            game.state = Game_1.GameState.Finished;
            game.winner = "draw";
            return {
                board: game.board,
                state: game.state,
                winner: "draw",
                nextTurn: null,
            };
        }
        // Continue playing
        game.nextTurn = player.symbol === "X" ? "O" : "X";
        return {
            board: game.board,
            state: game.state,
            winner: null,
            nextTurn: game.nextTurn,
        };
    }
    /* Check rows, columns, and diagonals for a winner */
    static checkWin(board) {
        const lines = [
            // Rows
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            // Columns
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            // Diagonals
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]],
        ];
        for (const line of lines) {
            const [a, b, c] = line;
            const cellA = board[a[0]][a[1]];
            if (cellA &&
                cellA === board[b[0]][b[1]] &&
                cellA === board[c[0]][c[1]]) {
                return cellA;
            }
        }
        return null;
    }
    /* Determine if the board is full (draw) */
    static checkDraw(board) {
        return board.every((row) => row.every((cell) => cell !== null));
    }
}
GameService.games = new Map();
exports.default = GameService;
