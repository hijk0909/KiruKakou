// GameState.js
export const GameState = {
    lives: 3,
    stage: 1,
    score: 0,
    maxStage: 3,

    reset() {
        this.lives = 3;
        this.stage = 1;
        this.score = 0;
    }
};