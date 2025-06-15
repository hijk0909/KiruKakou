// GameState.js
export const GameState = {
    ff: 1,
    fps: 60,
    lives: 3,
    stage: 1,
    score: 0,
    nextExtend: 20000,
    everyExtend: 50000,
    maxStage: 17,
    energy: 0,
    maxEnergy: 100,
    posEnergy: 0,
    posTimer: 0,
    energyMultiple: 0,
    timer: 0,
    maxTimer: 120,
    timerAlarm: 11,
    verticalMargin: 100,
    stopMode: false,
    tornadeMode: false,
    tornadeCount: 120,

    reset() {
        this.lives = 3;
        this.stage = 1;
        this.score = 0;
        this.nextExtend = 10000,
        this.energy = 0;
        this.energyMultiple = 0;
        this.timer = 120;
        this.stopMode = false;
        this.tornadeMode = false;
        this.tornadeCount = 120;
    }
};