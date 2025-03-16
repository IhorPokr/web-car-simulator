// Class for handling UI elements and updates
export class GameUI {
    constructor() {
        this.speedElement = document.getElementById('speed');
        this.gaugeElement = document.querySelector('.gauge-fill');
        this.driftIndicator = document.getElementById('drift-indicator');
        this.selectionScreen = document.getElementById('car-selection-screen');
        this.gameUI = document.getElementById('game-ui');
        
        // Track if the game has started
        this.gameStarted = false;
    }
    
    // Set up car selection handlers
    setupSelectionHandlers(startGameCallback) {
        document.querySelectorAll('.car-option').forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                document.querySelectorAll('.car-option').forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                this.classList.add('selected');
            });
        
            const selectBtn = option.querySelector('.select-btn');
            selectBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering the option click event
                const carType = option.getAttribute('data-car-type');
                startGameCallback(carType);
            });
        });
    }
    
    // Start the game by hiding selection screen and showing game UI
    startGame() {
        this.selectionScreen.style.display = 'none';
        this.gameUI.style.display = 'block';
        this.gameStarted = true;
    }
    
    // Update UI elements based on game state
    update(velocity, maxSpeed, isDrifting) {
        if (!this.gameStarted) return;
        
        // Calculate speed in km/h, scaled based on car type
        const speedMultiplier = maxSpeed === 2.0 ? 100 : (maxSpeed === 1.5 ? 70 : 50);
        const speedKmh = Math.abs(Math.round(velocity * speedMultiplier));
        this.speedElement.textContent = speedKmh;
        
        // Update speedometer gauge
        const maxSpeedKmh = maxSpeed === 2.0 ? 200 : (maxSpeed === 1.5 ? 140 : 100);
        const gaugePercentage = Math.min(100, (speedKmh / maxSpeedKmh) * 100);
        this.gaugeElement.style.width = `${gaugePercentage}%`;
        
        // Update drift indicator
        if (isDrifting) {
            this.driftIndicator.style.opacity = '1';
        } else {
            this.driftIndicator.style.opacity = '0';
        }
    }
    
    // Method to check if game has started
    isGameStarted() {
        return this.gameStarted;
    }
    
    // Handle window resize
    handleResize(renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
} 