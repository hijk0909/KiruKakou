// MainScreen.js
import { Character, CH_TYPE_ENEMY, CH_TYPE_FRIEND } from './Character.js';
import { Effect, EFF_TYPE_ENEMY_GET, EFF_TYPE_FRIEND_GET, EFF_TYPE_KILL, EFF_TYPE_HIT, EFF_TYPE_SCORE, EFF_TYPE_CROSS, EFF_TYPE_MANA } from './Effect.js';
import { GameState } from './GameState.js';

const GAME_STATE_BEGIN =0;
const GAME_STATE_PLAY =1;
const GAME_STATE_CLEAR =3;
const GAME_STATE_FAILED =4;

const PATH_STATE_NONE = 0;
const PATH_STATE_MAKING =1;
const PATH_STATE_HIT = 2;
const PATH_STATE_ENCIRCLE =3;
const PATH_STATE_FAILED =4;

const PATH_COUNTER_ENCIRCLE = 10;
const PATH_COUNTER_HIT = 120;
const PATH_COUNTER_FAILED = 60;

const PATH_MIN_LENGTH =30;
const PATH_MIN_LOOPAREA = 200;
const INTERSEC_MERGE_THRESHOLD =5; //近接する交差点を同一視する
const AREA_THRESHOLD = 10;  //小さすぎるループは交差として無視する
const PATH_MIN_DISTANCE =5; //軌跡に点を追加する時に最低限必要な距離

const TIMER_SCORE_RATIO = 100;
const LIVE_BONUS = 10000;
const ENEMY_SCORE = 100;

const TIMER_ALARM = 11;

export class MainScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScreen' });
        this.characters = [];
        this.effects = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1800;
        this.pathPoints = [];
        this.pathCounter = 0;
        this.loop = null;
        this.loopArea = 0;
        this.pathLength = 0;
        this.intersections = [];
        this.pathState = PATH_STATE_NONE;
        this.scoreMultiple = 1;
        this.gameState = GAME_STATE_BEGIN;
        this.gameStateCounter = 0;
        this.jingle = null;
        this.bgm = null;
        this.bg = null;
        this.bgs = [];
        this.season = 0;
        this.timer_alarm_counter = TIMER_ALARM;
        this.timer_alarm_se = null;
    }

    create() {

        //ステージデータの読み込み
        this.stageData = this.cache.json.get('stage_data');
        const stageInfo = this.stageData.stages[GameState.stage - 1];

        GameState.energy = 0;
        GameState.maxEnergy = stageInfo.energy_quota;
        GameState.energyMultiple = 0;
        this.scoreMultiple = 1;
        this.season = stageInfo.season;

        GameState.timer = stageInfo.timer;
        GameState.stopMode= false;

        this.spawnIntervalEnemy = stageInfo.enemy_spawn_interval;
        this.spawnIntervalFriend = stageInfo.friend_spawn_interval;
        this.spawnTimerEnemy  = this.spawnIntervalEnemy;
        this.spawnTimerFriend = this.spawnIntervalFriend;

        this.enemyMovePattern = stageInfo.enemy_move_pattern;
        this.enemyMoveSpeedMax = stageInfo.enemy_move_speed_max;
        this.enemyMoveSpeedMin = stageInfo.enemy_move_speed_min;
        this.enemyMoveParam1 = stageInfo.enemy_move_param1;
        this.enemyMoveParam2 = stageInfo.enemy_move_param2;
    
        this.friendMovePattern = stageInfo.friend_move_pattern;
        this.friendMoveSpeedMax = stageInfo.friend_move_speed_max;
        this.friendMoveSpeedMin = stageInfo.friend_move_speed_min;
        this.friendMoveParam1 = stageInfo.friend_move_param1;
        this.friendMoveParam2 = stageInfo.friend_move_param2;

        // グラフィックスの設定
        this.bg = null;
        this.bgs = [];
        this.set_background(this.season);

        this.pathGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 } });
        this.areaGraphics = this.add.graphics();
        this.effGraphics = this.add.graphics(); 

        this.starParticles = null;
        this.manaParticles = null;

        // イベントリスナーの定義
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);

        const canvas = this.game.canvas;
        canvas.removeEventListener("mouseleave", this.handleMouseLeave);
        canvas.removeEventListener("touchcancel", this.handleTouchCancel);
        this.handleMouseLeave = () => {
          this.confirmPath();
        };
        canvas.addEventListener("mouseleave", this.handleMouseLeave);
        this.handleTouchCancel = () =>{
            this.confirmPath();            
        }
        canvas.addEventListener("touchcancel", this.handleTouchCancel);

        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

        // ゲームのセットアップ
        this.scene.launch('UIScene');
        this.ui = this.scene.get('UIScene');

        this.pathPoints = [];
        this.pathState = PATH_STATE_NONE;
        this.pathCounter = PATH_COUNTER_HIT;

        this.characters = [];
        this.effects = [];

        this.gameState = GAME_STATE_BEGIN;
        this.gameStateCounter = 0;

        this.bgFrame = 0;
        this.bgFrameTimer = 0;

        this.jingle = this.sound.add('j_round_start');
        this.jingle.play({volume:0.6});

        this.timer_alarm_counter = TIMER_ALARM;
        this.timer_alarm_se = this.sound.add('se_timer');

        this.start_round();

    } // End of create()

    onPointerDown(pointer) {
        // console.log(`PointerDown`);
        if ( this.gameState != GAME_STATE_PLAY){
            return;
        }
        this.pathPoints = [pointer.position.clone()];
            this.pathGraphics.clear();
            this.areaGraphics.clear();
            this.ui.clearNG();
            this.pathGraphics.lineStyle(3, 0xff0000, 0.5);
            this.pathState = PATH_STATE_MAKING;
            this.pathCounter = -1;
            this.sound.play('se_path_start');
    }

    onPointerMove(pointer){
        if ( this.gameState != GAME_STATE_PLAY){
            return;
        }
        if (pointer.isDown && (this.pathState === PATH_STATE_MAKING)) {
            const newPoint = pointer.position.clone();
            if (this.pathPoints.length >= 1) {
                const lastPoint = this.pathPoints[this.pathPoints.length - 1];
                const distance = Phaser.Math.Distance.Between(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);    
                if (distance > PATH_MIN_DISTANCE) {
                    // console.log(`distance: ${distance}`);
                    this.pathPoints.push(newPoint);
                }
            }
            //this.pathGraphics.strokePoints(this.pathPoints, false);
            this.drawSmoothedPath(this.pathPoints);
        }
    }

    onPointerUp(pointer){
        // console.log(`PointerUp`);
        this.confirmPath();
    }

    confirmPath(){
        // console.log(`confirmPath pathState: ${this.pathState} gameState: ${this.gameState}`);
        if ( this.pathState != PATH_STATE_MAKING || this.gameState != GAME_STATE_PLAY){
            return;
        }
    
        let path_mode = 0;

        // 交差数、長さ、囲み面積の計算
        const is1 = findSelfIntersections(this.pathPoints);
        this.intersections = mergeCloseIntersections(is1, INTERSEC_MERGE_THRESHOLD);
        const intersections = this.intersections
        this.pathLength = polylineLength(this.pathPoints);
        if (intersections.length === 1){
            this.loop = extractLoop(this.pathPoints, intersections[0].i1, intersections[0].i2, intersections[0].point);
            this.loopArea = Math.abs(polygonArea(this.loop));
            // console.log(`loopArea: ${this.loopArea}`)
        }
    
        if (intersections.length === 0 && this.pathLength > PATH_MIN_LENGTH) {
            // 交差数０（攻撃成立）
            this.confirmHit();
            this.loopArea = 0
            path_mode = 0;
            GameState.stopMode = false;
        } else if (intersections.length === 1 && this.loopArea > PATH_MIN_LOOPAREA) {
            // 交差数１（囲み成立）
            this.pathState = PATH_STATE_ENCIRCLE;
            this.pathGraphics.lineStyle(4, 0x00ff00, 1.0);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.areaGraphics.fillStyle(0x00ff80, 0.8);
            this.areaGraphics.beginPath();
            // let cx = this.loop[0].x;
            // let cy = this.loop[0].y;
            let cx = 0;
            let cy = 0;
            this.areaGraphics.moveTo(this.loop[0].x, this.loop[0].y);
            this.loop.forEach(point => {
                this.areaGraphics.lineTo(point.x, point.y);
                cx += point.x
                cy += point.y
            });
            cx /= this.loop.length;
            cy /= this.loop.length;
            this.areaGraphics.closePath();
            this.areaGraphics.fillPath();
            this.pathCounter = PATH_COUNTER_ENCIRCLE;
            let eff = new Effect(this);
            eff.setType(EFF_TYPE_MANA, new Phaser.Math.Vector2(cx, cy));
            this.effects.push(eff);
            this.sound.play('se_path_encircle');
            path_mode = 1;
            GameState.energyMultiple = 1;
            GameState.stopMode = false;
        } else if (intersections.length === 1 && this.loopArea < AREA_THRESHOLD){
            // 交差数１（囲み不成立、攻撃成立）
            this.confirmHit();
            path_mode = 0;
            GameState.stopMode = false;
        } else {
        // 交差数２以上 または 長さ・面積 不十分（軌跡の発効は不成立）
            this.pathState = PATH_STATE_FAILED;
            this.loop = null
            this.pathGraphics.lineStyle(4, 0x808080, 0.5);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathCounter = PATH_COUNTER_FAILED;
            if (intersections.length > 1){
                for (const isp of intersections) {
                    let eff = new Effect(this);
                    eff.setType(EFF_TYPE_CROSS, new Phaser.Math.Vector2(isp.point.x, isp.point.y));
                    this.effects.push(eff);
                }
                this.sound.play('se_stop');
                GameState.stopMode = true;
            } else {
                this.sound.play('se_path_fail');
                GameState.stopMode = false;
            }
            path_mode = 2;
        }

        // 不成立理由の表示
        if (path_mode === 2){
            if (intersections.length > 1){
                this.ui.setIntersectionMark();
                this.loopArea = 0;
            } else if (intersections.length === 1 && this.loopArea <= PATH_MIN_LOOPAREA){
                this.ui.setLoopAreaNG();
            } else if (intersections.length === 0 && this.pathLength <= PATH_MIN_LENGTH){
                this.ui.setPathLengthNG();
                this.loopArea = 0;
            }
        }

        this.ui.setIntersections(this.intersections.length);
        this.ui.setLoopArea(this.loopArea);
        this.ui.setPathLength(this.pathLength);
    } // End of confirmPath()

    confirmHit(){
        // 攻撃処理
        this.pathState = PATH_STATE_HIT;
        this.loop = null;
        this.pathCounter = PATH_COUNTER_HIT;
        this.scoreMultiple = 1;
        this.sound.play('se_path_attack');
    }

    draw_cap(p1, p2, radius, color, alpha){
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const startAngle = angle - Math.PI * 3 / 2;
        const endAngle = startAngle + Math.PI;
        this.pathGraphics.fillStyle(color, alpha);
        this.pathGraphics.beginPath();
        this.pathGraphics.moveTo(p1.x, p1.y);
        this.pathGraphics.arc(p1.x, p1.y, radius, startAngle, endAngle);
        this.pathGraphics.closePath();
        this.pathGraphics.fillPath();
    }

    draw_hit_path(){
        if (this.pathState === PATH_STATE_HIT){
            this.pathGraphics.clear();

            const thickness1 = 20 + 60 * ( 1 - this.pathCounter / PATH_COUNTER_HIT );
            const color1 = 0xffee00;
            const alpha1 = this.pathCounter / PATH_COUNTER_HIT;

            this.pathGraphics.lineStyle(thickness1, color1, alpha1);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.draw_cap(this.pathPoints[0],this.pathPoints[1], thickness1 / 2 , color1, alpha1);
            this.draw_cap(this.pathPoints[this.pathPoints.length - 1],this.pathPoints[this.pathPoints.length - 2], thickness1 / 2 , color1, alpha1);

            const thickness2 = 10;
            const color2 = 0xffee00;
            const alpha2 = 0.9;

            this.pathGraphics.lineStyle(thickness2, color2, alpha2);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.draw_cap(this.pathPoints[0],this.pathPoints[1], thickness2 / 2 , color2, alpha2);
            this.draw_cap(this.pathPoints[this.pathPoints.length - 1],this.pathPoints[this.pathPoints.length - 2], thickness2 / 2 , color2, alpha2);
        }
    }

    update(time, delta) {
        if (this.gameState === GAME_STATE_BEGIN){

            // 【GAME_STATE】ステージ開始
            if (!this.jingle.isPlaying){
                this.gameState = GAME_STATE_PLAY;
                this.ui.stageBeginText.setVisible(false);
                this.bgm = this.sound.add('bgm_main', { loop: true });
                this.bgm.play();
                this.bgm.setVolume(0.5);
            }
            // 背景の再描画
            this.redraw_bg(this.season, delta);
        } else if (this.gameState === GAME_STATE_PLAY){

            // 【GAME_STATE】プレイ中

            // タイマー減少
            GameState.timer = Math.max(GameState.timer - delta / 1000, 0);
            if ( GameState.timer < this.timer_alarm_counter){
                this.timer_alarm_counter -= 1;
                if (!this.timer_alarm_se.isPlaying){
                    this.timer_alarm_se.play({volume:0.7});
                }
                this.ui.setTimerColor( GameState.timer / TIMER_ALARM);
            }

            if (GameState.timer === 0){
                this.gameState = GAME_STATE_FAILED;
                this.bgm.stop();
                this.jingle = this.sound.add('j_round_failed');
                this.jingle.play({volume:0.5});
                this.ui.timeOverText.setVisible(true);
            }

            // キャラクター生成処理
            if ( !GameState.stopMode ){
                this.spawnTimerEnemy += delta;
                if (this.spawnTimerEnemy >= this.spawnIntervalEnemy) {
                    this.spawnTimerEnemy = 0;
                    this.spawn_enemy();
                }
                this.spawnTimerFriend += delta;
                if (this.spawnTimerFriend >= this.spawnIntervalFriend) {
                    this.spawnTimerFriend = 0;
                    this.spawn_friend();
                }
            }  

            // キャラクター移動・当たり判定（削除が有り得るので逆順）
            for (let i = this.characters.length - 1; i >= 0; i--) {
                const ch = this.characters[i];
                ch.move();

                // 判定
                const loop = this.loop;
                const path = this.pathPoints;
                const square = ch.get_collision();
 
                if (this.pathState === PATH_STATE_ENCIRCLE && polygonIntersectsRect(loop, square)) {
                    // 【囲われる】処理
                    const type = ch.get_type();
                    let eff = new Effect(this);
                    if ( type === CH_TYPE_ENEMY ){
                        eff.setType(EFF_TYPE_ENEMY_GET, ch.get_position());
                    } else if ( type === CH_TYPE_FRIEND ){
                        eff.setType(EFF_TYPE_FRIEND_GET, ch.get_position());
                    }
                    this.effects.push(eff);
                    ch.setAlive(false);
                } else if (this.pathState === PATH_STATE_HIT && pathIntersectsRect(path, square)) {
                    // 【斬られる】処理
                    const type = ch.get_type();
                    if ( type === CH_TYPE_ENEMY ){
                        let eff = new Effect(this);
                        eff.setType(EFF_TYPE_HIT, ch.get_position());
                        eff.setParameter(Math.sqrt(this.scoreMultiple));
                        this.effects.push(eff);
                        let score = ENEMY_SCORE * this.scoreMultiple;
                        this.add_score(score);
                        this.scoreMultiple *= 2;
                        let eff2 = new Effect(this);
                        eff2.setType(EFF_TYPE_SCORE, ch.get_position());
                        eff2.setText(score.toString());
                        this.effects.push(eff2);
                        this.sound.play('se_hit_enemy');
                    } else if ( type === CH_TYPE_FRIEND ){
                        let eff = new Effect(this);
                        eff.setType(EFF_TYPE_KILL, ch.get_position());
                        this.effects.push(eff);
                        GameState.energy = Math.floor( GameState.energy / 10) * 5;
                        this.scoreMultiple = 1; //倍率リセット
                        this.sound.play('se_kill_friend');
                    }
                    ch.setAlive(false);
                } else if (this.pathState === PATH_STATE_MAKING && pathIntersectsRect(path, square)) {
                    // 作成途中で敵機に触れられた処理（ミス）
                    const type = ch.get_type();
                    if ( type === CH_TYPE_ENEMY){
                        this.gameState = GAME_STATE_FAILED;
                        this.bgm.stop();
                        this.jingle = this.sound.add('j_round_failed');
                        this.jingle.play({volume:0.5});
                        this.ui.stageFailedText.setVisible(true);
                        // console.log(`GameOver: ${this.pathState}, pathIntersects: ${pathIntersectsRect(path, square)}`);
                    }
                }
                if (!ch.isAlive()) {
                    this.characters.splice(i, 1);
                }
            } // End of for(ch)

            // エフェクトの処理（逆順で）
            for (let i = this.effects.length - 1; i >= 0; i--) {
                const eff = this.effects[i];
                eff.move();
                if (!eff.isAlive()) {
                    this.effects.splice(i, 1);
                }
            } // End of for(eff)

            // 軌跡を一定期間、残存させる
            if ( this.pathCounter > 0){
                this.pathCounter -= 1;
                if ( this.pathCounter === 0 && this.pathState != PATH_STATE_MAKING){
                    this.pathGraphics.clear();
                    this.areaGraphics.clear();
                    this.ui.clearNG();
                    this.pathState = PATH_STATE_NONE;
                }
            }

            // キャラクターの再描画
            this.redraw_ch();
            // エフェクトの再描画
            this.redraw_eff();
            // 背景の再描画
            this.redraw_bg(this.season, delta);
            // 攻撃時の軌跡の描画
            this.draw_hit_path();

            // ステージクリアの判定
            if (GameState.energy >= GameState.maxEnergy) {
                // console.log(`StageClear: ${GameState.stage}, maxStage: ${GameState.maxStage}`);
                this.gameState = GAME_STATE_CLEAR;
                this.bgm.stop();
                this.jingle = this.sound.add('j_round_clear');
                this.jingle.play({volume:0.5});
                this.ui.stageClearText.setVisible(true);
            }

        } else if (this.gameState === GAME_STATE_CLEAR){

            // 【GAME_STATE】ステージクリア

            // エフェクトの処理（逆順で）
            for (let i = this.effects.length - 1; i >= 0; i--) {
                const eff = this.effects[i];
                eff.move();
                if (!eff.isAlive()) {
                    this.effects.splice(i, 1);
                }
            }
            // エフェクトの再描画
            this.redraw_eff();
            // 背景の再描画
            this.redraw_bg(this.season, delta);

            if ( GameState.timer > 1){
                GameState.timer -= 1; //残タイムボーナス
                this.add_score(TIMER_SCORE_RATIO);
            }
            if ( GameState.lives >= 1 && GameState.stage >= GameState.maxStage){
                GameState.lives -= 1; //残機ボーナス
                this.add_score(LIVE_BONUS);
            }
            if ( !this.jingle.isPlaying){
               if (GameState.stage >= GameState.maxStage) {
                    this.scene.stop('UIScene');
                    this.scene.start('GameClearScreen');
                 } else {
                    GameState.stage += 1;
                    this.add_score(Math.floor(GameState.timer) * TIMER_SCORE_RATIO)
                    this.scene.restart(); // 次ステージでプレイ継続
                }
            }

        } else if (this.gameState === GAME_STATE_FAILED){

            // 【GAME_STATE】クリア失敗

            if ( !this.jingle.isPlaying){
                GameState.lives -= 1; // 残機を減らす
                if (GameState.lives < 0) {
                    this.scene.stop('UIScene');
                    this.scene.start('GameOverScreen');
                } else {
                    this.scene.restart(); // 同じ面をやりなおし
                }
            }

        } // End of if(this.gameState)

        // 隠しキーボード操作
        if (this.keyZ.isDown) {
            GameState.stopMode = true;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)){
            if (this.bgm){
                this.bgm.stop();
            }
            if (this.jingle){
                this.jingle.stop();
            }
            this.scene.stop('UIScene');
            this.scene.start('TitleScreen');
        }

    } // End of update()

    destroy(){
        console.log(`destroy`);
        const canvas = this.game.canvas;
        if (canvas) {
            canvas.removeEventListener("mouseleave", this.handleMouseLeave);
            canvas.removeEventListener("touchcancel", this.handleTouchCancel);
        }
        super.destroy();
    }

    // キャラクターの生成処理
    spawn_enemy() {
        // 敵（左辺）の生成
        const h = this.game.canvas.height;
        const y = Phaser.Math.Between(GameState.verticalMargin, h - GameState.verticalMargin);
        const sp = Phaser.Math.FloatBetween(this.enemyMoveSpeedMin, this.enemyMoveSpeedMax);
        let enemy = new Character(this);
        enemy.setType(CH_TYPE_ENEMY, new Phaser.Math.Vector2(0, y));
        enemy.setParameter(sp,this.enemyMovePattern,this.enemyMoveParam1,this.enemyMoveParam2);
        this.characters.push(enemy);
        // console.log(`Spawn Enemy speed: ${sp}, Pattern: ${this.enemyMovePattern}`);
    }

    spawn_friend(){
        // 味方（右辺）の生成
        const h = this.game.canvas.height;
        const y = Phaser.Math.Between(GameState.verticalMargin, h - GameState.verticalMargin);
        const sp = Phaser.Math.FloatBetween(this.friendMoveSpeedMin, this.friendMoveSpeedMax);
        let friend = new Character(this);
        friend.setType(CH_TYPE_FRIEND, new Phaser.Math.Vector2(this.game.canvas.width, y));
        friend.setParameter(sp,this.friendMovePattern,this.friendMoveParam1,this.friendMoveParam2);
        this.characters.push(friend);
        // console.log(`Spawn Friend speed: ${sp}, Pattern: ${this.friendMovePattern}`);
    }

    // キャラの再描画（軌跡の描画は含まない）
    redraw_ch() {
        for (const ch of this.characters) {
            ch.draw();
        }
    }

    // エフェクトの再描画
    redraw_eff(){
        this.effGraphics.clear();
        for (const eff of this.effects) {
            eff.draw(this.effGraphics);
        }
    }

    // 軌跡のベジェ補完描画
    drawSmoothedPath(points) {
        if (points.length < 2) {
            return;
        }
    
        const graphics = this.pathGraphics;
        graphics.clear();
        graphics.lineStyle(3, 0xff0000);
    
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
    
        const divisions = 10; // 1区間あたり何分割するか
    
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1] || points[i];
            const p3 = points[i + 2] || p2;
    
            for (let j = 0; j <= divisions; j++) {
                const t = j / divisions;
                const t2 = t * t;
                const t3 = t2 * t;
    
                const x = 0.5 * ((2 * p1.x) +
                                (-p0.x + p2.x) * t +
                                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
                const y = 0.5 * ((2 * p1.y) +
                                (-p0.y + p2.y) * t +
                                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    
                graphics.lineTo(x, y);
            }
        }
    
        graphics.strokePath();
    }


    // 点数の加算
    add_score(val){
        GameState.score += val;
        if (GameState.stage < GameState.maxStage || this.gameState != GAME_STATE_CLEAR){
            if (GameState.score >= GameState.nextExtend){
                GameState.lives += 1;
                this.sound.play('se_extend');
                GameState.nextExtend += GameState.everyExtend;
            }
        }
    }

    // 背景の設定
    set_background(season){
        if (season === 0){
            this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg_spring').setOrigin(0);
       } else if (season === 1){
            for (let i = 0; i <= 7; i++) {
                this.bgs[i] = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg_summer', i).setOrigin(0);
            }
            this.bgFrame = 0;
            this.bgFrameTimer = 0;
       } else if (season === 2){
            this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg_autumn').setOrigin(0);
            this.bg.setTint(0xaaaaaa);
       } else if (season === 3){
            this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg_winter').setOrigin(0);
            this.bg.setTint(0xcccccc);
       }
    }
    redraw_bg(season, delta){
        if (season === 1){
            this.bgFrameTimer += delta;
            // console.log(`redraw_bg ${this.bgFrame}`);
            if (this.bgFrameTimer >= 125) {  // 8fps = 125ms
                this.bgFrameTimer = 0;
                this.bgFrame = (this.bgFrame + 1) % 8;
                this.bgs.forEach((tile, index) => {
                    tile.setVisible(index === this.bgFrame);
                });
            }
        }
    }

    // ラウンドスタート時の演出
    start_round(){
        // 黒のオーバーレイ
        this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1)
            .setOrigin(0)
            .setDepth(100);

        // マスク用グラフィクス
        let revealMaskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        let mask = revealMaskGraphics.createGeometryMask();
        mask.invertAlpha = true;
        this.overlay.setMask(mask);

        // 半径を変えるオブジェクト
        let maskData = { radius: 1 };

        // Tweenで半径を増やす（例：500 → 画面全体に広がる）
        this.tweens.add({
            targets: maskData,
            radius: 500,
            duration: 2000,
            ease: 'Sine.easeOut',
            onUpdate: () => {
                revealMaskGraphics.clear();
                revealMaskGraphics.fillStyle(0xffffff);
                revealMaskGraphics.beginPath();
                revealMaskGraphics.arc(this.scale.width / 2, this.scale.height / 2, maskData.radius, 0, Math.PI * 2);
                revealMaskGraphics.fillPath();
            },
            onComplete: () => {
                this.overlay.destroy();  // 演出後はマスクと覆いを削除
            }
        });
    }
}

function findSelfIntersections(points) {
    const intersections = [];
    for (let i = 0; i < points.length - 2; i++) {
        for (let j = i + 2; j < points.length - 1; j++) {
            if (i === 0 && j === points.length - 2) continue;
            const pt = segmentsIntersectionPoint(points[i], points[i + 1], points[j], points[j + 1]);
            if (pt) {
                intersections.push({ i1: i, i2: j, point: pt });
            }
        }
    }
    return intersections;
}

function segmentsIntersectionPoint(p1, p2, q1, q2) {
    const d = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
    if (d === 0) return null; // 平行で交差しない
    
    const t = ((q1.x - p1.x) * (q2.y - q1.y) - (q1.y - p1.y) * (q2.x - q1.x)) / d;
    const u = ((q1.x - p1.x) * (p2.y - p1.y) - (q1.y - p1.y) * (p2.x - p1.x)) / d;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const rx = p1.x + t * (p2.x - p1.x);
        const ry = p1.y + t * (p2.y - p1.y);
        return { x: rx, y: ry };
    }
    return null;
}

function extractLoop(points, i1, i2, intersection) {
    const loop = [];
    loop.push(intersection); // 交点からスタート
    for (let i = i1 + 1; i <= i2; i++) {
        loop.push(points[i]);
    }
    loop.push(intersection); // 交点に戻る
    return loop;
}

function mergeCloseIntersections(intersections, threshold) {
    const merged = [];
    for (const inter of intersections) {
        // console.log(`all:inter.rx:${inter.point.x} inter.ry:${inter.point.y}`);
        const similar = merged.find(m =>
            Math.hypot(m.point.x - inter.point.x, m.point.y - inter.point.y) < threshold
        );
        if (!similar) {
            merged.push(inter);
            // console.log(`merge:inter.rx:${inter.point.x} inter.ry:${inter.point.y}`);
        }
    }
    return merged;
}

    function polygonArea(points) {
        let area = 0;
        for (let i = 0; i < points.length - 1; i++) {
            area += (points[i].x * points[i + 1].y - points[i + 1].x * points[i].y);
        }
        return area / 2;
    }

    function polylineLength(points) {
        let length = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            const dy = points[i + 1].y - points[i].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    function pathIntersectsRect(pathPoints, rect) {
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];
            if (Phaser.Geom.Intersects.LineToRectangle(
                new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y), rect)) {
                return true;
            }
        }
        return false;
    }

    function polygonIntersectsRect(polygonPoints, rect) {
        const polygon = new Phaser.Geom.Polygon(polygonPoints);
        // 矩形の4隅のうちどれかがポリゴン内部にあるか
        const corners = [
            new Phaser.Geom.Point(rect.x, rect.y),
            new Phaser.Geom.Point(rect.x + rect.width, rect.y),
            new Phaser.Geom.Point(rect.x + rect.width, rect.y + rect.height),
            new Phaser.Geom.Point(rect.x, rect.y + rect.height)
        ];
        for (const corner of corners) {
            if (Phaser.Geom.Polygon.Contains(polygon, corner.x, corner.y)) {
                return true;
            }
        }
        // ポリゴンの頂点のうちどれかが矩形内部にあるか
        for (const p of polygonPoints) {
            if (Phaser.Geom.Rectangle.ContainsPoint(rect, p)) {
                return true;
           }
        }
        // ポリゴンの辺と矩形の辺が交差しているか
        for (let i = 0; i < polygonPoints.length - 1; i++) {
            const line = new Phaser.Geom.Line(polygonPoints[i].x, polygonPoints[i].y, polygonPoints[i + 1].x, polygonPoints[i + 1].y);
            if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) {
                return true;
            }
        }
        return false;
    }