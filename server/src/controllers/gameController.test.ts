import { Server, Socket } from 'socket.io';
import {
  handleCreateGame,
  handleJoinGame,
  handleMakeMove
} from './gameController';
import GameService from '../services/gameService';

// Mock GameService
jest.mock('../services/gameService');
const mockedService = GameService as jest.Mocked<typeof GameService>;

describe('gameController', () => {
  let socket: Partial<Socket>;
  let io: Partial<Server>;
  let callback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    socket = { id: 'socket-1', join: jest.fn() };
    io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    callback = jest.fn();
  });

  describe('handleCreateGame', () => {
    it('creates a game and returns gameId and symbol', () => {
      const fakeGame: any = { id: 'game-123', nextTurn: 'X' };
      mockedService.createGame.mockReturnValue(fakeGame);

      handleCreateGame(socket as Socket, callback);

      expect(mockedService.createGame).toHaveBeenCalledWith('socket-1');
      expect(socket.join).toHaveBeenCalledWith('game-123');
      expect(callback).toHaveBeenCalledWith({ gameId: 'game-123', symbol: 'X' });
    });
  });

  describe('handleJoinGame', () => {
    it('returns error on invalid input', () => {
      handleJoinGame(socket as Socket, io as Server, { gameId: 'not-a-uuid' }, callback);
      expect(mockedService.joinGame).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ error: 'Invalid input format' });
    });

    it('returns error when GameService returns error', () => {
      mockedService.joinGame.mockReturnValue({ error: 'Game not found' } as any);
      handleJoinGame(socket as Socket, io as Server, { gameId: '00000000-0000-0000-0000-000000000000' }, callback);
      expect(mockedService.joinGame).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ error: 'Game not found' });
    });

    it('joins a valid game', () => {
      const fakeResult: any = {
        game: { id: 'game-456', players: [{ id: 'p1' }, { id: 'p2' }], nextTurn: 'O' },
        symbol: 'O'
      };
      mockedService.joinGame.mockReturnValue(fakeResult);

      handleJoinGame(socket as Socket, io as Server, { gameId: '00000000-0000-0000-0000-000000000000' }, callback);

      expect(mockedService.joinGame).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000', 'socket-1');
      expect(socket.join).toHaveBeenCalledWith('game-456');
      expect(io.to).toHaveBeenCalledWith('game-456');
      expect(io.emit).toHaveBeenCalledWith('gameStarted', {
        gameId: 'game-456',
        players: ['p1', 'p2'],
        nextTurn: 'O'
      });
      expect(callback).toHaveBeenCalledWith({
        gameId: 'game-456', symbol: 'O', players: ['p1', 'p2']
      });
    });
  });

  describe('handleMakeMove', () => {
    it('returns error on invalid input', () => {
      handleMakeMove(socket as Socket, io as Server, { gameId: 'bad', row: 5, col: 5 }, callback);
      expect(mockedService.makeMove).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ success: false, error: 'Invalid input format' });
    });

    it('returns error when GameService returns error', () => {
      mockedService.makeMove.mockReturnValue({ error: 'Not your turn' } as any);
      const data = { gameId: '00000000-0000-0000-0000-000000000000', row: 0, col: 0 };
      handleMakeMove(socket as Socket, io as Server, data, callback);
      expect(mockedService.makeMove).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000', 'socket-1', 0, 0);
      expect(callback).toHaveBeenCalledWith({ success: false, error: 'Not your turn' });
      expect(io.emit).not.toHaveBeenCalled();
    });

    it('emits moveMade on successful move', () => {
      const fakeBoard = [['X', null, null],[null,null,null],[null,null,null]];
      const fakeResult: any = { board: fakeBoard, state: 'playing', winner: null, nextTurn: 'O' };
      mockedService.makeMove.mockReturnValue(fakeResult);
      const data = { gameId: '00000000-0000-0000-0000-000000000000', row: 0, col: 0 };

      handleMakeMove(socket as Socket, io as Server, data, callback);
      expect(mockedService.makeMove).toHaveBeenCalled();
      expect(io.emit).toHaveBeenCalledWith('moveMade', fakeResult);
      expect(callback).toHaveBeenCalledWith({ success: true });
    });
  });
});
