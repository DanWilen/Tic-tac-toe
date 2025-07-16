import { v4 as uuidv4 } from "uuid";

export type Symbol = "X" | "O";
export type Cell = Symbol | null;

export enum GameState {
	Waiting = "waiting",
	Playing = "playing",
	Finished = "finished",
}

export interface Player {
	id: string;
	symbol: Symbol;
}

export default class Game {
	id: string;
	board: Cell[][];
	players: Player[];
	nextTurn: Symbol;
	state: GameState;
	winner: Symbol | "draw" | null;

	constructor(creatorId: string) {
		this.id = uuidv4();
		// Initialize empty 3x3 board
		this.board = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];
		// First player (creator) gets 'X'
		this.players = [{ id: creatorId, symbol: "X" }];
		this.nextTurn = "X";
		this.state = GameState.Waiting;
		this.winner = null;
	}
}
