// MainScreen.js
import { Character, CH_TYPE_ENEMY, CH_TYPE_FRIEND } from './Character.js';
import { Effect, EFF_TYPE_ENEMY_GET, EFF_TYPE_FRIEND_GET, EFF_TYPE_KILL, EFF_TYPE_HIT, EFF_TYPE_SCORE, EFF_TYPE_CROSS } from './Effect.js';
// import { UIScene } from './UI.js';
import { GameState } from './GameState.js';

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

const GAME_STATE_BEGIN =0;
const GAME_STATE_PLAY =1;
const GAME_STATE_CLEAR =3;
const GAME_STATE_FAILED =4;

const INTERSEC_MERGE_THRESHOLD =10;
const TIMER_SCORE_RATIO = 100;
const LIVE_BONUS = 10000;
const ENEMY_SCORE = 100;

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
        this.charGraphics = this.add.graphics(); 
        this.effGraphics = this.add.graphics(); 

        this.particles = null; //初期化

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
        
    } // End of create()

    onPointerDown(pointer) {
        // console.log(`PointerDown`);
        if ( this.gameState != GAME_STATE_PLAY){
            return;
        }
        this.pathPoints = [pointer.position.clone()];
            this.pathGraphics.clear();
            this.areaGraphics.clear();
            this.pathGraphics.lineStyle(2, 0xff0000, 0.5);
            this.pathState = PATH_STATE_MAKING;
            this.pathCounter = -1;
            this.sound.play('se_path_start');
    }

    onPointerMove(pointer){
        if ( this.gameState != GAME_STATE_PLAY){
            return;
        }
        if (pointer.isDown && (this.pathState === PATH_STATE_MAKING)) {
            this.pathPoints.push(pointer.position.clone());
            this.pathGraphics.strokePoints(this.pathPoints, false);
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
    
        // 交差数、長さ、囲み面積の計算
        const is1 = findSelfIntersections(this.pathPoints);
        this.intersections = mergeCloseIntersections(is1, INTERSEC_MERGE_THRESHOLD);
        const intersections = this.intersections
        this.pathLength = polylineLength(this.pathPoints);
        if (intersections.length === 1){
            this.loop = extractLoop(this.pathPoints, intersections[0].i1, intersections[0].i2, intersections[0].point);
            this.loopArea = Math.abs(polygonArea(this.loop));
            console.log(`loopArea: ${this.loopArea}`)
        }
    
        if (intersections.length === 1 && this.loopArea > PATH_MIN_LOOPAREA) {
        // 交差数１（囲み成立）
            this.pathState = PATH_STATE_ENCIRCLE;
            // this.pathLength = 0
            this.pathGraphics.lineStyle(4, 0x00ff00, 1.0);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.areaGraphics.fillStyle(0x00ff80, 0.8);
            this.areaGraphics.beginPath();
            this.areaGraphics.moveTo(this.loop[0].x, this.loop[0].y);
            this.loop.forEach(point => {
                this.areaGraphics.lineTo(point.x, point.y);
            });
            this.areaGraphics.closePath();
            this.areaGraphics.fillPath();
            this.pathCounter = PATH_COUNTER_ENCIRCLE;
            GameState.energyMultiple = 0;
            this.sound.play('se_path_encircle');
        } else if (intersections.length === 0 && this.pathLength > PATH_MIN_LENGTH) {
        // 交差数０（攻撃成立）
            this.pathState = PATH_STATE_HIT;
            this.loop = null
            this.loopArea = 0
            this.pathGraphics.lineStyle(20, 0xffee00, 0.5);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathGraphics.lineStyle(10, 0xffee00, 1.0);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathCounter = PATH_COUNTER_HIT;
            this.scoreMultiple = 1;
            this.sound.play('se_path_attack');
        } else {
        // 交差数２以上 または 長さ・面積 不十分（軌跡の発効は不成立）
            this.pathState = PATH_STATE_FAILED;
            this.loop = null
            this.loopArea = 0
            this.pathLength = 0
            this.pathGraphics.lineStyle(4, 0x808080, 0.5);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathCounter = PATH_COUNTER_FAILED;
            this.sound.play('se_path_fail');
            if (intersections.length > 1){
                for (const isp of intersections) {
                    // console.log(`intersection i1:${isp.i1} (${this.pathPoints[isp.i1].x},${this.pathPoints[isp.i1].y})-(${this.pathPoints[isp.i1+1].x},${this.pathPoints[isp.i1+1].y})\
                    //                           i2:${isp.i2} (${this.pathPoints[isp.i2].x},${this.pathPoints[isp.i2].y})-(${this.pathPoints[isp.i2+1].x},${this.pathPoints[isp.i2+1].y})\
                    //                           x:${isp.point.x} y:${isp.point.y}`);
                    let eff = new Effect(this);
                    eff.setType(EFF_TYPE_CROSS, new Phaser.Math.Vector2(isp.point.x, isp.point.y));
                    this.effects.push(eff);
                }
            }
        }
    
        this.ui.setIntersections(this.intersections.length);
        this.ui.setLoopArea(this.loopArea);
        this.ui.setPathLength(this.pathLength);
    } // End of confirmPath()

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
        } else if (this.gameState === GAME_STATE_PLAY){

            // 【GAME_STATE】プレイ中

            // タイマー減少
            GameState.timer = Math.max(GameState.timer - delta / 1000, 0);

            // キャラクター生成処理
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
                        GameState.energyMultiple = Math.max(GameState.energyMultiple - 1 ,1);
                    } else if ( type === CH_TYPE_FRIEND ){
                        eff.setType(EFF_TYPE_FRIEND_GET, ch.get_position());
                        GameState.energyMultiple += 1;
                    }
                    this.effects.push(eff);
                    ch.setAlive(false);
                } else if (this.pathState === PATH_STATE_HIT && pathIntersectsRect(path, square)) {
                    // 【斬られる】処理
                    const type = ch.get_type();
                    if ( type === CH_TYPE_ENEMY ){
                        let eff = new Effect(this);
                        eff.setType(EFF_TYPE_HIT, ch.get_position());
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
                        GameState.lives -= 1; // 残機を減らす
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

            // 軌跡の残存判定
            if ( this.pathCounter > 0){
                this.pathCounter -= 1;
                if ( this.pathCounter === 0 && this.pathState != PATH_STATE_MAKING){
                    this.pathGraphics.clear();
                    this.areaGraphics.clear();
                    this.pathState = PATH_STATE_NONE;
                }
            }

            // キャラクターの再描画
            this.redraw_ch();
            // 背景の再描画
            this.redraw_bg(this.season, delta);

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
                if (GameState.lives <= 0) {
                    this.scene.stop('UIScene');
                    this.scene.start('GameOverScreen');
                } else {
                    this.scene.restart(); // 同じ面をやりなおし
                }
            }

        } // End of if(this.gameState)
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
        this.charGraphics.clear();
        for (const ch of this.characters) {
            ch.draw(this.charGraphics);
        }
        this.effGraphics.clear();
        for (const eff of this.effects) {
            eff.draw(this.effGraphics);
        }
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
            this.bg.setTint(0xdddddd);
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

function mergeCloseIntersections(intersections, threshold = 5) {
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