export class GameOverScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScreen' });
    }

    create() {
        this.add.text(100, 100, 'GAME OVER', { fontSize: '48px', fill: '#f00' });
        this.input.once('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }
}