// GameState.js
export const GameState = {
    lives: 3,
    stage: 1,
    score: 0,
    maxStage: 2,
    energy: 0,
    maxEnergy: 100,
    posEnergy: 0,

    reset() {
        this.lives = 3;
        this.stage = 1;
        this.score = 0;
        this.energy = 0;
    }
};