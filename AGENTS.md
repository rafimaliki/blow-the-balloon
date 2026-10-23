# Blow the Balloon

A one-button browser game: from a first-person view you blow up a realistic 3D balloon, holding to blow
and releasing to stop, and the score is how big it got — unless it popped.

Static site, no build step, Three.js from a pinned CDN import map. Must play on a phone.

```
python -m http.server 8000 -d public     # then open http://localhost:8000
node --test                              # pure-logic checks (Node's built-in runner)
```

## Hard constraints

- **No build step, no npm runtime dependencies** — `public/` is deployed to GitHub Pages as-is, so what is
  in the repo is exactly what ships. A bundler would add a second source of truth.
- **Three.js is loaded through the import map in `index.html`, pinned to an exact version** — a floating
  `latest` URL can break the game with no commit in this repo.
- **ES modules need HTTP** — the game does not run from `file://`; always test through a local server.
- **No size/air/time indicator while blowing** — the balloon itself is the only feedback. This is the
  game: an on-screen meter would remove the risk. See `docs/game-design.md`.
- **Mobile is a first-class target** — input is Pointer Events (one code path for mouse and touch), the
  page blocks scroll, zoom, text selection and the long-press menu, and the scene must hold a steady
  frame rate on a mid-range phone. Anything heavy (shadows, post-processing, big textures) gets a mobile
  fallback or does not go in.
- **Scores live only in `localStorage`** — no backend, no network calls besides the CDN.

## Layout

```
public/                 deployed as-is; nothing outside it ships
  index.html            canvas, overlay markup, import map
  css/                  overlay and page styles
  js/
    main.js             entry: wires modules together, owns the frame loop, no game logic
    scene/              renderer, camera, lighting, environment, the first-person face/hands rig
    balloon/            balloon mesh, material, inflation deformation, pop effect
    game/               round state machine, burst rule, scoring (pure, no DOM, no Three.js)
    input/              hold-to-blow from pointer + keyboard
    audio/              synthesised breath and pop (Web Audio, no sound files)
    ui/                 result overlay, high score display
    storage/            localStorage read/write for scores
  assets/               models, textures, sounds (compressed; keep each file small)
test/                   mirrors public/js; `node --test` finds every *.test.js
docs/                   design notes (see Docs)
```

Grouped by what each part is for. `game/` is kept free of DOM and Three.js so its rules can be tested in
Node.

## Code rules

- **karpathy-guidelines** — surgical diffs, no speculative scope, state assumptions, leave a
  verifiable check.
- **ponytail (full)** — laziest thing that works. Mark shortcuts `// ponytail: <ceiling>, <upgrade path>`.
- **caveman (ultra)** — chat prose only. Code, comments, commits, and docs stay normal clear English.
- No design-system skill. The visual reference is https://softserve.nog.cc/: cream paper, deep green
  ink, soft matte toy-like 3D (not photoreal), a result card with chunky pressable buttons. Unlike the
  reference, nothing covers the balloon while blowing: no pad panel, no live counter. Colours are tokens at the top of `css/style.css`; reuse them rather than adding new
  ones. Use `/impeccable` if the UI grows beyond the hint and the result card.
- One responsibility per file. 300-line soft ceiling, 500 hard (tests and assets excluded) — past it,
  split along a seam, not at a line count. Watch `main.js` and the scene setup: they are the obvious
  home for every new thing.
- SOLID, read as: one reason to change per module; extend by adding rather than by editing a switch;
  depend on the narrowest interface that does the job (e.g. the game takes `isHolding()`, not the
  input module).
- Tunable numbers (inflation rate, burst range, score scale) live together in one constants object in
  `game/`, named, with units in the name or a comment — they will be tuned by feel.

## How changes land

**Nothing is written to the default branch directly.** Every change, a feature, a fix, a doc line, arrives as a
branch and a pull request and is squash-merged: one commit per change on the default branch, its subject ending in
the PR number, `feat(scope): description (#N)`. The branch is deleted on merge.

- Branch `<type>/<feature-name>`; commits `<type>: <description>`, lowercase imperative, no attribution trailer.
- One change, one branch. A follow-up joins the open PR's branch; an unrelated change starts its own.
- A PR body carries **what**, **why** and a **test plan** that says what was run and observed, and what could not be run.
- Merge only with the person's go-ahead. Squash only, never a force push, never leave the default branch red.

## Skills

`/feat` for feature work, `/git` for every git/gh operation. Both are repo-agnostic;
conventions here win over their defaults.

## Docs

| File | Read when |
|---|---|
| `docs/game-design.md` | Touching input, inflation, the burst rule, scoring, high scores, or anything shown on screen |

## Definition of done

- The change landed on a branch and merged by pull request; the default branch was never written to directly.
- `node --test` passes.
- Served by `python -m http.server 8000 -d public`, the game loads with a clean console and a full round
  works: hold → balloon grows → release → score shown; and hold too long → pop → score 0.
- Checked in a phone-sized viewport with touch emulation: hold-to-blow works, the page does not scroll,
  zoom, select text or open a long-press menu.
- Nothing on screen reveals size, air or time while blowing.
- No file over the ceiling without a note in this list saying why.
