# Airport Dash

## Game objectives
The user is an airline ticket officer/check in agent. They have to navigate the airport, which is going to be 3 lanes. They have to avoid any obstacles and deliver tickets to passengers as they are going past in the 4th lane.

## Game mechanics/rules
User controlled character can go across 3 lanes avoiding obstacles using smooth lane transitions. In the 4th lane there are passengers going by scattered about randomly. The aim is to throw the tickets to the passengers in the 4th lane from any lane. You have to be roughly in line with the passenger when throwing it for it to reach them (small margin of error). It is based on the popular 1980s game paper boy. The sprite for the check in agent is in file checkin-agent.png

## Game architecture
All logic and assets should run in the browser. There should only be a frontend and no backend or database etc. The game should be in the style of an 8 bit game.

**Technology Stack**: HTML5 Canvas with vanilla JavaScript
- Simple, lightweight, no dependencies
- Perfect for 8-bit style games
- Full control over rendering and game loop
- Runs entirely in browser

## Assets Required
- **checkin-agent.png** - Player sprite (existing)
- **Obstacles**: Luggage carts, cleaning carts, food trolleys (to be created as 8-bit sprites)
- **Passengers**: Standing passengers waiting for tickets (to be created as 8-bit sprites)
- **Ticket**: Small paper ticket sprite with throw animation (to be created)
- **Background**: Airport terminal lanes with runway-style markings (to be created)
- **Sounds**: 
  - Ticket delivery success sound
  - Obstacle collision sound
  - Background ambient music (optional)

## Game Screens
1. **Start Screen**: Title "Airport Dash" with "Press SPACE to Start" button
2. **Game Screen**: Main gameplay with HUD showing score, lives, and timer
3. **Game Over Screen**: Final score display with "Play Again" button

## Movement Mechanics
- **Lane Switching**: Smooth transitions between lanes (not instant snap)
- **Player Speed**: Base speed that player can control
- **Obstacles**: Appear in all 3 lanes randomly, moving at varying speeds but never faster than player's maximum speed
- **Throwing**: Ticket projectile travels horizontally to 4th lane with small margin of error for alignment (~20 pixels tolerance)

## Game Dimensions
- Canvas: 800x600 pixels
- 4 lanes: Each 100 pixels wide
- Player lanes: Lanes 1-3 (left side)
- Passenger lane: Lane 4 (right side)
- Sprites: 32x32 pixels (8-bit style)

## Spawn Logic
- **Passengers**: Spawn every 3-5 seconds randomly in lane 4
- **Obstacles**: Spawn every 1-3 seconds randomly across lanes 1-3
- Spawn rates increase with difficulty progression

## Collision Detection
- Hitbox: 80% of sprite size for forgiving gameplay
- Collision with obstacles: Lose 1 life, brief invincibility period (1 second)
- Successful ticket delivery: Hit detection with margin of error

## UI Elements
- **Top Bar**: 
  - Score (top left)
  - Lives (top center, shown as hearts/icons)
  - Timer showing next difficulty increase (top right)
- **Start Screen**: Game title and instructions
- **Game Over Screen**: Final score and "Press SPACE to Play Again"

## Feedback
You get a score per ticket delivered (+10 points). There are infinite tickets. Everytime a ticket is delivered there is a sound, and everytime an obstacle is hit there will be a sound.

## Challenge
Every 30 seconds the game gets faster and faster making it harder:
- Obstacle spawn rate increases
- Obstacle movement speed increases (but never exceeds player max speed)
- Passenger spawn rate increases
They have 3 lives and everytime they hit an obstacle they lose a life. When all lives are lost, game over screen appears.

## Interaction
- **Arrow Keys**: Move player up/down between lanes (smooth transitions)
- **Space Bar**: Throw ticket / Start game / Play again
- **Lane Movement**: Animated transition taking ~0.3 seconds