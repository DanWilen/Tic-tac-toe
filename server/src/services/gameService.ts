import Game, { GameState, Symbol, Cell, Player } from "../models/Game";

interface MoveResult {
	board: Cell[][];
	state: GameState;
	winner: Symbol | "draw" | null;
	nextTurn: Symbol | null;
}

interface ErrorResult {
	error: string;
}

export default class GameService {
	private static games: Map<string, Game> = new Map();

	/* Create a new game with the creator as 'X' */
	public static createGame(creatorId: string): Game {
		const game = new Game(creatorId);
		this.games.set(game.id, game);
		return game;
	}

	/* Join an existing game as 'O' */
	public static joinGame(gameId: string, playerId: string): { game: Game; symbol: Symbol } | ErrorResult {
		const game = this.games.get(gameId);
		if (!game) {
			return { error: "Game not found" };
		}

		if (game.state !== GameState.Waiting) {
			return { error: "Game already started or full" };
		}

		// Add second player
		const player: Player = { id: playerId, symbol: "O" };
		game.players.push(player);
		game.state = GameState.Playing;
		return { game, symbol: player.symbol };
	}

	/* Apply a move for a player */
	public static makeMove(gameId: string, playerId: string, row: number, col: number): MoveResult | ErrorResult {
		const game = this.games.get(gameId);

		if (!game) {
			return { error: "Game not found" };
		}
		if (game.state !== GameState.Playing) {
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
			game.state = GameState.Finished;
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
			game.state = GameState.Finished;
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
	private static checkWin(board: Cell[][]): Symbol | null {
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
			if (
				cellA &&
				cellA === board[b[0]][b[1]] &&
				cellA === board[c[0]][c[1]]
			) {
				return cellA;
			}
		}
		return null;
	}

	/* Determine if the board is full (draw) */
	private static checkDraw(board: Cell[][]): boolean {
		return board.every((row) => row.every((cell) => cell !== null));
	}
}
