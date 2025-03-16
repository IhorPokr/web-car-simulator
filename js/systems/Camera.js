import * as THREE from 'three';
import { CAMERA_HEIGHT, CAMERA_DISTANCE, CAMERA_SMOOTHING } from '../config/constants.js';

// Class for handling camera behavior
export class Camera {
    constructor(camera) {
        this.camera = camera;
        this.cameraPosition = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        
        // Set initial camera position and orientation
        this.camera.position.copy(this.cameraPosition);
        this.camera.lookAt(this.cameraTarget);
    }
    
    // Update camera position and orientation based on car position and velocity
    update(car, velocity) {
        if (!car) return;
        
        // Calculate ideal camera position based on car position and rotation
        // Position camera behind the car
        const idealOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
        idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), car.getRotation());
        const idealPosition = new THREE.Vector3().copy(car.getPosition()).add(idealOffset);
        
        // Smoothly interpolate current camera position to ideal position
        this.cameraPosition.lerp(idealPosition, CAMERA_SMOOTHING);
        this.camera.position.copy(this.cameraPosition);
        
        // Calculate ideal look target (slightly ahead of car)
        const lookAheadDistance = Math.max(1, Math.abs(velocity) * 3);
        const lookDirection = new THREE.Vector3(0, 0, -lookAheadDistance).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.getRotation());
        const idealTarget = new THREE.Vector3().copy(car.getPosition()).add(lookDirection).add(new THREE.Vector3(0, 0.5, 0));
        
        // Smoothly interpolate camera target
        this.cameraTarget.lerp(idealTarget, CAMERA_SMOOTHING);
        
        // Make camera look at target
        this.camera.lookAt(this.cameraTarget);
    }
    
    // Handle window resize
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
    
    // Return camera reference
    getCamera() {
        return this.camera;
    }
} 