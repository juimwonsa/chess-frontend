export interface Player {
  username: string;
  result: string;
}

export interface Game {
  _id: string;
  white: Player;
  black: Player;
  end_time: number;
  pgn: string;
}

export interface AnalysisMove {
  move_number: number;
  turn: string;
  move: string;
  eval: number;
  diff: number;
  is_blunder: boolean;
}

export interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: AnalysisMove;
}
