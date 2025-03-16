# 3D Car Simulator

A 3D car simulator built with Three.js that features a car selection screen, realistic physics, and an immersive environment.

## Features

- Car selection with three different car types (Standard, Sport, and Supercar)
- Realistic driving physics with drifting mechanics
- Interactive environment with a main road, circular track, trees, and buildings
- Speedometer and drift indicator UI
- Modular code architecture for easy maintenance and extension

## Installation and Setup

1. Clone the repository or download the source code
2. Start a local server to run the application:

```bash
# Using Python 3
python -m http.server

# Using Node.js (with http-server package)
npx http-server
```

3. Open your browser and navigate to `http://localhost:8000`

## Controls

- **W/Up Arrow**: Accelerate
- **S/Down Arrow**: Brake/Reverse
- **A/Left Arrow**: Turn left
- **D/Right Arrow**: Turn right
- **Space**: Handbrake

## Project Structure

The project follows a modular architecture for better organization and maintainability:

```
/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── js/
│   ├── main.js         # Application entry point
│   ├── config/
│   │   └── constants.js # Game constants and configuration
│   ├── models/
│   │   ├── Car.js       # Car model and creation
│   │   └── Environment.js # Environment creation (ground, roads, trees, buildings)
│   ├── systems/
│   │   ├── Physics.js   # Car physics calculations
│   │   ├── Camera.js    # Camera behavior
│   │   └── Input.js     # Input handling
│   ├── ui/
│   │   └── GameUI.js    # UI management
│   └── utils/
│       └── Lighting.js  # Lighting setup
```

## Car Types

- **Standard Car**:
  - Balanced handling
  - Moderate top speed (100 km/h)
  - Good for beginners

- **Sport Car**:
  - Higher top speed (140 km/h)
  - Better acceleration
  - Good balance of speed and handling

- **Supercar**:
  - Maximum speed (200 km/h)
  - Extremely fast acceleration
  - More challenging to control

## Technical Details

- Built with Three.js
- Fully modularized code structure using ES6 modules
- Classes for each major system for better encapsulation
- Custom physics system for realistic car movement
- Adaptive camera that follows the car smoothly
- Dynamic lighting with shadows

## Future Enhancements

- More car models and types
- Additional environments and tracks
- Improved physics with collision detection
- Day/night cycle
- Multiplayer support

## Credits

- Three.js: https://threejs.org/
- Developed by: [Your Name]

## License

MIT License 