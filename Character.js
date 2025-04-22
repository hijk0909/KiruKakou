// Character.js

export const CH_TYPE_ENEMY = 0;
export const CH_TYPE_FRIEND = 1;

export const REACT_TYPE_ADD_SCORE = 0;
export const REACT_TYPE_POWERUP = 1;
export const REACT_TYPE_PENALTY = 2;

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.type = null;
        this.pos = new Phaser.Math.Vector2(0, 0);
        this.alive = true;
        this.collision = new Phaser.Geom.Rectangle(-10, -10, 20, 20);  // 中心からの相対矩形
    }

    setType(type, pos) {
        this.type = type;
        this.pos = pos.clone(); // Phaser.Math.Vector2
        this.alive = true;
    }

    isAlive() {
        return this.alive;
    }

    setAlive(val) {
        this.alive = val;
    }

    move() {
        if (this.type === CH_TYPE_ENEMY) {
            this.pos.x += 1;
        } else if (this.type === CH_TYPE_FRIEND) {
            this.pos.x -= 1;
        }

        const { width, height } = this.scene.game.canvas;
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            this.alive = false;
        }
    }

    draw(graphics) {
        if (this.type === CH_TYPE_ENEMY) {
            graphics.fillStyle(0xff0000, 1);
            graphics.beginPath();
            graphics.moveTo(this.pos.x, this.pos.y - 10);
            graphics.lineTo(this.pos.x - 10, this.pos.y + 10);
            graphics.lineTo(this.pos.x + 10, this.pos.y + 10);
            graphics.closePath();
            graphics.fillPath();
        } else if (this.type === CH_TYPE_FRIEND) {
            graphics.fillStyle(0x00ff00, 1);
            graphics.fillCircle(this.pos.x, this.pos.y, 10);
        }
    }

    get_collision() {
        return new Phaser.Geom.Rectangle(
            this.pos.x + this.collision.x,
            this.pos.y + this.collision.y,
            this.collision.width,
            this.collision.height
        );
    }

    get_reaction_hit() {
        return this.type === CH_TYPE_ENEMY ? REACT_TYPE_ADD_SCORE : REACT_TYPE_PENALTY;
    }

    get_reaction_encircled() {
        return this.type === CH_TYPE_ENEMY ? REACT_TYPE_PENALTY : REACT_TYPE_POWERUP;
    }
}