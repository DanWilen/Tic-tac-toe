// client/src/app.js
(() => {
	const socket = io();

	socket.on("connect", () => {
		UI.renderStatus("Connected. Create or join a game.");
	});

	socket.on("gameStarted", (data) => {
		// data.nextTurn tells us who goes first
		GameState.startPlaying(data);
		UI.renderBoard();
		UI.renderStatus(
			GameState.get().nextTurn === GameState.get().mySymbol
				? "Your turn."
				: "Opponent's turn."
		);
		// show restart once game is playing
		UI.showRestart(true);
	});

	socket.on("moveMade", (data) => {
		GameState.applyMove(data);
		UI.renderBoard();

		if (GameState.get().state === "finished") {
			if (GameState.get().winner === "draw") {
				UI.renderStatus("Draw!");
			} else {
				UI.renderStatus(`Player '${GameState.get().winner}' wins!`);
			}
			UI.showRestart(true);
		} else {
			UI.renderStatus(
				GameState.get().nextTurn === GameState.get().mySymbol
					? "Your turn."
					: "Opponent's turn."
			);
		}
	});

	socket.on("playerDisconnected", (data) => {
		UI.renderStatus(`Player ${data.playerId} disconnected.`);
	});

	// Expose our actions
	window.app = {
		createGame: () => {
			GameState.reset();
			UI.renderBoard();
			socket.emit("createGame", null, (resp) => {
				// show the game ID in status, easy to copy
				UI.renderStatus(`Game created: ${resp.gameId}`);
				GameState.init(resp.gameId, resp.symbol);
				UI.showControls(false);
			});
		},

		openJoin: () => {
			UI.showJoinInput(true);
		},

		joinGame: (gameId) => {
			GameState.reset();
			UI.renderBoard();
			socket.emit("joinGame", { gameId }, (resp) => {
				if (resp.error) {
					UI.renderStatus("Error: " + resp.error);
					return;
				}
				GameState.init(resp.gameId, resp.symbol);
				UI.renderStatus(`Joined game: ${resp.gameId}`);
				UI.showControls(false);
			});
		},

		makeMove: (r, c) => {
			socket.emit(
				"makeMove",
				{ gameId: GameState.get().gameId, row: r, col: c },
				(ack) => {
					if (!ack.success) {
						UI.renderStatus("Error: " + ack.error);
					}
				}
			);
		},

		restartGame: () => {
			// simple full‑page reload for fresh join
			window.location.reload();
		},
	};
})();
