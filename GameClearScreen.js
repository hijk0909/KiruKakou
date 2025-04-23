export class GameClearScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'GameClearScreen' });
    }

    create() {
        this.add.text(100, 100, 'CONGRATULATIONS!', { fontSize: '48px', fill: '#0f0' });
        this.input.once('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }
}