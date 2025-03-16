// Game constants

// Car performance settings for different car types
export const CAR_TYPES = {
    standard: {
        name: "Standard",
        maxSpeed: 1.0,
        maxReverseSpeed: 0.4,
        accelerationRate: 0.008,
        brakePower: 0.93,
        turnSpeed: 0.035,
        turnSpeedDecay: 0.7,
        friction: 0.98,
        drag: 0.9995,
        color: 0x1a75ff
    },
    sport: {
        name: "Sport",
        maxSpeed: 1.5,
        maxReverseSpeed: 0.5,
        accelerationRate: 0.012,
        brakePower: 0.94,
        turnSpeed: 0.03,
        turnSpeedDecay: 0.8,
        friction: 0.985,
        drag: 0.9997,
        color: 0xff3333
    },
    super: {
        name: "Supercar",
        maxSpeed: 2.0,
        maxReverseSpeed: 0.6,
        accelerationRate: 0.015,
        brakePower: 0.96,
        turnSpeed: 0.025,
        turnSpeedDecay: 0.9,
        friction: 0.99,
        drag: 0.9998,
        color: 0xffcc00
    }
};

// Scene constants
export const GROUND_SIZE = 1000;
export const CAMERA_HEIGHT = 3;
export const CAMERA_DISTANCE = 7;
export const CAMERA_SMOOTHING = 0.05;

// Environment constants
export const TRACK_RADIUS = 100;
export const BUILDING_TRACK_RADIUS = 150;
export const ROAD_WIDTH = 20;
export const NUM_TREES = 150;
export const NUM_BUILDINGS = 20;
export const NUM_TRACK_BUILDINGS = 12; 