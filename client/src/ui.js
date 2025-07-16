// client/src/ui.js
(() => {
	const boardEl = document.getElementById("board");
	const statusEl = document.getElementById("status");
	const btnCreate = document.getElementById("btnCreate");
	const btnOpenJoin = document.getElementById("btnOpenJoin");
	const btnConfirmJoin = document.getElementById("btnConfirmJoin");
	const inputJoin = document.getElementById("inputJoin");
	const joinContainer = document.getElementById("joinContainer");
	const btnRestart = document.getElementById("btnRestart");

	function renderBoard() {
		const { board, state, nextTurn, mySymbol } = GameState.get();
		boardEl.innerHTML = "";

		board.forEach((rowArr, r) =>
			rowArr.forEach((cell, c) => {
				const div = document.createElement("div");
				div.className = "cell";
				div.textContent = cell || "";
				const clickable =
					state === "playing" && nextTurn === mySymbol && cell === null;
				if (clickable) {
					div.addEventListener("click", () => window.app.makeMove(r, c));
				} else {
					div.classList.add("disabled");
				}
				boardEl.appendChild(div);
			})
		);
	}

	function renderStatus(msg) {
		statusEl.textContent = msg;
	}

	function showJoinInput(show) {
		joinContainer.style.display = show ? "flex" : "none";
		if (show) inputJoin.focus();
	}

	function showControls(enabled) {
		// hide create/join buttons once game is in progress
		btnCreate.style.display = enabled ? "block" : "none";
		btnOpenJoin.style.display = enabled ? "block" : "none";
		joinContainer.style.display = "none";
	}

	function showRestart(show) {
		btnRestart.style.display = show ? "block" : "none";
	}

	function init() {
		btnCreate.addEventListener("click", () => window.app.createGame());
		btnOpenJoin.addEventListener("click", () => window.app.openJoin());
		btnConfirmJoin.addEventListener("click", () =>
			window.app.joinGame(inputJoin.value.trim())
		);
		btnRestart.addEventListener("click", () => window.app.restartGame());

		renderBoard();
		renderStatus("Not connected");
		showControls(true);
		showRestart(false);
	}

	window.UI = {
		renderBoard,
		renderStatus,
		showJoinInput,
		showControls,
		showRestart,
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
