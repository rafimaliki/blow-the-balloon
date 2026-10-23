// The hint before blowing and the result screen after. Markup lives in index.html.

export function createOverlay(doc, { onAgain }) {
  const hint = doc.getElementById('hint');
  const result = doc.getElementById('result');
  const title = doc.getElementById('result-title');
  const scoreEl = doc.getElementById('result-score');
  const best = doc.getElementById('result-best');
  const again = doc.getElementById('again');

  again.addEventListener('click', onAgain);

  return {
    isResultShown: () => !result.hidden,

    showHint() { hint.classList.remove('gone'); },
    hideHint() { hint.classList.add('gone'); },

    showResult({ score, bestScore, isNewBest, popped }) {
      title.textContent = popped ? 'Pop!' : isNewBest ? 'New best' : 'Your balloon';
      scoreEl.innerHTML = `${score}<small>cm</small>`;
      best.textContent = isNewBest ? 'Biggest one yet' : bestScore ? `Best ${bestScore} cm` : '';
      best.classList.toggle('new', isNewBest);
      result.hidden = false;
      again.focus({ preventScroll: true });
    },

    hideResult() { result.hidden = true; },
  };
}
