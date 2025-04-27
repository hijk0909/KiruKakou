// GameState.js
export const GameState = {
    lives: 3,
    stage: 1,
    score: 0,
    nextExtend: 10000,
    everyExtend: 20000,
    maxStage: 17,
    energy: 0,
    maxEnergy: 100,
    posEnergy: 0,
    energyMultiple: 0,
    timer: 0,
    verticalMargin: 100,

    reset() {
        this.lives = 3;
        this.stage = 1;
        this.score = 0;
        this.nextExtend = 10000,
        this.energy = 0;
        this.energyMultiple = 0;
        this.timer = 120;
    }
};