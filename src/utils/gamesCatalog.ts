/**
 * Interactive Web & Retro HTML5 Games Catalog
 */

export interface GameItem {
  id: string;
  title: string;
  category: 'Arcade' | 'Puzzle' | 'Sports' | 'Retro' | 'Classic';
  url: string;
  badge: string;
  description: string;
  thumbnail: string;
  controlsHint: string;
}

export const GAMES_CATALOG: GameItem[] = [
  {
    id: '2048',
    title: '2048 Number Puzzle',
    category: 'Puzzle',
    url: 'https://play2048.co',
    badge: 'Popular Puzzle',
    description: 'Join the numbers and get to the 2048 tile! Use arrow keys or WASD to slide tiles across the grid.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Arrow Keys or W, A, S, D to slide',
  },
  {
    id: 'retro-bowl',
    title: 'Retro Bowl Championship',
    category: 'Sports',
    url: 'https://game316009.hosting-games.com/retrobowl/',
    badge: '8-Bit Sports',
    description: '8-bit American Football simulator where you manage your roster and call passing plays on the field.',
    thumbnail: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Mouse Drag to throw, WASD / Arrows to dodge',
  },
  {
    id: 'pacman',
    title: 'Pacman Classic Arcade',
    category: 'Arcade',
    url: 'https://freepacman.org',
    badge: 'Retro Arcade',
    description: 'Navigate the labyrinth eating dots and fruits while evading Blinky, Pinky, Inky, and Clyde.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Arrow keys / WASD to change direction',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders 1978',
    category: 'Retro',
    url: 'https://freeinvaders.org',
    badge: 'Space Shooter',
    description: 'Defend Earth against advancing waves of descending alien spaceships from behind planetary shields.',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Left / Right to move, Space to fire cannon',
  },
  {
    id: 'snake',
    title: 'Snake Retro Classic',
    category: 'Classic',
    url: 'https://playsnake.org',
    badge: 'Nokia Classic',
    description: 'Legendary Nokia-era snake game. Eat apples to grow longer without biting your own tail.',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Arrow keys / WASD to steer snake',
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird Arcade',
    category: 'Arcade',
    url: 'https://flappybird.io',
    badge: 'Physics Arcade',
    description: 'Tap or press Space to flap wings and navigate through pipes without hitting obstacles.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Spacebar or Left Click to flap',
  },
  {
    id: 'hextris',
    title: 'Hextris Hexagonal Puzzle',
    category: 'Puzzle',
    url: 'https://hextris.io',
    badge: 'Hexagonal',
    description: 'Fast-paced puzzle inspired by Tetris played on the six sides of a rotating hexagon.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    controlsHint: 'Left / Right Arrow to rotate hexagon',
  },
];
