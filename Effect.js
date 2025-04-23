// Effect.js

export const EFF_TYPE_ENEMY_GET = 0;
export const EFF_TYPE_FRIEND_GET = 1;
export const EFF_TYPE_KILL = 2;

export class Effect {
    constructor(scene) {
        this.scene = scene;
        this.type = null;
        this.pos = new Phaser.Math.Vector2(0, 0);
        this.alive = true;
        this.counter = 0;
    }

    setType(type, pos) {
        this.type = type;
        this.pos = pos.clone(); // Phaser.Math.Vector2
        this.alive = true;
        if (this.type === EFF_TYPE_KILL) {
            this.counter = 60;
        }
    }

    isAlive() {
        return this.alive;
    }

    setAlive(val) {
        this.alive = val;
    }

    move() {
        if (this.type === EFF_TYPE_ENEMY_GET) {
            this.pos.y -= 10;
        } else if (this.type === EFF_TYPE_FRIEND_GET) {
            this.pos.y -= 10;
        } else if (this.type === EFF_TYPE_KILL){
            this.counter -= 1;
            if ( this.counter <= 0){
                this.alive =false;
            }
        }

        const { width, height } = this.scene.game.canvas;
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            this.alive = false;
        }
    }

    draw(graphics) {
        if (this.type === EFF_TYPE_ENEMY_GET) {
            graphics.fillStyle(0xff0000, 1);
            graphics.beginPath();
            graphics.moveTo(this.pos.x, this.pos.y - 10);
            graphics.lineTo(this.pos.x - 10, this.pos.y + 10);
            graphics.lineTo(this.pos.x + 10, this.pos.y + 10);
            graphics.closePath();
            graphics.fillPath();
        } else if (this.type === EFF_TYPE_FRIEND_GET) {
            graphics.fillStyle(0x00ff00, 1);
            graphics.fillCircle(this.pos.x, this.pos.y, 10);
        } else if (this.type === EFF_TYPE_KILL) {
            graphics.lineStyle(6, 0xff0000, 0.9);
            graphics.beginPath();
            graphics.moveTo(this.pos.x - 10, this.pos.y - 10);
            graphics.lineTo(this.pos.x + 10, this.pos.y + 10);
            graphics.moveTo(this.pos.x + 10, this.pos.y - 10);
            graphics.lineTo(this.pos.x - 10, this.pos.y + 10);
            graphics.strokePath();
        }
    }
}