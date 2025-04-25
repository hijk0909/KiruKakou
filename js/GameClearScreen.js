import { GameState } from './GameState.js';

export class GameClearScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'GameClearScreen' });
        this.bgm = null;
    }

    create() {

        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        this.add.text(cx, cy, 'CONGRATULATIONS', { fontSize: '48px', fill: '#0ff', stroke: '#0080ff', strokeThickness: 2}).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 50, 'TAP TO TITLE', { fontSize: '24px', fill: '#f88' }).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 70, `Final SCORE is ${GameState.score}`, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5,0.5);

        this.bgm = this.sound.add('bgm_clear', { loop: true });
        this.bgm.play();

        this.input.once('pointerdown', () => {
            this.bgm.stop();
            this.sound.play('se_tap');
            this.scene.start('TitleScreen');
        });

    }
}