export interface CreateGameCallback {
  gameId: string;
  symbol: "X" | "O";
}

export interface JoinGameData {
  gameId: string;
}

export interface JoinGameCallback {
  gameId: string;
  symbol: "X" | "O";
  players: string[];
}

export interface MoveData {
  gameId: string;
  row: number;
  col: number;
}

export interface MoveCallback {
  success: boolean;
  error?: string;
}
