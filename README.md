# Airport Dash (team-12)

Quick start

- Open a terminal and serve the folder on a local web server (recommended):

```powershell
cd "C:\Dev\IAGAI\ENGFEST\team-12"
python -m http.server 5500
```

- Open the game in your browser: http://localhost:5500

How to Play

- Objective: Move across the 3 lanes, avoid obstacles, and throw tickets to passengers in the far (4th) lane.
- Controls:
  - Left / Right arrows: switch lanes (smooth transition)
  - Space: throw a ticket / Start / Play again
- Scoring: +10 points per successful ticket delivery. Infinite tickets.
- Lives: You have 3 lives; colliding with an obstacle loses one life.
- Difficulty: Every 30 seconds obstacle spawn rate increases.

Notes

- The game uses in-browser audio. If the background MIDI doesn't play automatically, click or press a key on the page first to allow audio playback.
- All assets are stored locally in the `team-12` folder.

Files of interest

- `index.html` - main page
- `game.js` - game logic
- `style.css` - styles
- `checkin-agent.png`, `passenger-man.png`, `passenger-woman.png`, `suitcase-obstacle.png` - sprites
- `Delibes _ Lakme, Flower Duet (redone).mid` - background music

If you'd like, I can convert the MIDI to a browser-friendly audio format (OGG/MP3) and wire it up automatically.
