// UI.js
import { GameState } from './GameState.js';

const style1 = { font: '16px Arial', fill: '#ffffff' };
const style2 = { font: '24px Arial', fill: '#ffffff', shadow: {offsetX : 2, offsetY: 2, color : '#0ee', blur:0, fill: true, stroke: false }};
const style3 = { font: '48px Arial', fill: '#ffff00', stroke: '#ff0000', strokeThickness: 2};

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.intersections = 0;
        this.pathLength = 0;
        this.loopArea = 0;
        this.stageEnd = false;
    }

    create() {
   
        const cw = this.game.canvas.width;
        const ch = this.game.canvas.height;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
  
        const rx = cw - 120;
        this.intersectionsText = this.add.text(rx, 40, 'CROSS: 0', style1).setOrigin(0,0.5);
        this.pathLengthText    = this.add.text(rx, 60, 'LENGTH: 0', style1).setOrigin(0,0.5);
        this.loopAreaText      = this.add.text(rx, 80, 'AREA: 0', style1).setOrigin(0,0.5);

        const style5 = { font: '32px Arial', fill: '#aaddff' };  
        this.intersectionMark = this.add.text(rx-20,40,'>',style5).setOrigin(0,0.5);
        this.intersectionMark.setVisible(false);

        const style4 = { font: '24px Arial', fill: '#ff0000' };   
        this.pathLengthNG = this.add.text(rx-18,60,'X',style4).setOrigin(0,0.5);
        this.pathLengthNG.setVisible(false);
        this.loopAreaNG = this.add.text(rx-18,80,'X',style4).setOrigin(0,0.5);
        this.loopAreaNG.setVisible(false);

        this.scoreText         = this.add.text(10, 30, 'SCORE：0', style2);
        this.energyText        = this.add.text(cx, 30, 'MANA：0 / 0', style2).setOrigin(0.5,0);
        this.timerText         = this.add.text(cx, ch-30, 'TIMER：0 / 0', style2).setOrigin(0.5,1);
        this.stageText         = this.add.text(10, ch-30, 'STAGE：0', style2).setOrigin(0,1);
        this.livesText         = this.add.text(cw - 10, ch-30, 'LIVES：0', style2).setOrigin(1,1);
        this.stopText          = this.add.text(cx, ch-70, 'STOP', style2).setOrigin(0.5,1);

        this.stageBeginText    = this.add.text(cx,cy, 'ROUND START', style3).setOrigin(0.5, 0.5);
        this.stageBeginText.setVisible(true);
        this.stageClearText    = this.add.text(cx,cy, 'ROUND CLEAR', style3).setOrigin(0.5, 0.5);
        this.stageClearText.setVisible(false);
        this.stageFailedText   = this.add.text(cx,cy, 'FAILED',style3).setOrigin(0.5,0.5);
        this.stageFailedText.setVisible(false);
        this.timeOverText      = this.add.text(cx,cy, 'TIME OVER',style3).setOrigin(0.5,0.5);
        this.timeOverText.setVisible(false);

        this.uiGraphics = this.add.graphics(); 
        this.uiSparkGraphics = this.add.graphics();

        this.stageEnd = false;
    }

    update(time, delta) {

        // テキストの更新
        this.score = GameState.score;
        this.scoreText.setText(`SCORE：${GameState.score}`);
        this.energyText.setText(`MANA：${GameState.energy} / ${GameState.maxEnergy}`);
        this.timerText.setText(`TIMER：${Math.floor(GameState.timer)} / ${GameState.maxTimer}`); 
        this.stageText.setText(`STAGE：${GameState.stage}`); 
        this.livesText.setText(`LIVES：${GameState.lives}`);

        this.stopText.setVisible(GameState.stopMode);

        this.setTimerColor();
        

        // グラフィックスの更新
        this.uiGraphics.clear();

        GameState.posEnergy = this.game.canvas.width * GameState.energy / GameState.maxEnergy;
        this.uiGraphics.fillStyle(0xffe000, 0.5);
        this.uiGraphics.fillRect(0, 5, GameState.posEnergy, 20);

        GameState.posTimer = this.game.canvas.width * GameState.timer / GameState.maxTimer;
        this.uiGraphics.fillRect(0, this.game.canvas.height -25, GameState.posTimer, 20);
    }

    setTimerColor(){
        if (GameState.timer < GameState.timerAlarm && !this.stageEnd ){
            let ratio = GameState.timer / GameState.timerAlarm ;

            const red = 255;
            const green = Math.round(255 * ratio);
            const blue = 0; 
        
            const shadow_red = 128;
            const shadow_green = Math.round(128 * ratio);
            const shadow_blue = 0;

            // 値を16進文字列に変換する関数
            const toHex = (value) => {
                const hex = value.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };

            // "#rrggbb" 形式に変換
            const font_color = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
            const shadow_color = `#${toHex(shadow_red)}${toHex(shadow_green)}${toHex(shadow_blue)}`;

            const style6 = { font: '24px Arial', fill: font_color, shadow: {offsetX : 2, offsetY: 2, color : shadow_color, blur:0, fill: true, stroke: false }};
            this.timerText.setStyle(style6);
        } else if (!this.stageEnd){
            this.timerText.setStyle(style2);
        }
    }

    setIntersections(val) {
        this.intersections = val;
        this.intersectionsText.setText(`CROSS: ${val}`);
    }

    setPathLength(val) {
        this.pathLength = val;
        this.pathLengthText.setText(`LENGTH: ${Math.round(val)}`);
    }

    setLoopArea(val) {
        this.loopArea = val;
        this.loopAreaText.setText(`AREA: ${Math.round(val)}`);
    }

    setIntersectionMark(){
        this.intersectionMark.setVisible(true);
    }

    setPathLengthNG(){
        this.pathLengthNG.setVisible(true);
    }

    setLoopAreaNG(){
        this.loopAreaNG.setVisible(true);
    }

    clearNG(){
        this.intersectionMark.setVisible(false);
        this.pathLengthNG.setVisible(false);
        this.loopAreaNG.setVisible(false);
    }

    setStageEnd(){
        this.stageEnd = true;
    }

}