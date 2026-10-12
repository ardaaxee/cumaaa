export const BALL_GOAL = 10;
export interface BallGameState { phase: 'idle' | 'playing' | 'completed'; score: number }
export const idleBallGame = (): BallGameState => ({ phase: 'idle', score: 0 });
export const startBallGame = (): BallGameState => ({ phase: 'playing', score: 0 });
export function advanceBallGame(game: BallGameState): BallGameState {
  if (game.phase !== 'playing') return game;
  const score = Math.min(BALL_GOAL, game.score + 1);
  return { phase: score === BALL_GOAL ? 'completed' : 'playing', score };
}

export function ballPosition(score: number) {
  return { x: 22 + (score * 31) % 58, y: 3 + (score * 17) % 10 };
}
