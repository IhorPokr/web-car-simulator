import * as THREE from 'three';
import { CAR_TYPES } from '../config/constants.js';

// Car class that handles all car-related functionality
export class Car {
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;
        this.group = null;
        this.wheels = {
            frontLeft: null,
            frontRight: null,
            rearLeft: null,
            rearRight: null
        };
        this.brakeLight = null;
        this.exhaustParticles = [];
        
        this.createCar();
    }
    
    createCar() {
        // Create car group
        this.group = new THREE.Group();
        this.group.rotation.y = Math.PI; // Face away from camera initially
        this.scene.add(this.group);
        
        this.createCarBody();
        this.createWheels();
        this.createLights();
        this.createExhaustSystem();
        this.createExtraDetails();
    }
    
    createCarBody() {
        // Create a metallic material with high gloss for car body
        const createCarPaintMaterial = (color) => {
            return new THREE.MeshStandardMaterial({ 
                color: color,
                metalness: 0.7,
                roughness: 0.2,
                envMapIntensity: 1.0
            });
        };

        // Main body (chassis) - with curved edges
        const chassisGeometry = new THREE.BoxGeometry(2, 0.5, 4.5);
        const chassisMaterial = createCarPaintMaterial(this.settings.color);
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.6;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.group.add(chassis);

        // Side skirts for a sportier look
        const skirtGeometry = new THREE.BoxGeometry(0.1, 0.2, 3.5);
        const skirtMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const leftSkirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
        leftSkirt.position.set(-1.05, 0.5, 0);
        this.group.add(leftSkirt);
        
        const rightSkirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
        rightSkirt.position.set(1.05, 0.5, 0);
        this.group.add(rightSkirt);

        // Lower body
        const lowerBodyGeometry = new THREE.BoxGeometry(1.9, 0.4, 4.3);
        const lowerBodyColor = new THREE.Color(this.settings.color);
        lowerBodyColor.multiplyScalar(0.9); // Slightly darker
        const lowerBodyMaterial = createCarPaintMaterial(lowerBodyColor);
        const lowerBody = new THREE.Mesh(lowerBodyGeometry, lowerBodyMaterial);
        lowerBody.position.y = 1.05;
        lowerBody.castShadow = true;
        lowerBody.receiveShadow = true;
        this.group.add(lowerBody);

        // Adjust car body based on type
        let cabinHeight = 0.7;
        let cabinLength = 2.2;
        
        if (this.settings === CAR_TYPES.sport) {
            cabinHeight = 0.6; // Lower profile for sport car
            cabinLength = 2.0; // Shorter cabin for sport car
        } else if (this.settings === CAR_TYPES.super) {
            cabinHeight = 0.5; // Even lower profile for supercar
            cabinLength = 1.8; // Even shorter cabin for supercar
        }

        // Car cabin with sleeker design
        const cabinGeometry = new THREE.BoxGeometry(1.8, cabinHeight, cabinLength);
        const cabinColor = new THREE.Color(this.settings.color);
        cabinColor.multiplyScalar(0.8); // Darker for cabin
        const cabinMaterial = new THREE.MeshStandardMaterial({ 
            color: cabinColor,
            metalness: 0.4,
            roughness: 0.3
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 1.6;
        cabin.position.z = 0.2; // Adjusted for new orientation
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        this.group.add(cabin);

        this.createWindows(cabinHeight, cabinLength);
        this.createHoodAndTrunk(createCarPaintMaterial);
    }
    
    createWindows(cabinHeight, cabinLength) {
        // Windshield with better glass effect
        const windshieldGeometry = new THREE.BoxGeometry(1.7, cabinHeight, 0.1);
        const windshieldMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xaaddff,
            transparent: true,
            opacity: 0.7,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 1.0
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.y = 1.6;
        windshield.position.z = -0.95; // Adjusted for new orientation (front)
        
        // Adjust windshield angle based on car type
        let windshieldAngle = -Math.PI * 0.12;
        if (this.settings === CAR_TYPES.sport) {
            windshieldAngle = -Math.PI * 0.15; // More angled for sport car
        } else if (this.settings === CAR_TYPES.super) {
            windshieldAngle = -Math.PI * 0.18; // Even more angled for supercar
        }
        
        windshield.rotation.x = windshieldAngle;
        windshield.castShadow = true;
        windshield.receiveShadow = true;
        this.group.add(windshield);

        // Rear window
        const rearWindowGeometry = new THREE.BoxGeometry(1.7, cabinHeight, 0.1);
        const rearWindow = new THREE.Mesh(rearWindowGeometry, windshieldMaterial);
        rearWindow.position.y = 1.6;
        rearWindow.position.z = 1.35; // Adjusted for new orientation (back)
        rearWindow.rotation.x = Math.abs(windshieldAngle); // Same angle as windshield but opposite direction
        rearWindow.castShadow = true;
        rearWindow.receiveShadow = true;
        this.group.add(rearWindow);

        // Side windows
        const sideWindowGeometry = new THREE.PlaneGeometry(cabinLength, cabinHeight * 0.8);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, windshieldMaterial);
        leftWindow.position.set(-0.91, 1.6, 0.2);
        leftWindow.rotation.y = Math.PI / 2;
        this.group.add(leftWindow);

        const rightWindow = new THREE.Mesh(sideWindowGeometry, windshieldMaterial);
        rightWindow.position.set(0.91, 1.6, 0.2);
        rightWindow.rotation.y = -Math.PI / 2;
        this.group.add(rightWindow);
    }
    
    createHoodAndTrunk(createPaintMaterial) {
        // Hood with beveled edge
        const hoodGeometry = new THREE.BoxGeometry(1.9, 0.1, 1.2);
        const hoodMaterial = createPaintMaterial(this.settings.color);
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 1.05;
        hood.position.z = -1.6; // Adjusted for new orientation (front)
        hood.castShadow = true;
        hood.receiveShadow = true;
        this.group.add(hood);

        // Hood ornament for the supercar
        if (this.settings === CAR_TYPES.super) {
            const ornamentGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
            const ornamentMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xCCCCCC,
                metalness: 1.0,
                roughness: 0.1
            });
            const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
            ornament.position.set(0, 1.16, -2.1);
            ornament.rotation.x = -Math.PI / 2;
            this.group.add(ornament);
        }

        // Trunk
        const trunkGeometry = new THREE.BoxGeometry(1.9, 0.1, 0.8);
        const trunk = new THREE.Mesh(trunkGeometry, hoodMaterial);
        trunk.position.y = 1.05;
        trunk.position.z = 1.8; // Adjusted for new orientation (back)
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.group.add(trunk);

        // Spoiler for sport and super cars
        if (this.settings === CAR_TYPES.sport || this.settings === CAR_TYPES.super) {
            const spoilerHeight = this.settings === CAR_TYPES.super ? 0.7 : 0.5;
            
            // Spoiler wings
            const spoilerGeometry = new THREE.BoxGeometry(1.9, 0.1, 0.4);
            const spoilerMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                metalness: 0.5,
                roughness: 0.5
            });
            const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
            spoiler.position.set(0, 1.3 + spoilerHeight, 2.1);
            this.group.add(spoiler);
            
            // Spoiler supports
            const supportGeometry = new THREE.BoxGeometry(0.1, spoilerHeight, 0.2);
            const leftSupport = new THREE.Mesh(supportGeometry, spoilerMaterial);
            leftSupport.position.set(-0.8, 1.3 + spoilerHeight/2, 2.0);
            this.group.add(leftSupport);
            
            const rightSupport = new THREE.Mesh(supportGeometry, spoilerMaterial);
            rightSupport.position.set(0.8, 1.3 + spoilerHeight/2, 2.0);
            this.group.add(rightSupport);
        }

        // Front grille
        const grilleGeometry = new THREE.PlaneGeometry(1.0, 0.4);
        const grilleMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.7,
            roughness: 0.3
        });
        const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
        grille.position.set(0, 0.7, -2.21);
        grille.rotation.y = 0;
        this.group.add(grille);

        // Bumpers with chrome trim
        const frontBumperGeometry = new THREE.BoxGeometry(2, 0.4, 0.3);
        const bumperMaterial = new THREE.MeshStandardMaterial({ 
            color: this.settings.color,
            metalness: 0.7,
            roughness: 0.3
        });
        const frontBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        frontBumper.position.y = 0.5;
        frontBumper.position.z = -2.2; // Adjusted for new orientation (front)
        frontBumper.castShadow = true;
        frontBumper.receiveShadow = true;
        this.group.add(frontBumper);

        // Chrome trim for front bumper
        const frontTrimGeometry = new THREE.BoxGeometry(2.1, 0.1, 0.1);
        const chromeMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            metalness: 1.0,
            roughness: 0.1
        });
        const frontTrim = new THREE.Mesh(frontTrimGeometry, chromeMaterial);
        frontTrim.position.set(0, 0.3, -2.35);
        this.group.add(frontTrim);

        const rearBumperGeometry = new THREE.BoxGeometry(2, 0.4, 0.3);
        const rearBumper = new THREE.Mesh(rearBumperGeometry, bumperMaterial);
        rearBumper.position.y = 0.5;
        rearBumper.position.z = 2.2; // Adjusted for new orientation (back)
        rearBumper.castShadow = true;
        rearBumper.receiveShadow = true;
        this.group.add(rearBumper);

        // Chrome trim for rear bumper
        const rearTrimGeometry = new THREE.BoxGeometry(2.1, 0.1, 0.1);
        const rearTrim = new THREE.Mesh(rearTrimGeometry, chromeMaterial);
        rearTrim.position.set(0, 0.3, 2.35);
        this.group.add(rearTrim);

        // License plates
        const plateGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.05);
        const plateMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF, 
            metalness: 0.1, 
            roughness: 0.8 
        });
        
        // Front plate
        const frontPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        frontPlate.position.set(0, 0.6, -2.25);
        this.group.add(frontPlate);
        
        // Rear plate
        const rearPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        rearPlate.position.set(0, 0.6, 2.25);
        this.group.add(rearPlate);
    }
    
    createWheels() {
        const wheels = this.createWheelMeshes();
        
        this.wheels.frontLeft = wheels.frontLeft;
        this.wheels.frontLeft.position.set(-1.1, 0.5, -1.5); // Front left (negative Z)
        this.group.add(this.wheels.frontLeft);

        this.wheels.frontRight = wheels.frontRight;
        this.wheels.frontRight.position.set(1.1, 0.5, -1.5); // Front right (negative Z)
        this.group.add(this.wheels.frontRight);

        this.wheels.rearLeft = wheels.rearLeft;
        this.wheels.rearLeft.position.set(-1.1, 0.5, 1.5); // Rear left (positive Z)
        this.group.add(this.wheels.rearLeft);

        this.wheels.rearRight = wheels.rearRight;
        this.wheels.rearRight.position.set(1.1, 0.5, 1.5); // Rear right (positive Z)
        this.group.add(this.wheels.rearRight);
    }
    
    createWheelMeshes() {
        // Create wheel meshes with appropriate details
        const createWheel = () => {
            const wheelGroup = new THREE.Group();
            
            // Tire width varies by car type
            let tireWidth = 0.4;
            if (this.settings === CAR_TYPES.sport) {
                tireWidth = 0.45; // Wider tires for sport car
            } else if (this.settings === CAR_TYPES.super) {
                tireWidth = 0.5; // Even wider tires for supercar
            }
            
            // Tire with better rubber texture
            const tireGeometry = new THREE.CylinderGeometry(0.5, 0.5, tireWidth, 32);
            const tireMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x222222,
                roughness: 0.9,
                metalness: 0.1
            });
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            // Rim with chrome finish
            const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, tireWidth + 0.01, 16);
            const rimMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xDDDDDD,
                metalness: 0.9,
                roughness: 0.1
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            // Inner rim with car color accent
            const innerRimGeometry = new THREE.CylinderGeometry(0.25, 0.25, tireWidth + 0.02, 16);
            const innerRimMaterial = new THREE.MeshStandardMaterial({ 
                color: this.settings.color,
                metalness: 0.8,
                roughness: 0.2
            });
            const innerRim = new THREE.Mesh(innerRimGeometry, innerRimMaterial);
            innerRim.rotation.z = Math.PI / 2;
            wheelGroup.add(innerRim);
            
            // Spokes - number varies by car type
            let spokeCount = 5;
            if (this.settings === CAR_TYPES.sport) {
                spokeCount = 7; // More spokes for sport car
            } else if (this.settings === CAR_TYPES.super) {
                spokeCount = 10; // Even more spokes for supercar
            }
            
            const spokeGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.7);
            const spokeMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xCCCCCC,
                metalness: 0.9,
                roughness: 0.1
            });
            
            for (let i = 0; i < spokeCount; i++) {
                const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
                spoke.rotation.x = Math.PI / 2;
                spoke.rotation.y = (Math.PI * 2 / spokeCount) * i;
                wheelGroup.add(spoke);
            }
            
            // Add center cap with logo
            const capGeometry = new THREE.CylinderGeometry(0.1, 0.1, tireWidth + 0.03, 16);
            const capMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x333333,
                metalness: 0.8,
                roughness: 0.2
            });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.rotation.z = Math.PI / 2;
            wheelGroup.add(cap);
            
            // Add brake calipers (visible through the spokes)
            const caliperGeometry = new THREE.BoxGeometry(0.1, tireWidth - 0.1, 0.3);
            let caliperColor = 0x880000; // Red for standard
            
            if (this.settings === CAR_TYPES.sport) {
                caliperColor = 0xee0000; // Bright red for sport
            } else if (this.settings === CAR_TYPES.super) {
                caliperColor = 0xFFCC00; // Gold for supercar
            }
            
            const caliperMaterial = new THREE.MeshStandardMaterial({ 
                color: caliperColor,
                metalness: 0.7,
                roughness: 0.3
            });
            const caliper = new THREE.Mesh(caliperGeometry, caliperMaterial);
            caliper.position.set(0, 0, 0.25);
            wheelGroup.add(caliper);
            
            return wheelGroup;
        };
        
        return {
            frontLeft: createWheel(),
            frontRight: createWheel(),
            rearLeft: createWheel(),
            rearRight: createWheel()
        };
    }
    
    createLights() {
        // Headlights with better looking projector style
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const headlightGlassMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        
        const headlightInnerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.5
        });

        // Left headlight housing
        const headlightHousingL = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16, 1, false, 0, Math.PI),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 })
        );
        headlightHousingL.rotation.x = Math.PI / 2;
        headlightHousingL.position.set(-0.7, 0.7, -2.25);
        this.group.add(headlightHousingL);

        // Left headlight - now at the front of the car with the new orientation
        const headlightL = new THREE.Mesh(headlightGeometry, headlightGlassMaterial);
        headlightL.position.set(-0.7, 0.7, -2.21); // Negative Z is now the front
        headlightL.rotation.x = Math.PI;
        this.group.add(headlightL);
        
        // Headlight inner element (projector)
        const projectorL = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            headlightInnerMaterial
        );
        projectorL.position.set(-0.7, 0.7, -2.28);
        this.group.add(projectorL);

        // Right headlight housing
        const headlightHousingR = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16, 1, false, 0, Math.PI),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 })
        );
        headlightHousingR.rotation.x = Math.PI / 2;
        headlightHousingR.position.set(0.7, 0.7, -2.25);
        this.group.add(headlightHousingR);

        // Right headlight
        const headlightR = new THREE.Mesh(headlightGeometry, headlightGlassMaterial);
        headlightR.position.set(0.7, 0.7, -2.21); // Negative Z is now the front
        headlightR.rotation.x = Math.PI;
        this.group.add(headlightR);
        
        // Headlight inner element (projector)
        const projectorR = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            headlightInnerMaterial
        );
        projectorR.position.set(0.7, 0.7, -2.28);
        this.group.add(projectorR);

        // Modern looking taillights
        const taillightGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.05);
        const taillightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });

        // Left taillight - now at the back of the car with the new orientation
        const taillightL = new THREE.Mesh(taillightGeometry, taillightMaterial);
        taillightL.position.set(-0.7, 0.7, 2.22); // Positive Z is now the back
        this.group.add(taillightL);

        // Right taillight
        const taillightR = new THREE.Mesh(taillightGeometry, taillightMaterial);
        taillightR.position.set(0.7, 0.7, 2.22); // Positive Z is now the back
        this.group.add(taillightR);
        
        // Center brake light
        const centerBrakeGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.05);
        const centerBrake = new THREE.Mesh(centerBrakeGeometry, taillightMaterial);
        centerBrake.position.set(0, 1.3, 2.22);
        this.group.add(centerBrake);

        // Add headlight spotlights
        const spotlightL = new THREE.SpotLight(0xFFFFFF, 1);
        spotlightL.position.copy(projectorL.position);
        spotlightL.angle = Math.PI / 6;
        spotlightL.penumbra = 0.2;
        spotlightL.distance = 30;
        spotlightL.castShadow = true;
        spotlightL.shadow.mapSize.width = 512;
        spotlightL.shadow.mapSize.height = 512;
        this.group.add(spotlightL);
        spotlightL.target.position.set(-0.7, 0, -10); // Point forward (negative Z)
        this.group.add(spotlightL.target);

        const spotlightR = new THREE.SpotLight(0xFFFFFF, 1);
        spotlightR.position.copy(projectorR.position);
        spotlightR.angle = Math.PI / 6;
        spotlightR.penumbra = 0.2;
        spotlightR.distance = 30;
        spotlightR.castShadow = true;
        spotlightR.shadow.mapSize.width = 512;
        spotlightR.shadow.mapSize.height = 512;
        this.group.add(spotlightR);
        spotlightR.target.position.set(0.7, 0, -10); // Point forward (negative Z)
        this.group.add(spotlightR.target);

        // Add brake lights
        this.brakeLight = new THREE.PointLight(0xFF0000, 0, 5);
        this.brakeLight.position.set(0, 0.7, 2.2); // Positive Z is now the back
        this.group.add(this.brakeLight);
    }
    
    createExhaustSystem() {
        // Exhaust pipes
        if (this.settings === CAR_TYPES.standard) {
            // Single exhaust for standard car
            const exhaustGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
            exhaustGeometry.rotateX(Math.PI / 2);
            const exhaustMaterial = new THREE.MeshStandardMaterial({
                color: 0xCCCCCC,
                metalness: 0.8,
                roughness: 0.2
            });
            const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
            exhaust.position.set(-0.5, 0.4, 2.4);
            this.group.add(exhaust);
        } else {
            // Dual exhausts for sport and super cars
            const exhaustGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
            exhaustGeometry.rotateX(Math.PI / 2);
            const exhaustMaterial = new THREE.MeshStandardMaterial({
                color: 0xCCCCCC,
                metalness: 0.8,
                roughness: 0.2
            });
            const exhaustLeft = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
            exhaustLeft.position.set(-0.6, 0.4, 2.4);
            this.group.add(exhaustLeft);
            
            const exhaustRight = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
            exhaustRight.position.set(0.6, 0.4, 2.4);
            this.group.add(exhaustRight);
        }
        
        // Create exhaust particles
        this.createExhaustParticles();
    }
    
    createExhaustParticles() {
        this.exhaustParticles = [];
        const exhaustParticleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const exhaustParticleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x888888,
            transparent: true,
            opacity: 0.7
        });

        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(exhaustParticleGeometry, exhaustParticleMaterial);
            particle.visible = false;
            particle.userData = {
                life: 0,
                maxLife: 60,
                velocity: new THREE.Vector3(0, 0, 0)
            };
            this.scene.add(particle);
            this.exhaustParticles.push(particle);
        }
    }
    
    createExtraDetails() {
        // Add any additional car details specific to each car type
    }
    
    // Method to create a new exhaust particle
    createExhaustParticle() {
        // Find an available particle
        for (const particle of this.exhaustParticles) {
            if (!particle.visible) {
                // Position at exhaust pipe - now at the back of the car
                const exhaustPos = new THREE.Vector3(-0.5, 0.5, 2.2); // Positive Z is now the back
                exhaustPos.applyMatrix4(this.group.matrixWorld);
                
                particle.position.copy(exhaustPos);
                
                // Set random velocity
                const baseVelocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    Math.random() * 0.05 + 0.05,
                    Math.random() * 0.1 + 0.1 // Positive Z direction for exhaust
                );
                baseVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
                
                particle.userData.velocity = baseVelocity;
                particle.userData.life = particle.userData.maxLife;
                particle.visible = true;
                break;
            }
        }
    }
    
    // Update exhaust particles
    updateExhaustParticles() {
        for (const particle of this.exhaustParticles) {
            if (particle.visible) {
                // Update position
                particle.position.add(particle.userData.velocity);
                
                // Apply gravity
                particle.userData.velocity.y -= 0.001;
                
                // Update life
                particle.userData.life--;
                
                // Update opacity based on life
                const opacity = particle.userData.life / particle.userData.maxLife;
                particle.material.opacity = opacity * 0.7;
                
                // Scale up slightly as it dissipates
                const scale = 1 + (1 - opacity) * 2;
                particle.scale.set(scale, scale, scale);
                
                // Hide when life is over
                if (particle.userData.life <= 0) {
                    particle.visible = false;
                }
            }
        }
    }
    
    // Methods for controlling the car
    steer(amount) {
        // Rotate front wheels for visual effect - adjusted for new orientation
        this.wheels.frontLeft.rotation.y = amount * 0.5;
        this.wheels.frontRight.rotation.y = amount * 0.5;
    }
    
    setBrakeLight(intensity) {
        this.brakeLight.intensity = intensity;
    }
    
    rotateWheels(amount) {
        this.wheels.frontLeft.children[0].rotation.x += amount;
        this.wheels.frontRight.children[0].rotation.x += amount;
        this.wheels.rearLeft.children[0].rotation.x += amount;
        this.wheels.rearRight.children[0].rotation.x += amount;
    }
    
    // Methods for positioning the car
    getPosition() {
        return this.group.position.clone();
    }
    
    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }
    
    getRotation() {
        return this.group.rotation.y;
    }
    
    setRotation(angle) {
        this.group.rotation.y = angle;
    }
    
    rotateBy(angle) {
        this.group.rotation.y += angle;
    }
} 