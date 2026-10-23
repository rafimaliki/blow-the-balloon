// The hold pad, the best-score label, and the result card. Markup lives in index.html.
// Nothing here may show how much air is in the balloon: see docs/game-design.md.

export function createOverlay(doc, { onAgain }) {
  const $ = (id) => doc.getElementById(id);
  const pad = $('pad');
  const padLabel = $('pad-label');
  const best = $('best');
  const result = $('result');
  const again = $('again');

  again.addEventListener('click', onAgain);

  return {
    isResultShown: () => !result.hidden,

    setBest(cm) { best.textContent = cm ? `Best ${cm} cm` : ''; },

    // Pressed state only: says "you are blowing", never how much.
    setHolding(holding) {
      if (pad.classList.contains('holding') === holding) return; // called every frame
      pad.classList.toggle('holding', holding);
      padLabel.textContent = holding ? 'Let go to stop' : 'Hold to blow';
    },

    showResult({ score, bestScore, isNewBest, popped }) {
      $('result-title').textContent = popped ? 'Popped!' : 'Nice balloon';
      $('result-number').textContent = score;
      $('result-badge').hidden = !isNewBest;
      $('result-best').textContent = !isNewBest && bestScore ? `Personal best ${bestScore} cm` : '';
      pad.classList.add('away');
      result.hidden = false;
    },

    hideResult() {
      result.hidden = true;
      pad.classList.remove('away');
    },
  };
}
