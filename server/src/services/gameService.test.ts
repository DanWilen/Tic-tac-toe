import GameService from "./gameService";
import { GameState } from "../models/Game";

describe("GameService", () => {
	// after each test, clear the in-memory games Map
	afterEach(() => {
		(GameService as any).games.clear();
	});

	it("should create a new game with one player “X” and waiting state", () => {
		const game = GameService.createGame("player-1");
		expect(game.id).toBeDefined();
		expect(game.players).toHaveLength(1);
		expect(game.players[0].symbol).toBe("X");
		expect(game.nextTurn).toBe("X");
		expect(game.state).toBe(GameState.Waiting);
		expect(game.board.flat().every((cell) => cell === null)).toBe(true);
	});

	it("should allow a second player to join and start the game", () => {
		const { id: gameId } = GameService.createGame("p1");
		const result = GameService.joinGame(gameId, "p2");
		expect("error" in result).toBe(false);

		const { game, symbol } = result as any;
		expect(game.state).toBe(GameState.Playing);
		expect(game.players).toHaveLength(2);
		expect(symbol).toBe("O");
		expect(game.nextTurn).toBe("X");
	});

	it("should reject joining a non-existent game", () => {
		const result = GameService.joinGame("no-such-id", "p2");
		expect(result).toEqual({ error: "Game not found" });
	});

	it("should enforce turn order and valid moves", () => {
		const { id: gameId } = GameService.createGame("p1");
		GameService.joinGame(gameId, "p2");

		// p2 tries to play when it's X's turn
		const badTurn = GameService.makeMove(gameId, "p2", 0, 0);
		expect(badTurn).toEqual({ error: "Not your turn" });

		// p1 plays off-board
		const badPos = GameService.makeMove(gameId, "p1", 3, 3);
		expect(badPos).toEqual({ error: "Invalid board position" });

		// p1 plays a valid move
		const ok1 = GameService.makeMove(gameId, "p1", 0, 0) as any;
		expect(ok1.success).toBeUndefined(); // service returns MoveResult, not ack
		expect(ok1.board[0][0]).toBe("X");
		expect(ok1.state).toBe(GameState.Playing);
		expect(ok1.nextTurn).toBe("O");

		// p1 tries to play again immediately
		const badAgain = GameService.makeMove(gameId, "p1", 1, 1);
		expect(badAgain).toEqual({ error: "Not your turn" });

		// p2 plays on the same cell
		const badOccupied = GameService.makeMove(gameId, "p2", 0, 0);
		expect(badOccupied).toEqual({ error: "Cell already occupied" });
	});

	it("should detect a winning line (row, column, diagonal)", () => {
		const { id: gameId } = GameService.createGame("p1");
		GameService.joinGame(gameId, "p2");

		// X: (0,0)
		GameService.makeMove(gameId, "p1", 0, 0);
		// O: (1,0)
		GameService.makeMove(gameId, "p2", 1, 0);
		// X: (0,1)
		GameService.makeMove(gameId, "p1", 0, 1);
		// O: (1,1)
		GameService.makeMove(gameId, "p2", 1, 1);
		// X: (0,2) — completes top row
		const result = GameService.makeMove(gameId, "p1", 0, 2) as any;

		expect(result.state).toBe(GameState.Finished);
		expect(result.winner).toBe("X");
		expect(result.nextTurn).toBeNull();
	});

	it("should detect a draw when board is full", () => {
		const { id: gameId } = GameService.createGame("p1");
		GameService.joinGame(gameId, "p2");

		// Fill the board to a draw:
		// X O X
		// X X O
		// O X O
		const moves: [string, number, number][] = [
			["p1", 0, 0],
			["p2", 0, 1],
			["p1", 0, 2],
			["p2", 1, 2],
			["p1", 1, 0],
			["p2", 1, 1],
			["p1", 2, 1],
			["p2", 2, 0],
			["p1", 2, 2],
		];
		let last;
		for (const [pid, r, c] of moves) {
			last = GameService.makeMove(gameId, pid, r, c) as any;
		}

		expect(last.state).toBe(GameState.Finished);
		expect(last.winner).toBe("draw");
		expect(last.nextTurn).toBeNull();
	});
});
