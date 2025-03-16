import * as THREE from 'three';
import { GROUND_SIZE, TRACK_RADIUS, BUILDING_TRACK_RADIUS, ROAD_WIDTH, NUM_TREES, NUM_BUILDINGS, NUM_TRACK_BUILDINGS } from '../config/constants.js';

// Environment class for creating and managing all environment elements
export class Environment {
    constructor(scene) {
        this.scene = scene;
        
        // Create the ground, road, and other environment elements
        this.createGround();
        this.createRoad();
        this.createCircularTrack();
        this.createTrees();
        this.createBuildings();
    }
    
    createGround() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1E8449,
            side: THREE.DoubleSide
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }
    
    createRoad() {
        // Add road
        const roadWidth = ROAD_WIDTH;
        const roadLength = GROUND_SIZE;
        const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 1);
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            side: THREE.DoubleSide
        });
        this.road = new THREE.Mesh(roadGeometry, roadMaterial);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.y = 0.01; // Slightly above ground to prevent z-fighting
        this.road.receiveShadow = true;
        this.scene.add(this.road);

        // Add road markings
        this.createRoadMarkings();
    }
    
    createRoadMarkings() {
        const lineWidth = 0.5;
        const lineLength = 5;
        const lineGap = 5;
        const numLines = Math.floor(GROUND_SIZE / (lineLength + lineGap));
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

        for (let i = 0; i < numLines; i++) {
            const lineGeometry = new THREE.PlaneGeometry(lineWidth, lineLength, 1, 1);
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.y = 0.02;
            line.position.z = -GROUND_SIZE/2 + i * (lineLength + lineGap) + lineLength/2;
            line.receiveShadow = true;
            this.scene.add(line);
        }
    }
    
    createCircularTrack() {
        // Add a circular track
        const trackRadius = TRACK_RADIUS;
        const trackWidth = 15;
        const trackSegments = 64;
        const trackInnerRadius = trackRadius - trackWidth/2;
        const trackOuterRadius = trackRadius + trackWidth/2;

        const trackGeometry = new THREE.RingGeometry(trackInnerRadius, trackOuterRadius, trackSegments);
        const trackMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        this.track = new THREE.Mesh(trackGeometry, trackMaterial);
        this.track.rotation.x = -Math.PI / 2;
        this.track.position.y = 0.02;
        this.track.position.x = 200; // Position the track away from the main road
        this.track.receiveShadow = true;
        this.scene.add(this.track);

        // Add track markings
        this.createTrackMarkings(trackInnerRadius, trackOuterRadius, trackSegments);
    }
    
    createTrackMarkings(trackInnerRadius, trackOuterRadius, trackSegments) {
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const trackLineWidth = 0.5;
        const trackLineInnerRadius = trackInnerRadius + 1;
        const trackLineOuterRadius = trackOuterRadius - 1;

        const trackLineGeometry = new THREE.RingGeometry(trackLineInnerRadius, trackLineInnerRadius + trackLineWidth, trackSegments);
        const trackLine = new THREE.Mesh(trackLineGeometry, lineMaterial);
        trackLine.rotation.x = -Math.PI / 2;
        trackLine.position.y = 0.03;
        trackLine.position.x = 200;
        trackLine.receiveShadow = true;
        this.scene.add(trackLine);

        const trackOuterLineGeometry = new THREE.RingGeometry(trackLineOuterRadius - trackLineWidth, trackLineOuterRadius, trackSegments);
        const trackOuterLine = new THREE.Mesh(trackOuterLineGeometry, lineMaterial);
        trackOuterLine.rotation.x = -Math.PI / 2;
        trackOuterLine.position.y = 0.03;
        trackOuterLine.position.x = 200;
        trackOuterLine.receiveShadow = true;
        this.scene.add(trackOuterLine);
    }
    
    createTrees() {
        // Place trees around the map
        const numTrees = NUM_TREES;
        for (let i = 0; i < numTrees; i++) {
            // Random position within the ground boundaries, but away from the road
            const minDistance = 15; // Minimum distance from the road center
            let x, z;
            
            // Make sure trees are not on the road
            do {
                x = (Math.random() * GROUND_SIZE) - (GROUND_SIZE / 2);
                z = (Math.random() * GROUND_SIZE) - (GROUND_SIZE / 2);
            } while (Math.abs(x) < minDistance && Math.abs(z - 200) > minDistance); // Avoid road and circular track
            
            // Determine if it's a detailed or simple tree (for performance optimization)
            const isDetailed = Math.random() > 0.7;
            const tree = isDetailed ? this.createDetailedTree(0.7 + Math.random() * 0.6) : this.createSimpleTree(0.8 + Math.random() * 0.5);
            
            // Position the tree
            tree.position.set(x, 0, z);
            
            // Randomly rotate the tree for variety
            tree.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(tree);
        }
    }
    
    createDetailedTree(scale = 1) {
        const treeGroup = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.7 * scale, 2 * scale, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, 
            roughness: 0.9 
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1 * scale;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Tree foliage (multiple layers for more detail)
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2E8B57, 
            roughness: 0.8 
        });
        
        const foliageGeometry1 = new THREE.ConeGeometry(2 * scale, 3 * scale, 8);
        const foliage1 = new THREE.Mesh(foliageGeometry1, foliageMaterial);
        foliage1.position.y = 3 * scale;
        foliage1.castShadow = true;
        foliage1.receiveShadow = true;
        treeGroup.add(foliage1);
        
        const foliageGeometry2 = new THREE.ConeGeometry(1.5 * scale, 2.5 * scale, 8);
        const foliage2 = new THREE.Mesh(foliageGeometry2, foliageMaterial);
        foliage2.position.y = 4.5 * scale;
        foliage2.castShadow = true;
        foliage2.receiveShadow = true;
        treeGroup.add(foliage2);
        
        const foliageGeometry3 = new THREE.ConeGeometry(1 * scale, 2 * scale, 8);
        const foliage3 = new THREE.Mesh(foliageGeometry3, foliageMaterial);
        foliage3.position.y = 5.5 * scale;
        foliage3.castShadow = true;
        foliage3.receiveShadow = true;
        treeGroup.add(foliage3);
        
        return treeGroup;
    }
    
    createSimpleTree(scale = 1) {
        const treeGroup = new THREE.Group();
        
        // Simplified trunk
        const trunkGeometry = new THREE.BoxGeometry(0.6 * scale, 2 * scale, 0.6 * scale);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1 * scale;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Simplified foliage
        const foliageGeometry = new THREE.ConeGeometry(2 * scale, 4 * scale, 6);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 4 * scale;
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        treeGroup.add(foliage);
        
        return treeGroup;
    }
    
    createBuildings() {
        this.createRoadBuildings();
        this.createTrackBuildings();
    }
    
    createRoadBuildings() {
        // Add buildings along the road
        const buildingColors = [0xcccccc, 0xdddddd, 0xbbbbbb, 0x999999, 0xaaaaaa];
        const buildingCount = NUM_BUILDINGS;
        const buildingMinDistance = 15; // Minimum distance from road center
        const buildingMaxDistance = 40; // Maximum distance from road center

        for (let i = 0; i < buildingCount; i++) {
            // Alternate between left and right side of the road
            const side = (i % 2 === 0) ? -1 : 1;
            
            // Space buildings along the length of the road
            const zPosition = -GROUND_SIZE/2 + 50 + (i * 40);
            
            // Random distance from the road
            const xOffset = buildingMinDistance + Math.random() * (buildingMaxDistance - buildingMinDistance);
            const xPosition = side * xOffset;
            
            // Random building dimensions
            const width = 8 + Math.random() * 10;
            const height = 10 + Math.random() * 15;
            const depth = 8 + Math.random() * 10;
            const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
            
            const building = this.createBuilding(width, height, depth, color);
            building.position.set(xPosition, 0, zPosition);
            
            // Randomly rotate the building slightly
            building.rotation.y = (Math.random() * 0.2 - 0.1) + (side === -1 ? Math.PI/2 : -Math.PI/2);
            
            this.scene.add(building);
        }
    }
    
    createTrackBuildings() {
        // Add buildings around the circular track
        const buildingColors = [0xcccccc, 0xdddddd, 0xbbbbbb, 0x999999, 0xaaaaaa];
        const trackBuildingCount = NUM_TRACK_BUILDINGS;
        const trackRadius = BUILDING_TRACK_RADIUS; // Slightly larger than the track itself

        for (let i = 0; i < trackBuildingCount; i++) {
            const angle = (i / trackBuildingCount) * Math.PI * 2;
            const xPosition = 200 + Math.cos(angle) * trackRadius;
            const zPosition = Math.sin(angle) * trackRadius;
            
            // Random building dimensions
            const width = 10 + Math.random() * 8;
            const height = 12 + Math.random() * 20;
            const depth = 10 + Math.random() * 8;
            const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
            
            const building = this.createBuilding(width, height, depth, color);
            building.position.set(xPosition, 0, zPosition);
            
            // Rotate building to face the track
            building.rotation.y = angle + Math.PI/2;
            
            this.scene.add(building);
        }
    }
    
    createBuilding(width, height, depth, color) {
        const buildingGroup = new THREE.Group();
        
        // Main building structure
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7,
            metalness: 0.2
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        buildingGroup.add(building);
        
        // Add windows
        this.addBuildingWindows(buildingGroup, width, height, depth);
        
        // Add a roof
        const roofGeometry = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.8
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + 0.25;
        roof.castShadow = true;
        roof.receiveShadow = true;
        buildingGroup.add(roof);
        
        return buildingGroup;
    }
    
    addBuildingWindows(buildingGroup, width, height, depth) {
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x333333,
            emissiveIntensity: 0.2
        });
        
        const windowSize = 0.8;
        const windowSpacing = 1.5;
        const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
        
        // Calculate rows and columns of windows
        const rows = Math.floor(height / windowSpacing) - 1;
        const colsFront = Math.floor(width / windowSpacing) - 1;
        const colsSide = Math.floor(depth / windowSpacing) - 1;
        
        // Create windows on front and back
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < colsFront; col++) {
                // Front windows
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(
                    (col * windowSpacing) - (width / 2) + windowSpacing,
                    (row * windowSpacing) + windowSpacing,
                    depth / 2 + 0.01
                );
                buildingGroup.add(frontWindow);
                
                // Back windows
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(
                    (col * windowSpacing) - (width / 2) + windowSpacing,
                    (row * windowSpacing) + windowSpacing,
                    -depth / 2 - 0.01
                );
                backWindow.rotation.y = Math.PI;
                buildingGroup.add(backWindow);
            }
        }
        
        // Create windows on sides
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < colsSide; col++) {
                // Left side windows
                const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                leftWindow.position.set(
                    -width / 2 - 0.01,
                    (row * windowSpacing) + windowSpacing,
                    (col * windowSpacing) - (depth / 2) + windowSpacing
                );
                leftWindow.rotation.y = -Math.PI / 2;
                buildingGroup.add(leftWindow);
                
                // Right side windows
                const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                rightWindow.position.set(
                    width / 2 + 0.01,
                    (row * windowSpacing) + windowSpacing,
                    (col * windowSpacing) - (depth / 2) + windowSpacing
                );
                rightWindow.rotation.y = Math.PI / 2;
                buildingGroup.add(rightWindow);
            }
        }
    }
} 