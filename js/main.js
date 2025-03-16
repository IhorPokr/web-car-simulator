import * as THREE from 'three';
import { CAR_TYPES } from './config/constants.js';
import { Car } from './models/Car.js';
import { Environment } from './models/Environment.js';
import { Physics } from './systems/Physics.js';
import { Camera } from './systems/Camera.js';
import { Input } from './systems/Input.js';
import { GameUI } from './ui/GameUI.js';
import { Lighting } from './utils/Lighting.js';

// Main Game class
class Game {
    constructor() {
        // Game state
        this.car = null;
        this.physics = null;
        this.selectedCarType = "standard";
        this.carSettings = CAR_TYPES.standard;
        
        // Initialize Three.js scene
        this.initScene();
        this.initEnvironment();
        this.initUI();
        this.initInput();
        
        // Start the game loop
        this.animate();
    }
    
    // Initialize the Three.js scene, camera, and renderer
    initScene() {
        // Create scene with sky background and fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
        
        // Set up camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraSystem = new Camera(camera);
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('game'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set up lighting
        this.lighting = new Lighting(this.scene);
    }
    
    // Initialize environment objects
    initEnvironment() {
        this.environment = new Environment(this.scene);
    }
    
    // Initialize UI and event listeners
    initUI() {
        this.ui = new GameUI();
        this.ui.setupSelectionHandlers((carType) => this.startGame(carType));
    }
    
    // Initialize input handling
    initInput() {
        // Input will be fully initialized after physics is created when the game starts
    }
    
    // Start the game with selected car type
    startGame(carType) {
        // Set selected car type
        this.selectedCarType = carType;
        this.carSettings = CAR_TYPES[carType];
        
        // Show game UI
        this.ui.startGame();
        
        // Create car with selected type
        this.car = new Car(this.scene, this.carSettings);
        
        // Position the car at the start of the road
        this.car.setPosition(0, 0, -500 + 20);
        
        // Set up physics with the car
        this.physics = new Physics(this.car, this.carSettings);
        
        // Now that physics is initialized, set up input handling
        this.input = new Input(this.physics, this.cameraSystem, this.ui, this.renderer);
    }
    
    // Game loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update game systems if game has started
        if (this.ui.isGameStarted() && this.physics) {
            // Update physics
            this.physics.update();
            
            // Update camera
            this.cameraSystem.update(this.car, this.physics.getVelocity());
            
            // Update UI
            this.ui.update(
                this.physics.getVelocity(), 
                this.carSettings.maxSpeed, 
                this.physics.isDrifting()
            );
        }
        
        // Render scene
        this.renderer.render(this.scene, this.cameraSystem.getCamera());
    }
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    new Game();
}); 