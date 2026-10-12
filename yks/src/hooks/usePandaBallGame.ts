import { useRef, useState } from 'react';
import { advanceBallGame, BALL_GOAL, idleBallGame, startBallGame, type BallGameState } from '../utils/pandaBallGame';

function loadHighScore() {
  try {
    const value = Number(localStorage.getItem('iyikiPanda.ballHigh'));
    return Number.isFinite(value) ? Math.max(0, Math.min(BALL_GOAL, Math.floor(value))) : 0;
  } catch { return 0; }
}

export function usePandaBallGame() {
  const [game, setGame] = useState(idleBallGame);
  const current = useRef(game);
  const [highScore, setHighScore] = useState(loadHighScore);
  const best = useRef(highScore);
  const commit = (next: BallGameState) => { current.current = next; setGame(next); };

  return {
    ...game,
    highScore,
    start: () => commit(startBallGame()),
    stop: () => { if (current.current.phase !== 'idle') commit(idleBallGame()); },
    hit: () => {
      const next = advanceBallGame(current.current);
      if (next === current.current) return null;
      commit(next);
      if (next.score > best.current) {
        best.current = next.score;
        setHighScore(next.score);
        try { localStorage.setItem('iyikiPanda.ballHigh', String(next.score)); } catch { /* Session remains playable. */ }
      }
      return next;
    },
  };
}
