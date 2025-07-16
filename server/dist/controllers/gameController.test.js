"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameController_1 = require("./gameController");
const gameService_1 = __importDefault(require("../services/gameService"));
// Mock GameService
jest.mock('../services/gameService');
const mockedService = gameService_1.default;
describe('gameController', () => {
    let socket;
    let io;
    let callback;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Fake socket
        socket = {
            id: 'socket-1',
            join: jest.fn()
        };
        // Fake io
        io = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };
        callback = jest.fn();
    });
    describe('handleCreateGame', () => {
        it('should create a game, join room, and callback with gameId and symbol', () => {
            // Arrange
            const fakeGame = { id: 'game-123', nextTurn: 'X' };
            mockedService.createGame.mockReturnValue(fakeGame);
            // Act
            (0, gameController_1.handleCreateGame)(socket, callback);
            // Assert
            expect(mockedService.createGame).toHaveBeenCalledWith('socket-1');
            expect(socket.join).toHaveBeenCalledWith('game-123');
            expect(callback).toHaveBeenCalledWith({ gameId: 'game-123', symbol: 'X' });
        });
    });
    describe('handleJoinGame', () => {
        it('should callback error if joinGame returns error', () => {
            // Arrange
            mockedService.joinGame.mockReturnValue({ error: 'Game not found' });
            // Act
            (0, gameController_1.handleJoinGame)(socket, io, { gameId: 'bad-id' }, callback);
            // Assert
            expect(mockedService.joinGame).toHaveBeenCalledWith('bad-id', 'socket-1');
            expect(callback).toHaveBeenCalledWith({ error: 'Game not found' });
            expect(io.to).not.toHaveBeenCalled();
        });
        it('should join room, emit gameStarted, and callback success', () => {
            // Arrange
            const fakeGame = { id: 'game-456', players: [{ id: 'p1' }, { id: 'p2' }], nextTurn: 'O' };
            mockedService.joinGame.mockReturnValue({ game: fakeGame, symbol: 'O' });
            // Act
            (0, gameController_1.handleJoinGame)(socket, io, { gameId: 'game-456' }, callback);
            // Assert
            expect(mockedService.joinGame).toHaveBeenCalledWith('game-456', 'socket-1');
            expect(socket.join).toHaveBeenCalledWith('game-456');
            expect(io.to).toHaveBeenCalledWith('game-456');
            expect(io.emit).toHaveBeenCalledWith('gameStarted', {
                gameId: 'game-456',
                players: ['p1', 'p2'],
                nextTurn: 'O'
            });
            expect(callback).toHaveBeenCalledWith({
                gameId: 'game-456',
                symbol: 'O',
                players: ['p1', 'p2']
            });
        });
    });
    describe('handleMakeMove', () => {
        it('should callback error if makeMove returns error', () => {
            // Arrange
            mockedService.makeMove.mockReturnValue({ error: 'Not your turn' });
            // Act
            (0, gameController_1.handleMakeMove)(socket, io, { gameId: 'game-789', row: 0, col: 0 }, callback);
            // Assert
            expect(mockedService.makeMove).toHaveBeenCalledWith('game-789', 'socket-1', 0, 0);
            expect(callback).toHaveBeenCalledWith({ success: false, error: 'Not your turn' });
            expect(io.to).not.toHaveBeenCalled();
        });
        it('should emit moveMade and callback success on valid move', () => {
            // Arrange
            const fakeMoveResult = {
                board: [['X', null, null], [null, null, null], [null, null, null]],
                state: 'playing',
                winner: null,
                nextTurn: 'O'
            };
            mockedService.makeMove.mockReturnValue(fakeMoveResult);
            // Act
            (0, gameController_1.handleMakeMove)(socket, io, { gameId: 'game-789', row: 0, col: 0 }, callback);
            // Assert
            expect(mockedService.makeMove).toHaveBeenCalledWith('game-789', 'socket-1', 0, 0);
            expect(io.to).toHaveBeenCalledWith('game-789');
            expect(io.emit).toHaveBeenCalledWith('moveMade', {
                board: fakeMoveResult.board,
                state: fakeMoveResult.state,
                winner: fakeMoveResult.winner,
                nextTurn: fakeMoveResult.nextTurn
            });
            expect(callback).toHaveBeenCalledWith({ success: true });
        });
    });
});
