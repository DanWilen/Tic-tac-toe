(function () {
	// Internal game state
	const _state = {
		gameId: null,
		mySymbol: null,
		board: [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		],
		nextTurn: null,
		state: "waiting", // 'waiting', 'playing', 'finished'
		winner: null, // 'X', 'O', 'draw', or null
	};

	/* Reset state to initial values before a new game */
	function reset() {
		_state.gameId = null;
		_state.mySymbol = null;
		_state.board = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];
		_state.nextTurn = null;
		_state.state = "waiting";
		_state.winner = null;
	}

	/**
	 * Initialize a newly created or joined game
	 * @param {string} gameId
	 * @param {'X'|'O'} symbol
	 */
	function init(gameId, symbol) {
		_state.gameId = gameId;
		_state.mySymbol = symbol;
		_state.state = "waiting";
		_state.nextTurn = symbol;
		_state.winner = null;
		// clear board
		resetBoard();
	}

	/* Reset just the board array to empty */
	function resetBoard() {
		_state.board = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];
	}

	/**
	 * Apply gameStarted event data
	 * @param {{ gameId:string, nextTurn:'X'|'O' }} data
	 */
	function startPlaying(data) {
		_state.state = "playing";
		_state.gameId = data.gameId;
		_state.nextTurn = data.nextTurn;
		resetBoard();
	}

	/**
	 * Apply a moveMade event data
	 * @param {{ board: (string|null)[][], state:string, nextTurn:string|null, winner:string|null }} data
	 */
	function applyMove(data) {
		_state.board = data.board;
		_state.state = data.state;
		_state.nextTurn = data.nextTurn;
		_state.winner = data.winner;
	}

	// Expose API globally
	window.GameState = {
		get: () => _state,
		reset,
		init,
		startPlaying,
		applyMove,
	};
})();
