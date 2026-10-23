Scope: what the game is and the rules it must keep. Read before changing input, inflation, bursting, scoring, or anything on screen.

# Game design

## Premise

You are the person blowing the balloon. The camera looks from behind and above the player along the
balloon, which points away from you: the neck and its rolled lip are nearest, the body grows away into
the view. The camera sits just far enough back that the largest balloon the game allows still fits the
screen, so the balloon fills the frame as it grows instead of spilling out of it. The goal is the biggest
balloon you dare: stop too early and the score is small, go too far and it pops.

## One round

1. **Ready** — the balloon is empty: a flat, limp strip of rubber at the lips, holding no air at all. A
   small floating hint says to hold (press and hold anywhere, the mouse button, or Space). It fades out
   while blowing so nothing covers the balloon; the whole balloon, neck included, stays in frame.
2. **Blowing** — while held, the balloon inflates. Nothing on screen measures it: no meter, no number, no
   timer. The balloon's look is the only feedback, so its growth, stretch and sheen must read clearly.
3. **Release** — letting go ends the round. There is one breath per round; holding again does not resume.
4. **Result** — the score is shown with the high score, and a way to play again.

If the balloon reaches its burst point while held, it pops, the round ends at once, and the score is 0.

## Rules

- **Burst point is hidden and varies per round**, drawn at random within a range, so the player cannot
  memorise a safe hold time. It is never shown, not even after the round.
- **Score is the balloon's size at release**, expressed as a number a player can compare between
  rounds. A popped balloon scores 0.
- **High score** is the best score so far, kept in `localStorage`. A new high score is called out on the
  result screen. Storage being unavailable (private mode, blocked) must not break the game; it just means
  no high score is remembered.

## Decided

Numbers live in `TUNING` in `public/js/game/round.js`.

- **Score is the volume of air in litres**, to one decimal — the breath you put in. Volume climbs
  steeply while diameter slows down, so a bigger risk pays off visibly: about 33 L at the smallest burst
  point, about 51 L at the largest. The burst point itself is still set by diameter (how far the rubber
  stretches). The best score is stored under a litres-specific key, so bests from the old cm scoring
  do not carry over.
- **Air goes in at a steady rate, in gentle puffs; size follows volume.** Diameter grows with the cube
  root of volume, so the balloon visibly slows as it gets big, without any special rule.
- **Burst diameter is uniform between 40 and 46 cm**: the same balloon every round, with the small
  variation real latex has. The cap is learnable, but the edge is never exactly the same.
  Reaching it takes roughly 7–11 seconds of blowing.
- **The rubber lightens and gets glossier as it stretches.** This follows the balloon's size, not its
  distance from the burst point, so it reads like real latex without giving the answer away.
- **Sound is synthesised**: a breathy hiss that follows the puffs, and a pop. The phone vibrates on pop
  where supported.

## Open decisions

Whoever builds the relevant part decides and records it above.

- Further warning cues near the limit (creaking, visible strain lines) — allowed, because they are part
  of the balloon, not an indicator. A numeric or bar warning is not.
- Hands holding the neck in view.
