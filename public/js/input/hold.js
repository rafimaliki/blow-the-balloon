// Hold-to-blow from the pointer (mouse, touch, pen) on a surface, or the Space key.
// Returns isHolding() and lets the caller listen for the first press of a hold.

export function createHold(surface, { onPress } = {}) {
  let pointers = 0;
  let space = false;

  const press = () => onPress?.();

  surface.addEventListener('pointerdown', (e) => {
    surface.setPointerCapture?.(e.pointerId);
    pointers++;
    press();
  });
  const lift = () => { pointers = Math.max(0, pointers - 1); };
  surface.addEventListener('pointerup', lift);
  surface.addEventListener('pointercancel', lift);
  surface.addEventListener('contextmenu', (e) => e.preventDefault());

  addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    if (!space && !e.repeat) press();
    space = true;
  });
  addEventListener('keyup', (e) => {
    if (e.code === 'Space') space = false;
  });

  // Losing focus mid-hold (app switch, notification) counts as letting go.
  addEventListener('blur', () => { pointers = 0; space = false; });

  return { isHolding: () => pointers > 0 || space };
}
