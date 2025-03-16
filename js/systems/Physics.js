import * as THREE from 'three';
import { GROUND_SIZE } from '../config/constants.js';

// Class for handling car physics
export class Physics {
    constructor(car, carSettings) {
        this.car = car;
        this.carSettings = carSettings;
        
        // Physics state
        this.velocity = 0;
        this.acceleration = 0;
        this.steering = 0;
        this.wheelRotation = 0;
        this.engineForce = 0;
        this.brakeForce = 0;
        this.lateralForce = 0;
        this.drifting = false;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: false
        };
    }
    
    // Update physics state based on inputs and time
    update() {
        this.calculateEngineForce();
        this.calculateSteering();
        this.applyPhysics();
        this.updateWheels();
        this.checkForDrifting();
        this.checkBoundaries();
        this.updateExhaustEffects();
    }
    
    calculateEngineForce() {
        // Calculate engine force based on input
        if (this.keys.forward) {
            this.engineForce = this.carSettings.accelerationRate;
        } else if (this.keys.backward) {
            this.engineForce = -this.carSettings.accelerationRate;
        } else {
            this.engineForce = 0;
        }
        
        // Apply braking
        if (this.keys.brake) {
            this.brakeForce = this.carSettings.brakePower;
            this.car.setBrakeLight(2); // Turn on brake light
        } else {
            this.brakeForce = 1;
            this.car.setBrakeLight(0); // Turn off brake light
        }
    }
    
    calculateSteering() {
        // Apply steering with speed-dependent reduction
        const speedFactor = Math.max(0, 1 - (Math.abs(this.velocity) / this.carSettings.maxSpeed) * this.carSettings.turnSpeedDecay);
        
        if (this.keys.left) {
            this.steering = this.carSettings.turnSpeed * speedFactor;
        } else if (this.keys.right) {
            this.steering = -this.carSettings.turnSpeed * speedFactor;
        } else {
            // Gradually return steering to center
            this.steering *= 0.8;
        }
        
        // Apply steering to car wheels for visual effect
        this.car.steer(this.steering);
    }
    
    applyPhysics() {
        // Apply engine force to velocity with limits
        this.velocity += this.engineForce;
        
        // Apply braking
        this.velocity *= this.brakeForce;
        
        // Apply natural friction and drag
        this.velocity *= this.carSettings.friction;
        this.velocity *= this.carSettings.drag;
        
        // Apply speed limits
        if (this.velocity > this.carSettings.maxSpeed) {
            this.velocity = this.carSettings.maxSpeed;
        } else if (this.velocity < -this.carSettings.maxReverseSpeed) {
            this.velocity = -this.carSettings.maxReverseSpeed;
        }
        
        // Rotate car based on steering and velocity
        if (Math.abs(this.velocity) > 0.01) {
            // Calculate steering effect based on velocity direction
            const steeringEffect = this.steering * Math.sign(this.velocity);
            this.car.rotateBy(steeringEffect);
            
            // Move car forward/backward - using positive Z as forward with the new orientation
            const direction = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.car.getRotation());
            const position = this.car.getPosition();
            position.add(direction.multiplyScalar(this.velocity));
            this.car.setPosition(position.x, position.y, position.z);
        }
    }
    
    updateWheels() {
        // Rotate wheels based on velocity
        const wheelRotation = this.velocity * 0.3;
        this.wheelRotation += wheelRotation;
        
        // Apply wheel rotation to car wheels
        this.car.rotateWheels(wheelRotation);
    }
    
    checkForDrifting() {
        // Check for drifting (high speed + sharp turn)
        this.drifting = Math.abs(this.velocity) > this.carSettings.maxSpeed * 0.7 && Math.abs(this.steering) > this.carSettings.turnSpeed * 0.7;
        
        // Add lateral force during drifting
        if (this.drifting) {
            // Create a slight sideways movement during drift
            const lateralDirection = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.car.getRotation());
            const position = this.car.getPosition();
            position.add(lateralDirection.multiplyScalar(this.steering * 0.1));
            this.car.setPosition(position.x, position.y, position.z);
        }
    }
    
    checkBoundaries() {
        // Keep car on the ground
        const position = this.car.getPosition();
        position.y = 0;
        
        // Boundary check to keep car within ground
        const halfGroundSize = GROUND_SIZE / 2;
        position.x = Math.max(-halfGroundSize, Math.min(halfGroundSize, position.x));
        position.z = Math.max(-halfGroundSize, Math.min(halfGroundSize, position.z));
        
        this.car.setPosition(position.x, position.y, position.z);
    }
    
    updateExhaustEffects() {
        // Create exhaust particles when accelerating
        if (Math.abs(this.engineForce) > 0 && Math.random() > 0.9) {
            this.car.createExhaustParticle();
        }
        
        // Create exhaust particles during drifting
        if (this.drifting) {
            this.car.createExhaustParticle();
        }
        
        // Update existing exhaust particles
        this.car.updateExhaustParticles();
    }
    
    // Input handling methods
    setKey(key, value) {
        switch(key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = value;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = value;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = value;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = value;
                break;
            case ' ':
                this.keys.brake = value;
                break;
        }
    }
    
    // Getters for UI
    getVelocity() {
        return this.velocity;
    }
    
    isDrifting() {
        return this.drifting;
    }
} 