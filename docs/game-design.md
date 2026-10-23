Scope: what the game is and the rules it must keep. Read before changing input, inflation, bursting, scoring, or anything on screen.

# Game design

## Premise

You are the person blowing the balloon. The camera is at their eyes, looking down the line of the
balloon held at their mouth, so the balloon grows toward and across the view. The goal is the biggest
balloon you dare: stop too early and the score is small, go too far and it pops.

## One round

1. **Ready** — the balloon is limp at the mouth. A short hint says to hold (press and hold the screen, the
   mouse button, or Space). The hint disappears once blowing starts.
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

## Open decisions

These are not settled; whoever builds the relevant part decides and records it here.

- The score unit (centimetres of diameter, litres, or plain points).
- The burst range and whether inflation slows as the balloon nears its limit.
- Warning cues near the limit (creaking sound, surface strain) — allowed, because they are part of the
  balloon, not an indicator. A numeric or bar warning is not.
- Sound for blowing and popping, and haptics (`navigator.vibrate`) on pop.
