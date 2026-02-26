export type GameMode = 'classic' | 'time';

export interface Block {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
}

export interface GameState {
  grid: (Block | null)[][];
  target: number;
  score: number;
  selectedIds: string[];
  gameOver: boolean;
  mode: GameMode;
  timeLeft?: number;
  level: number;
}

export const GRID_COLS = 6;
export const GRID_ROWS = 10;
export const INITIAL_ROWS = 4;
export const MAX_VALUE = 9;
export const TIME_LIMIT = 10; // seconds for time mode
