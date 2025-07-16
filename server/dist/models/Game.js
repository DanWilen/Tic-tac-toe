"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
const uuid_1 = require("uuid");
var GameState;
(function (GameState) {
    GameState["Waiting"] = "waiting";
    GameState["Playing"] = "playing";
    GameState["Finished"] = "finished";
})(GameState || (exports.GameState = GameState = {}));
class Game {
    constructor(creatorId) {
        this.id = (0, uuid_1.v4)();
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
exports.default = Game;
