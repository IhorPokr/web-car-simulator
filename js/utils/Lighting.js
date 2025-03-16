import * as THREE from 'three';

// Class for setting up and managing scene lighting
export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.setupAmbientLight();
        this.setupDirectionalLight();
    }
    
    // Set up ambient light for general illumination
    setupAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
    }
    
    // Set up directional light for shadows and directional illumination
    setupDirectionalLight() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        
        // Configure shadow properties for better quality shadows
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        
        this.scene.add(directionalLight);
        this.directionalLight = directionalLight;
    }
    
    // Add a spotlight at a specific position with specific properties
    addSpotlight(position, target, color = 0xffffff, intensity = 1, angle = Math.PI / 6, distance = 30) {
        const spotlight = new THREE.SpotLight(color, intensity);
        spotlight.position.copy(position);
        spotlight.angle = angle;
        spotlight.penumbra = 0.2;
        spotlight.distance = distance;
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 512;
        spotlight.shadow.mapSize.height = 512;
        
        this.scene.add(spotlight);
        
        if (target) {
            spotlight.target.position.copy(target);
            this.scene.add(spotlight.target);
        }
        
        return spotlight;
    }
    
    // Update lights based on time of day or other parameters
    update(timeOfDay) {
        // This could be expanded to handle day/night cycle or other lighting changes
    }
} 