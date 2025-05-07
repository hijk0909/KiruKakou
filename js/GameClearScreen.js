import { GameState } from './GameState.js';

export class GameClearScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'GameClearScreen' });
        this.bgm = null;
    }

    create() {

        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        this.add.text(cx, cy - 40, 'CONGRATULATIONS', { fontSize: '48px', fill: '#0ff', stroke: '#0080ff', strokeThickness: 2}).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 30, 'TAP TO TITLE', { fontSize: '32px', fill: '#f88' }).setOrigin(0.5,0.5);
        this.add.text(cx, cy + 80, `Your Final SCORE is ${GameState.score}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5,0.5);

        this.bgm = this.sound.add('bgm_clear', { loop: true });
        this.bgm.play();

        this.input.once('pointerdown', () => {
            this.bgm.stop();
            this.sound.play('se_tap');
            this.scene.start('TitleScreen');
        });

        // パーティクル用イメージ
        let graphics = this.make.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 8, 8);
        graphics.generateTexture('confetti', 8, 8);

        this.particles = this.add.particles('confetti');
        this.confettiEmitter = this.particles.createEmitter({
            x: { min: 0, max: this.scale.width },
            y: 0,
            lifespan: 4000,
            speedY: { min: 40, max: 80 },
            speedX: { min: -50, max: 50 },
            angle: { min: 240, max: 300 },
            gravityY: 30,
            scale: { start: 0.6, end: 0.6 },
            rotate: { min: 0, max: 360 },
            alpha: { start: 1, end: 0 },
            quantity: 4,
            frequency: 100,
            blendMode: 'NORMAL',
            tint: [0xff9999, 0x99ccff, 0xffff99, 0xcc99ff, 0x99ffcc]
        });
    }
}