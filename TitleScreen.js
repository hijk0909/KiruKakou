import { GameState } from './GameState.js';

export class TitleScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScreen' });
    }

    create() {
        this.add.text(100, 100, 'TAP TO START', { fontSize: '32px', fill: '#fff' });

        // console.log(this.scene.manager.getScenes(true).map(s => s.scene.key));

        this.input.once('pointerdown', () => {

            // 念のため、他のシーンを止める
            this.scene.stop('MainScreen');
            this.scene.stop('GameOverScreen');
            this.scene.stop('GameClearScreen');
            this.scene.stop('UIScene');

            // console.log(this.scene.manager.getScenes(true).map(s => s.scene.key));

            GameState.reset(); // グローバル初期化
            this.scene.start('MainScreen');
            this.scene.launch('UIScene');
        });
    }
}
