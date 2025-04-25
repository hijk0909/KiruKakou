export class GameOverScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScreen' });
    }

    create() {
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        this.add.text(cx, cy, 'GAME OVER', { fontSize: '48px', fill: '#f00' }).setOrigin(0.5, 0.5);
        this.add.text(cx, cy + 50, 'TAP TO TITLE', { fontSize: '24px', fill: '#f88' }).setOrigin(0.5,0.5);
        this.input.once('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }
}