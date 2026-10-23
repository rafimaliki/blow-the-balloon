// High score in localStorage. Storage can be missing or throw (private mode, blocked
// site data); the game must keep working, it just forgets the best score.

const KEY = 'blow-the-balloon.best';

export function loadBest(storage) {
  try {
    const n = Number(storage?.getItem(KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

// Saves score if it beats the stored best. Returns true when it is a new best.
export function recordScore(storage, score) {
  if (score <= loadBest(storage)) return false;
  try {
    storage?.setItem(KEY, String(score));
  } catch {
    // Still a new best for this session; it just won't be remembered.
  }
  return true;
}
