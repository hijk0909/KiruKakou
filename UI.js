// UI.js
import { GameState } from './GameState.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.intersections = 0;
        this.pathLength = 0;
        this.loopArea = 0;
    }

    create() {
        const style = { font: '16px Arial', fill: '#ffffff' };

        const x = this.game.canvas.width - 220
        this.intersectionsText = this.add.text(x, 30, '交差数：0', style);
        this.pathLengthText    = this.add.text(x, 50, '軌跡の長さ：0', style);
        this.loopAreaText      = this.add.text(x, 70, '囲みの面積：0', style);

        this.scoreText         = this.add.text(10, 30, 'SCORE：0', style);
        this.energyText        = this.add.text(10, 50, 'MANA：0', style);
        this.stageText         = this.add.text(10, 70, 'STAGE：0', style);
        this.uiGraphics = this.add.graphics(); 
    }

    update(time, delta) {
        this.score = GameState.score;
        this.scoreText.setText(`SCORE：${GameState.score}`);
        this.energyText.setText(`MANA：${GameState.energy}`);
        this.stageText.setText(`STAGE：${GameState.stage}`);    

        GameState.posEnergy = this.game.canvas.width * GameState.energy / GameState.maxEnergy;
        this.uiGraphics.clear();
        this.uiGraphics.fillStyle(0xffe000, 1);
        this.uiGraphics.fillRect(0, 5, GameState.posEnergy, 20);
    }

    setIntersections(val) {
        this.intersections = val;
        this.intersectionsText.setText(`交差数：${val}`);
    }

    setPathLength(val) {
        this.pathLength = val;
        this.pathLengthText.setText(`軌跡の長さ：${val.toFixed(1)}`);
    }

    setLoopArea(val) {
        this.loopArea = val;
        this.loopAreaText.setText(`囲みの面積：${val.toFixed(1)}`);
    }
}