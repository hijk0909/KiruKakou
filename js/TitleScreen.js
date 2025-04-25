import { GameState } from './GameState.js';

export class TitleScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScreen' });
    }

    create() {
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        this.add.text(cx, cy - 20, 'KIRU KAKOU', { fontSize: '64px', fill: '#ffee00' , stroke: '#ff0000', strokeThickness: 2}).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 35, 'TAP TO START', { fontSize: '24px', fill: '#f88' }).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 60, 'Copyright ©2025 Current Color Co. Ltd. All rights reserved.', { fontSize: '18px', fill: '#888' }).setOrigin(0.5,0.5);

        // console.log(this.scene.manager.getScenes(true).map(s => s.scene.key));

        this.input.once('pointerdown', () => {

            // 念のため、他のシーンを止める
            this.scene.stop('MainScreen');
            this.scene.stop('GameOverScreen');
            this.scene.stop('GameClearScreen');
            this.scene.stop('UIScene');

            // console.log(this.scene.manager.getScenes(true).map(s => s.scene.key));
            this.sound.play('se_tap');
            GameState.reset(); // グローバル初期化
            this.scene.start('MainScreen');
            this.scene.launch('UIScene');
        });
    }
}
