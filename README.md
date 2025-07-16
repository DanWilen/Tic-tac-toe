# Tic‑Tac‑Toe

A simple real‑time multiplayer Tic‑Tac‑Toe game built with Node.js, TypeScript, Express, and Socket.IO (backend), and vanilla JavaScript (frontend).

## Prerequisites

* **Node.js** v14 or higher
* **npm** v6 or higher

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/YOUR_USERNAME/tic-tac-toe.git
   cd tic-tac-toe
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```

## Start the Server

From the project root, run:

```bash
npm run start:server
```

This will compile the backend and start the server on [http://localhost:3000](http://localhost:3000).

## Play the Game

1. **Open two browser tabs** and navigate to:

   ```
   http://localhost:3000/
   ```

2. **Create a new game** in the first tab:

   * Click **Create Game**
   * Copy the **Game ID** shown in the status message.

3. **Join the game** in the second tab:

   * Click **Join Game**
   * Paste the **Game ID** into the input and click **Confirm Join**

4. **Take turns** clicking on empty cells to place your symbol (X or O).

   * The status bar shows whose turn it is.
   * When someone wins or the board is full, the game ends.

5. **Start over** at any time by clicking **Create New Game**, and repeat steps 2–4.

Enjoy! Feel free to explore the code in `server/` and `client/`.

## Architecture & Implementation Details

### Server

* **Frameworks & Languages**: Node.js, TypeScript, Express, Socket.IO
* **Architecture**: Monorepo structure; backend with controllers, services, and an in-memory store for game state
* **Game State**: In-memory `Map` for fast lookup; easily extendable to Redis or a database for persistence and horizontal scaling
* **Testing & Quality**: Jest unit tests covering service logic and controllers; strict TypeScript mode for type safety

### Client

* **Frameworks & Languages**: Vanilla JavaScript with HTML5 & CSS; no build step required
* **Architecture**: Clear separation of concerns—network layer (`app.js`), state management (`state.js`), and UI rendering (`ui.js`)
* **Performance & Efficiency**: Minimal DOM updates, lightweight static assets, and responsive UI
* **User Experience**: Dynamic controls, status messages, and easy Game ID copy/paste

## Game Structure & Flow

### Entities

* **Game**: `id`, `board` (3×3 array of `X`/`O`/`null`), `players`, `nextTurn`, `state`, `winner`.
* **Player**: `id`, `symbol` (`X` or `O`).
* **Move**: `{ gameId, playerId, row, col }`.

### Basic Flow

1. **createGame**: Player 1 emits `createGame` → server creates a `Game` instance, assigns `X`, and returns `{ gameId, symbol }`.
2. **joinGame**: Player 2 emits `joinGame` → server adds player `O`, sets game state to `playing`, and emits `gameStarted` to both.
3. **makeMove**: Players emit `makeMove` with `{ gameId, row, col }` → server validates turn/position, updates board, checks win/draw, and broadcasts `moveMade` with updated state and `nextTurn`.
4. **Game Over**: When a win or draw is detected, server sets state to `finished`, assigns `winner` (`X`, `O`, or `draw`), and broadcasts final board.

### Win Condition Check

After each move, the server inspects all possible winning lines:

* **3 rows**
* **3 columns**
* **2 diagonals**

If any line has three identical non-null symbols, that symbol is the winner. If the board is full without a winner, it’s a draw.

Example helper in `gameService.ts`:

```ts
function checkWin(board: Cell[][]): Symbol | null {
  const lines = [
    // Rows
    [[0,0],[0,1],[0,2]],
    [[1,0],[1,1],[1,2]],
    [[2,0],[2,1],[2,2]],
    // Columns
    [[0,0],[1,0],[2,0]],
    [[0,1],[1,1],[2,1]],
    [[0,2],[1,2],[2,2]],
    // Diagonals
    [[0,0],[1,1],[2,2]],
    [[0,2],[1,1],[2,0]],
  ];
  for (const line of lines) {
    const [a,b,c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }
  return null;
}
```

This design keeps game logic encapsulated in the service layer, ensuring clean separation between transport (Socket.IO), controllers, and core game rules.
