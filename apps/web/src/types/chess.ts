import { Square } from 'chess.js';

export interface PieceDropHandlerArgs {
  piece: string;
  sourceSquare: Square;
  targetSquare: Square | null;
}

export interface SquareHandlerArgs {
  square: Square;
  piece: string | undefined;
}

export interface EvaluationData {
  score: string;
  bestMove: string;
  arrows: any[];
  depth: number;
}

export interface GameHistoryItem {
  san: string;
  fen: string;
  moveIndex: number;
}

export type Platform = 'lichess' | 'chesscom';

export interface UserAuth {
  platform: Platform;
  username: string;
  accessToken?: string;
}
