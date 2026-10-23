// The hold pad, the best-score label, and the result card. Markup lives in index.html.
// Nothing here may show how much air is in the balloon: see docs/game-design.md.

const litres = (n) => n.toFixed(1);

export function createOverlay(doc, { onAgain }) {
  const $ = (id) => doc.getElementById(id);
  const pad = $('pad');
  const best = $('best');
  const result = $('result');
  const again = $('again');

  again.addEventListener('click', onAgain);

  return {
    isResultShown: () => !result.hidden,

    setBest(l) { best.textContent = l ? `Best ${litres(l)} L` : ''; },

    // The hint hides while blowing; it never says how much air is in.
    setHolding(holding) {
      pad.classList.toggle('holding', holding);
    },

    showResult({ score, bestScore, isNewBest, popped }) {
      $('result-title').textContent = popped ? 'Popped!' : 'Nice balloon';
      $('result-number').textContent = litres(score);
      $('result-badge').hidden = !isNewBest;
      $('result-best').textContent = !isNewBest && bestScore ? `Personal best ${litres(bestScore)} L` : '';
      pad.classList.add('away');
      result.hidden = false;
    },

    hideResult() {
      result.hidden = true;
      pad.classList.remove('away');
    },
  };
}
