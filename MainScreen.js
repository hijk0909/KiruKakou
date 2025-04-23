// MainScreen.js
import { Character, CH_TYPE_ENEMY, CH_TYPE_FRIEND } from './Character.js';
import { Effect, EFF_TYPE_ENEMY_GET, EFF_TYPE_FRIEND_GET, EFF_TYPE_KILL, EFF_TYPE_HIT, EFF_TYPE_SCORE, EFF_TYPE_CROSS } from './Effect.js';
import { UIScene } from './UI.js';
import { GameState } from './GameState.js';

const PATH_STATE_NONE = 0;
const PATH_STATE_MAKING =1;
const PATH_STATE_HIT = 2;
const PATH_STATE_ENCIRCLE =3;
const PATH_STATE_FAILED =4;

const PATH_COUNTER_ENCIRCLE = 10;
const PATH_COUNTER_HIT = 120;
const PATH_COUNTER_FAILED = 60;

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
    }

    preload() {
        // アセット読み込みがあればここに記述
    }

    create() {
        this.pathGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 } });
        this.areaGraphics = this.add.graphics();
        this.charGraphics = this.add.graphics(); 
        this.effGraphics = this.add.graphics(); 

        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);

        this.scene.launch('UIScene');
        this.ui = this.scene.get('UIScene');

        this.pathPoints = [];
        this.pathState = PATH_STATE_NONE;
        this.pathCounter = PATH_COUNTER_HIT;

        this.characters = [];
        this.effects = [];

        GameState.energy = 0;
        this.scoreMultiple = 1;

        if (GameState.stage === 1){
            this.spawnInterval = 1800;
        } else {
            this.spawnInterval = 1000;
        }
        this.spawnTimer = this.spawnInterval;
    }

    onPointerDown(pointer) {
        // console.log(`PointerDown`);
        this.pathPoints = [pointer.position.clone()];
            this.pathGraphics.clear();
            this.areaGraphics.clear();
            this.pathGraphics.lineStyle(2, 0xff0000, 0.5);
            this.pathState = PATH_STATE_MAKING;
            this.pathCounter = -1;
    }

    onPointerMove(pointer){
        if (pointer.isDown && (this.pathState === PATH_STATE_MAKING)) {
            this.pathPoints.push(pointer.position.clone());
            this.pathGraphics.strokePoints(this.pathPoints, false);
        }
    }

    onPointerUp(pointer){
        // console.log(`PointerUp`);
        if ( this.pathState != PATH_STATE_MAKING){
            return;
        }

        // 交差の検出
        const is1 = findSelfIntersections(this.pathPoints);
        this.intersections = mergeCloseIntersections(is1, 5);
        const intersections = this.intersections

        if (intersections.length === 1) {
        // 交差数１（囲み成立）
            this.pathState = PATH_STATE_ENCIRCLE;
            this.loop = extractLoop(this.pathPoints, intersections[0].i1, intersections[0].i2, intersections[0].point);
            this.loopArea = Math.abs(polygonArea(this.loop));
            this.pathLength = 0
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
        } else if (intersections.length === 0) {
        // 交差数０（攻撃成立）
            this.pathState = PATH_STATE_HIT;
            this.loop = null
            this.loopArea = 0
            this.pathLength = polylineLength(this.pathPoints);
            this.pathGraphics.lineStyle(20, 0xffee00, 0.5);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathGraphics.lineStyle(10, 0xffee00, 1.0);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathCounter = PATH_COUNTER_HIT;
            this.scoreMultiple = 1;
        } else {
        // 交差数２以上（軌跡の発効は不成立）
            this.pathState = PATH_STATE_FAILED;
            this.loop = null
            this.loopArea = 0
            this.pathLength = 0
            this.pathGraphics.lineStyle(4, 0x808080, 0.5);
            this.pathGraphics.strokePoints(this.pathPoints, false);
            this.pathCounter = PATH_COUNTER_FAILED;
            for (const isp of intersections) {
                // console.log(`intersection i1:${isp.i1} (${this.pathPoints[isp.i1].x},${this.pathPoints[isp.i1].y})-(${this.pathPoints[isp.i1+1].x},${this.pathPoints[isp.i1+1].y})\
                //                           i2:${isp.i2} (${this.pathPoints[isp.i2].x},${this.pathPoints[isp.i2].y})-(${this.pathPoints[isp.i2+1].x},${this.pathPoints[isp.i2+1].y})\
                //                           x:${isp.point.x} y:${isp.point.y}`);
                let eff = new Effect(this);
                eff.setType(EFF_TYPE_CROSS, new Phaser.Math.Vector2(isp.point.x, isp.point.y));
                this.effects.push(eff);
            }
        }

        this.ui.setIntersections(this.intersections.length);
        this.ui.setLoopArea(this.loopArea);
        this.ui.setPathLength(this.pathLength);
    } // End of onPointerUp()

    update(time, delta) {
        // キャラクター生成処理
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawn_character();
        }

        // キャラクター処理（逆順で）: 軌跡との当たり判定
        for (let i = this.characters.length - 1; i >= 0; i--) {
            const ch = this.characters[i];
            ch.move();

            // 判定
            const loop = this.loop;
            const path = this.pathPoints;
            const square = ch.get_collision();
 
            if (this.pathState === PATH_STATE_ENCIRCLE && polygonIntersectsRect(loop, square)) {
                // 囲まれた際の処理
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
                // 斬られた際の処理
                const type = ch.get_type();
                if ( type === CH_TYPE_ENEMY ){
                    let eff = new Effect(this);
                    eff.setType(EFF_TYPE_HIT, ch.get_position());
                    this.effects.push(eff);
                    let score = 100 * this.scoreMultiple;
                    GameState.score += score;
                    this.scoreMultiple *= 2;
                    let eff2 = new Effect(this);
                    eff2.setType(EFF_TYPE_SCORE, ch.get_position());
                    eff2.setText(score.toString());
                    this.effects.push(eff2);
                } else if ( type === CH_TYPE_FRIEND ){
                    let eff = new Effect(this);
                    eff.setType(EFF_TYPE_KILL, ch.get_position());
                    this.effects.push(eff);
                    GameState.score -= 200;
                    this.scoreMultiple = 1;
                }
                ch.setAlive(false);
            } else if (this.pathState === PATH_STATE_MAKING && pathIntersectsRect(path, square)) {
                // 作成途中で敵機に触れられた処理
                const type = ch.get_type();
                if ( type === CH_TYPE_ENEMY){
                    this.scene.stop('UIScene');
                    this.scene.start('GameOverScreen');
                    // console.log(`GameOver: ${this.pathState}, pathIntersects: ${pathIntersectsRect(path, square)}`);
                }
            }
            if (!ch.isAlive()) {
                this.characters.splice(i, 1);
            }
        }
        // エフェクトの処理（逆順で）
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const eff = this.effects[i];
            eff.move();
            if (!eff.isAlive()) {
                this.effects.splice(i, 1);
            }
        }

        // 軌跡の残存
        if ( this.pathCounter > 0){
            this.pathCounter -= 1;
            if ( this.pathCounter === 0 && this.pathState != PATH_STATE_MAKING){
                this.pathGraphics.clear();
                this.areaGraphics.clear();
                this.pathState = PATH_STATE_NONE;
            }
        }

        // キャラクターの再描画
        this.redraw();

        // ゲームオーバー
        if (GameState.lives <= 0) {
            this.scene.stop('UIScene');
            this.scene.start('GameOverScreen');
        }

        // ステージクリア
        if (GameState.energy >= GameState.maxEnergy) {
            GameState.stage += 1;
            // console.log(`StageClear: ${GameState.stage}, maxStage: ${GameState.maxStage}`);
            if (GameState.stage > GameState.maxStage) {
                this.scene.stop('UIScene');
                this.scene.start('GameClearScreen');
            } else {
                this.scene.restart(); // 次ステージへ
            }
        }

    } // End of update()

    // キャラクターの生成処理
    spawn_character() {
        const h = this.game.canvas.height;
        const y = Phaser.Math.Between(50, h - 50);

        // 敵（左辺）
        let enemy = new Character(this);
        enemy.setType(CH_TYPE_ENEMY, new Phaser.Math.Vector2(0, y));
        this.characters.push(enemy);

        // 味方（右辺）
        let friend = new Character(this);
        friend.setType(CH_TYPE_FRIEND, new Phaser.Math.Vector2(this.game.canvas.width, y));
        this.characters.push(friend);
    }

    // キャラの再描画（軌跡の描画は含まない）
    redraw() {
        this.charGraphics.clear();
        for (const ch of this.characters) {
            ch.draw(this.charGraphics);
        }
        this.effGraphics.clear();
        for (const eff of this.effects) {
            eff.draw(this.effGraphics);
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