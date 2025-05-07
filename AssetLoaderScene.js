// KiruKakou/js/AssetLoaderScene.js
export class AssetLoaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AssetLoaderScene' });
    }

    preload() {
        // ローディングバーの簡易表示
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 25, width / 2, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 15, (width / 2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // アセット
        this.load.audio('se_hit_enemy', './assets/audio/se/SE_HIT_ENEMY.mp3')
        this.load.audio('se_kill_friend', './assets/audio/se/SE_KILL_FRIEND.mp3')
        this.load.audio('se_mana_down', './assets/audio/se/SE_MANA_DOWN.mp3')
        this.load.audio('se_mana_up', './assets/audio/se/SE_MANA_UP.mp3')
        this.load.audio('se_path_attack', './assets/audio/se/SE_PATH_ATTACK.mp3')
        this.load.audio('se_path_encircle', './assets/audio/se/SE_PATH_ENCIRCLE.mp3')
        this.load.audio('se_path_fail', './assets/audio/se/SE_PATH_FAIL.mp3')
        this.load.audio('se_path_start', './assets/audio/se/SE_PATH_START.mp3')
        this.load.audio('se_tap', './assets/audio/se/SE_TAP.mp3')
        this.load.audio('se_extend', './assets/audio/se/SE_EXTEND.mp3')
        this.load.audio('se_timer', './assets/audio/se/SE_TIMER.mp3')
        this.load.audio('se_stop', './assets/audio/se/SE_STOP.mp3')

        this.load.audio('j_round_start', './assets/audio/jingle/J_ROUND_START.mp3')
        this.load.audio('j_round_failed', './assets/audio/jingle/J_ROUND_FAILED.mp3')
        this.load.audio('j_round_clear', './assets/audio/jingle/J_ROUND_CLEAR.mp3')

        this.load.audio('bgm_main', './assets/audio/bgm/BGM_MAIN.mp3')
        this.load.audio('bgm_clear', './assets/audio/bgm/BGM_CLEAR.mp3')

        //this.load.image('player', 'assets/player.png');
        //this.load.image('enemy', 'assets/enemy.png');

        this.load.spritesheet('ch_enemy', './assets/images/characters/ENEMY.png', {
            frameWidth: 360,  frameHeight: 225 });
        this.load.spritesheet('ch_friend', './assets/images/characters/FRIEND.png', {
            frameWidth: 64,  frameHeight: 64 });


        this.load.image('bg_spring', 'assets/images/backgrounds/spring_tile.png');
        this.load.spritesheet('bg_summer', 'assets/images/backgrounds/summer_tile.png', {
            frameWidth: 16,  frameHeight: 16  });
        this.load.image('bg_autumn', 'assets/images/backgrounds/autumn_tile.png');
        this.load.image('bg_winter', 'assets/images/backgrounds/winter_tile.png');

        this.load.image('btn_left', 'assets/images/buttons/btn_left.png');
        this.load.image('btn_right', 'assets/images/buttons/btn_right.png');
        this.load.image('btn_play', 'assets/images/buttons/btn_play.png');

        this.load.json('stage_data', 'assets/data/stage.json');
    }

    create() {
        // 次のシーン（タイトル画面）へ遷移
        this.scene.start('TitleScreen');
    }
}