import { GameState } from './GameState.js';

export class TitleScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScreen' });
    }

    create() {
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        this.add.text(cx, cy - 50, 'KIRU KAKOU', { fontSize: '64px', fill: '#ffee00' , stroke: '#ff0000', strokeThickness: 2}).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 215, 'Copyright ©2025 Current Color Co. Ltd. All rights reserved.', { fontSize: '18px', fill: '#888' }).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 240, 'Version 1.2 2025.5.22.', { fontSize: '18px', fill: '#888' }).setOrigin(0.5,0.5);
        this.stageText = this.add.text(cx, cy + 150, 'STAGE：1',{ fontSize: '24px', fill: '#eee' }).setOrigin(0.5,0.5);

        const btn_play = this.add.image(cx, cy + 60, 'btn_play')
        .setOrigin(0.5,0.5)
        .setInteractive()
        .on('pointerdown', () => {this.start_game();})
        .on('pointerover', () => {btn_play.setTint(0xcccccc);})
        .on('pointerout', () => {btn_play.clearTint();});

        const btn_left = this.add.image(280, cy + 150, 'btn_left')
        .setInteractive()
        .on('pointerdown', () => {this.stage_dec();})
        .on('pointerover', () => {btn_left.setTint(0xcccccc);})
        .on('pointerout', () => {btn_left.clearTint();});

        const btn_right = this.add.image(520, cy + 150, 'btn_right')
        .setInteractive()
        .on('pointerdown', () => {this.stage_inc();})
        .on('pointerover', () => {btn_right.setTint(0xcccccc);})
        .on('pointerout', () => {btn_right.clearTint();});

        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        GameState.reset(); // グローバル初期化
    }

    stage_dec(){
        GameState.stage = Math.max(GameState.stage - 1, 1);
        this.stageText.setText(`STAGE：${GameState.stage}`);
    }
    stage_inc(){
        GameState.stage = Math.min(GameState.stage + 1, GameState.maxStage);
        this.stageText.setText(`STAGE：${GameState.stage}`);
    }

    start_game(){
            // 念のため、他のシーンを止める
            this.scene.stop('MainScreen');
            this.scene.stop('GameOverScreen');
            this.scene.stop('GameClearScreen');
            this.scene.stop('UIScene');

            // console.log(this.scene.manager.getScenes(true).map(s => s.scene.key));
            this.sound.play('se_tap');
            this.scene.start('MainScreen');
            this.scene.launch('UIScene');
    }

    update(time, delta) {
        // 隠しキーボード操作
        if (Phaser.Input.Keyboard.JustDown(this.keyC)){
            this.scene.start('GameClearScreen');
        }
    }
}
