export class GameClearScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'GameClearScreen' });
        this.bgm = null;
    }

    create() {
        this.add.text(100, 100, 'CONGRATULATIONS!', { fontSize: '48px', fill: '#0f0' });
        this.bgm = this.sound.add('bgm_clear', { loop: true });
        this.bgm.play();

        this.input.once('pointerdown', () => {
            this.bgm.stop();
            this.sound.play('se_tap');
            this.scene.start('TitleScreen');
        });

    }
}