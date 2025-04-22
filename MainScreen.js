// MainScreen.js
import { Character, CH_TYPE_ENEMY, CH_TYPE_FRIEND } from './Character.js';
import { UIScene } from './UI.js';

const PATH_STATE_NONE = 0;
const PATH_STATE_HIT = 1;
const PATH_STATE_ENCIRCLE =2;

export class MainScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScreen' });
        this.characters = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1000;
        this.pathPoints = [];
        this.loop = null;
        this.loopArea = 0;
        this.pathLength = 0;
        this.intersections = [];
        this.pathState = PATH_STATE_NONE;
    }

    preload() {
        // アセット読み込みがあればここに記述
    }

    create() {
        this.pathGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 } });
        this.charGraphics = this.add.graphics(); 

        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);

        this.scene.launch('UIScene');
        this.ui = this.scene.get('UIScene');
    }

    onPointerDown(pointer) {
            this.pathPoints = [pointer.position.clone()];
            this.pathGraphics.clear();
    }

    onPointerMove(pointer){
        if (pointer.isDown) {
            this.pathPoints.push(pointer.position.clone());
            this.pathGraphics.strokePoints(this.pathPoints, false);
        }
    }

    onPointerUp(pointer){
        // 交差の検出
        this.intersections = findSelfIntersections(this.pathPoints);
        const intersections = this.intersections

        // 交差数１（囲み）
        if (intersections.length === 1) {
            this.pathState = PATH_STATE_ENCIRCLE;
            this.loop = extractLoop(this.pathPoints, intersections[0].i1, intersections[0].i2);
            this.loopArea = Math.abs(polygonArea(this.loop));
            this.pathLength = 0
        // 交差数０（攻撃）
        } else if (intersections.length === 0) {
            this.pathState = PATH_STATE_HIT;
            this.loop = null
            this.loopArea = 0
            this.pathLength = polylineLength(this.pathPoints);
        // 交差数２以上（軌跡の発効は不成立）
        } else {
            this.pathState = PATH_STATE_NONE;
            this.loop = null
            this.loopArea = 0
            this.pathLength = 0
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
                const react = ch.get_reaction_encircled();
                // 囲まれた際の処理（まだ空でOK）
                ch.setAlive(false);
            } else if (this.pathState === PATH_STATE_HIT && pathIntersectsRect(path, square)) {
                const react = ch.get_reaction_hit();
                // 斬られた際の処理（まだ空でOK）
                ch.setAlive(false);
            }

            if (!ch.isAlive()) {
                this.characters.splice(i, 1);
            }
        }

        this.redraw();
    }

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

    redraw() {
        this.charGraphics.clear();
        // キャラ描画（軌跡の描画は含まない）
        for (const ch of this.characters) {
            ch.draw(this.charGraphics);
        }       
    }
}

    function findSelfIntersections(points) {
        const intersections = [];
        for (let i = 0; i < points.length - 2; i++) {
            for (let j = i + 2; j < points.length - 1; j++) {
                if (i === 0 && j === points.length - 2) continue;
                if (segmentsIntersect(points[i], points[i + 1], points[j], points[j + 1])) {
                    intersections.push({ i1: i, i2: j });
                }
            }
        }
        return intersections;
    }

    function segmentsIntersect(p1, p2, q1, q2) {
        const d = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
        if (d === 0) return false;
        const t = ((q1.x - p1.x) * (q2.y - q1.y) - (q1.y - p1.y) * (q2.x - q1.x)) / d;
        const u = ((q1.x - p1.x) * (p2.y - p1.y) - (q1.y - p1.y) * (p2.x - p1.x)) / d;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    function extractLoop(points, i1, i2) {
        const loop = [points[i1]];
        for (let i = i1 + 1; i <= i2; i++) {
            loop.push(points[i]);
        }
        loop.push(points[i1]);
        return loop;
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