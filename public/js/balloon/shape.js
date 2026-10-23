// Unit balloon profile along +Y: pointed at the neck (u = 0), widest about 60% up,
// round at the crown (u = 1). Radius 0.5 at the widest, so width 1.

export function bodyRadius(u) {
  return 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(u, 1.35)), 0.72);
}
