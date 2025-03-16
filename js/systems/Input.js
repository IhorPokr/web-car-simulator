// Class for handling input events
export class Input {
    constructor(physics, camera, ui, renderer) {
        this.physics = physics;
        this.camera = camera;
        this.ui = ui;
        this.renderer = renderer;
        
        // Setup input event listeners
        this.setupKeyboardControls();
        this.setupWindowResize();
    }
    
    // Set up keyboard event listeners
    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.ui.isGameStarted()) return; // Only process inputs when game has started
            this.physics.setKey(e.key, true);
        });
        
        window.addEventListener('keyup', (e) => {
            if (!this.ui.isGameStarted()) return; // Only process inputs when game has started
            this.physics.setKey(e.key, false);
        });
    }
    
    // Set up window resize handler
    setupWindowResize() {
        window.addEventListener('resize', () => {
            this.camera.handleResize();
            this.ui.handleResize(this.renderer);
        });
    }
    
    // For touch controls (can be expanded in the future)
    setupTouchControls() {
        // Implementation for touch controls if needed
    }
} 