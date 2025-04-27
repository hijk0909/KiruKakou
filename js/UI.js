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
   
        const cw = this.game.canvas.width;
        const ch = this.game.canvas.height;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
  
        const style1 = { font: '16px Arial', fill: '#ffffff' };
        const rx = cw - 160;
        this.intersectionsText = this.add.text(rx, 30, '交差数：0', style1);
        this.pathLengthText    = this.add.text(rx, 50, '軌跡の長さ：0', style1);
        this.loopAreaText      = this.add.text(rx, 70, '囲みの面積：0', style1);

        const style2 = { font: '24px Arial', fill: '#ffffff', shadow: {offsetX : 2, offsetY: 2, color : '#0ee', blur:0, fill: true, stroke: false }};
        this.scoreText         = this.add.text(10, 30, 'SCORE：0', style2);
        this.energyText        = this.add.text(cx, 30, 'MANA：0 / 0', style2).setOrigin(0.5,0);
        this.timerText         = this.add.text(10, ch-40, 'TIMER：0', style2).setOrigin(0,1);
        this.stageText         = this.add.text(10, ch-10, 'STAGE：0', style2).setOrigin(0,1);
        this.livesText         = this.add.text(cw - 10, ch-10, 'LIVES：0', style2).setOrigin(1,1);

        const style3 = { font: '48px Arial', fill: '#ffff00', stroke: '#ff0000', strokeThickness: 2};
        this.stageBeginText    = this.add.text(cx,cy, 'ROUND START', style3).setOrigin(0.5, 0.5);
        this.stageBeginText.setVisible(true);
        this.stageClearText    = this.add.text(cx,cy, 'ROUND CLEAR', style3).setOrigin(0.5, 0.5);
        this.stageClearText.setVisible(false);
        this.stageFailedText   = this.add.text(cx,cy, 'FAILED',style3).setOrigin(0.5,0.5);
        this.stageFailedText.setVisible(false);

        this.uiGraphics = this.add.graphics(); 
        this.uiSparkGraphics = this.add.graphics();
    }

    update(time, delta) {
        this.score = GameState.score;
        this.scoreText.setText(`SCORE：${GameState.score}`);
        this.energyText.setText(`MANA：${GameState.energy} / ${GameState.maxEnergy}`);
        this.timerText.setText(`TIMER：${Math.floor(GameState.timer)}`); 
        this.stageText.setText(`STAGE：${GameState.stage}`); 
        this.livesText.setText(`LIVES：${GameState.lives}`);    

        GameState.posEnergy = this.game.canvas.width * GameState.energy / GameState.maxEnergy;
        this.uiGraphics.clear();
        this.uiGraphics.fillStyle(0xffe000, 0.5);
        this.uiGraphics.fillRect(0, 5, GameState.posEnergy, 20);
    }

    setIntersections(val) {
        this.intersections = val;
        this.intersectionsText.setText(`交差数：${val}`);
    }

    setPathLength(val) {
        this.pathLength = val;
        this.pathLengthText.setText(`軌跡の長さ：${Math.round(val)}`);
    }

    setLoopArea(val) {
        this.loopArea = val;
        this.loopAreaText.setText(`囲みの面積：${Math.round(val)}`);
    }
}